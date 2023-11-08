import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from '../user/entities/token.entity';
import { Repository } from 'typeorm';
import { Playlist } from './entities/playlist.entity';
import { PlaylistDto } from './dto/playlist.dto';
import { UserService } from '../user/user.service';
import { CustomException } from 'src/common/exception/custom.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    private userService: UserService
  ) { }

  // 현재 듣고 있는 트랙 가져오기
  async getPlayingTrack(userId: string): Promise<string> {
    const user = await this.tokenRepository.findOne({ where: { userId } })

    if (!user) throw new CustomException('사용자를 찾을 수 없습니다', HttpStatus.NOT_FOUND);

    const url = "https://api.spotify.com/v1/me/player/currently-playing"
    const headers = {
      Authorization: 'Bearer ' + user.accessToken
    }

    this.AxiosErrorInterceptor();

    try {
      const response = await axios.get(url, { headers });

      let artists = response.data.item.artists;
      let singers = Object.values(artists);
      const device = await this.getDeviceId(user.accessToken);

      let results = [];

      // 다중 ArtistName 가져오기
      for (let i = 0; i < singers.length; i++) results[i] = singers[i]['name'];
      const albumName = response.data.item.album.name;
      const songName = response.data.item.name;
      const imageUri = response.data.item.album.images;
      const artistName = results.join(', ');
      const progress_ms = parseInt(response.data.progress_ms);
      const duration_ms = parseInt(response.data.item.duration_ms);
      const current_ms = String(duration_ms - progress_ms);

      const saveTrackData = new PlaylistDto();

      // 같은 곡 재생 시
      const duplication = await this.playlistRepository.findOne({
        where: { songName: songName, artistName: artistName }
      })

      // count ++
      if (duplication) {
        const updateInfo = {
          ...duplication,
          count: duplication.count + 1
        }

        this.playlistRepository.update(updateInfo.songId, updateInfo);
      }

      saveTrackData.userId = userId;
      saveTrackData.albumName = albumName;
      saveTrackData.artistName = artistName;
      saveTrackData.songName = songName;
      saveTrackData.imageUri = imageUri.find((image) => image.height === 640).url
      saveTrackData.deviceId = device;
      saveTrackData.count = 1;

      this.playlistRepository.save(saveTrackData);
      await this.userService.sendSocketData(current_ms);
      const responseData = saveTrackData.songName+"|"+ saveTrackData.artistName;
      return responseData;
    } catch (error) {
      console.log(error)
    }
  }


  // 디바이스 이름 가져오기
  async getDeviceId(accessToken: string): Promise<string> {
    let authOptions = {
      url: 'https://api.spotify.com/v1/me/player/devices',
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
      json: true
    };

    this.AxiosErrorInterceptor();

    try {
      const response = await axios.get(authOptions.url, { headers: authOptions.headers });
      const deviceId = response.data.devices[0].id;
      return deviceId;
    } catch (error) {
      console.log(error);
    }
  }


  // Command(play/stop/next/previous) 실행하기
  async executeCommand(commandId: string, userId: string): Promise<string | PlaylistDto> {
    let success = "";
    const user = await this.tokenRepository.findOne({ where: { userId } })

    if (!user) throw new CustomException("사용자를 찾을 수 없습니다", HttpStatus.NOT_FOUND);

    const deviceId = await this.getDeviceId(user.accessToken);

    let authOptions = {
      url: '',
      form: {
        'device_id': deviceId
      },
      headers: {
        Authorization: 'Bearer ' + user.accessToken
      }
    };

      if (commandId == "play") {
        authOptions.url = "https://api.spotify.com/v1/me/player/play"
        this.AxiosErrorInterceptor();
        success = await axios.put(authOptions.url, authOptions.form, { headers: authOptions.headers });
        const data = await this.getPlayingTrack(userId)
        if (success) return data;
      }
      else if (commandId == "stop") {
        authOptions.url = "https://api.spotify.com/v1/me/player/pause"
        success = await axios.put(authOptions.url, authOptions.form, { headers: authOptions.headers });
        if (success) return "음악이 정지되었습니다";
      } else if (commandId == "next") {
        authOptions.url = "https://api.spotify.com/v1/me/player/next"
        console.log(authOptions)
        success = await axios.post(authOptions.url, authOptions.form, { headers: authOptions.headers });
        if (success) return "다음곡으로 전환하였습니다";
      } else if (commandId == "previous") {
        authOptions.url = "https://api.spotify.com/v1/me/player/previous"
        success = await axios.post(authOptions.url, authOptions.form, { headers: authOptions.headers });
        if (success) return "이전곡으로 전환하였습니다";
      }
  
  }

  async AxiosErrorInterceptor() {
    axios.interceptors.response.use(
      (response) => { return response; },
      (error) => {
        if (error.response && error.response.status === 404) {
          throw new CustomException("다른 기기에서 곡이 재생되고 있습니다.", 404);
        }
        else if (error.response.status === 401) {
          throw new CustomException("토큰이 만료되었습니다", 401);
        }
        throw error;
      }
    );
  }
}


