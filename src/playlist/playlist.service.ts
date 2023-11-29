import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { HttpService } from '@nestjs/axios'
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from '../user/entities/token.entity';
import { Repository } from 'typeorm';
import { Playlist } from './entities/playlist.entity';
import { PlaylistDto } from '../charts/dto/playlist.dto';
import { UserService } from '../user/user.service';
import { CustomException } from 'src/common/exception/custom.exception';
import { HttpStatus } from '@nestjs/common';
import { CommandDto } from './dto/command.dto';
import { VolumnDto } from './dto/volume.dto';
import * as PLAYLIST from '../common/constants/spotify.url';
import * as net from 'net';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    private userService: UserService,
  ) { }

  // 현재 듣고 있는 트랙 가져오기
  async getPlayingTrack(userId: string): Promise<string> {
    const user: Token = await this.tokenRepository.findOne({ where: { userId } })
    if (!user) throw new CustomException('사용자를 찾을 수 없습니다', HttpStatus.NOT_FOUND);

    const headers = {
      Authorization: 'Bearer ' + user.accessToken
    }

    this.AxiosErrorInterceptor(userId);

    try {
      const response = await axios.get(PLAYLIST.URL.GET_CURRENT_PLAYING, { headers });
      const data = response.data.item;

      let artists = Object.values(data.artists);
      const artistName = artists.map(artist => artist['name']).join(', ');
      const device = await this.getDeviceId(user.accessToken, userId);

      const progress_ms = parseInt(response.data.progress_ms); // 현재까지 들은 시간
      const duration_ms = parseInt(data.duration_ms);   // 전체시간
      const current_ms = String(duration_ms - progress_ms); // 남은 시간 

      // 같은 곡 재생
      const duplication = await this.playlistRepository.findOne({
        where: { songName: data.name, artistName: artistName }
      })

      if (duplication) {
        const updateInfo = {
          ...duplication,
          count: duplication.count + 1
        }

        await this.playlistRepository.update(updateInfo.songId, updateInfo);
        await this.sendSocketData(String(current_ms), String(duration_ms));
        return duplication.songName + "|" + duplication.artistName;
      }
      else {
        const saveTrackData: PlaylistDto = new PlaylistDto();
        saveTrackData.token = user;
        saveTrackData.albumName = data.album.name;
        saveTrackData.artistName = artistName;
        saveTrackData.songName = data.name;
        saveTrackData.count = 1;
        saveTrackData.deviceId = device;
        saveTrackData.albumImage= data.album.images.find((image) => image.height === 640).url;
        saveTrackData.artistImage = data.artists[0].id;

        await this.playlistRepository.save(saveTrackData);
        await this.sendSocketData(current_ms, String(duration_ms));
        return saveTrackData.songName + "|" + saveTrackData.artistName;
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  // Python Script와 WebSocket 통신
  async sendSocketData(current: string, progress: string) {
    const client = new net.Socket;
    const time = current + "|" + progress;
    client.connect(+process.env.SERVER_PORT, process.env.SERVER_IP, function () {
      console.log("Connected to the server");
      client.write(time);
    })
    client.on('data', function (data) {
      console.log("Received from the server data : " + data)
    })

    client.on('close', function () {
      console.log('Connection closed')
    })

    client.on('error', (err) => {
      if (err.message.includes('ECONNREFUSED')) {
        console.log('Connection refused to the server. Please check your server status or IP address.');
      } else {
        console.log('An unexpected error occurred:', err.message);
      }
    });
  }

  // 디바이스 이름 가져오기
  async getDeviceId(accessToken: string, userId: string): Promise<string> {
    const headers = {
      Authorization: 'Bearer ' + accessToken,
    }

    this.AxiosErrorInterceptor(userId);

    try {
      const response = await axios.get(PLAYLIST.URL.GET_DEVICE_ID, { headers });
      return response.data.devices[0].id;
    } catch (error) {
      console.log(error);
    }
  }

  // Command 실행하기
  async executeCommand(commandDto: CommandDto): Promise<string | PlaylistDto> {
    const user: Token = await this.tokenRepository.findOne({ where: { userId: commandDto.userId } });
    if (!user) throw new CustomException("사용자를 찾을 수 없습니다", HttpStatus.NOT_FOUND);

    const deviceId = await this.getDeviceId(user.accessToken, commandDto.userId);
    let authOptions = {
      form: {
        'device_id': deviceId
      },
      headers: {
        Authorization: 'Bearer ' + user.accessToken
      }
    };

    switch (commandDto.command) {
      case 'play':
        this.AxiosErrorInterceptor(commandDto.userId);
        await axios.put(PLAYLIST.URL.PLAYLIST_SET_PLAY, authOptions.form, { headers: authOptions.headers });
        return await this.getPlayingTrack(commandDto.userId);
      case 'stop':
        await axios.put(PLAYLIST.URL.PLAYLIST_SET_STOP, authOptions.form, { headers: authOptions.headers });
        return "음악이 정지되었습니다.";
      case 'next':
        await axios.post(PLAYLIST.URL.PLAYLIST_SET_NEXT, authOptions.form, { headers: authOptions.headers });
        return "다음곡으로 | 전환하였습니다.";
      case 'prev':
        axios.post(PLAYLIST.URL.PLAYLIST_SET_PRE, authOptions.form, { headers: authOptions.headers });
        return "이전곡으로 | 전환하였습니다.";
      default:
        throw new CustomException("잘못된 명령어입니다.", HttpStatus.BAD_REQUEST);
    }
  }

  // Exception Handler
  async AxiosErrorInterceptor(userId: string) {
    axios.interceptors.response.use(
      (response) => { return response },
      (error) => {
        if (error.response && error.response.status === 404) {
          throw new CustomException("다른 기기에서 곡이 재생/정지 중입니다.", 404);
        } else if (error.response.status === 401) {
          // this.afterTokenExpiration(userId);
          throw new CustomException("다시 로그인해주세요", 401);
        } else if (error.response.status === 204) {
          throw new CustomException("NO CONTENT", 204)
        }
        throw error;
      }
    );
  }


  // 토큰 만료 시
  async afterTokenExpiration(userId: string): Promise<void> {
    const user: Token = await this.tokenRepository.findOne({ where: { userId } });
    if (!user) throw new CustomException("사용자를 찾을 수 없습니다", HttpStatus.NOT_FOUND);

    if (!user.refreshToken_expiration) {
      const updateExpire = {
        ...user,
        refreshToken_expiration: true, // false -> true
      };
      await this.tokenRepository.update(userId, updateExpire);
    }

    // playlist, token Column 삭제
    await this.playlistRepository.delete({ token: { userId: userId } });
    await this.tokenRepository.delete(userId);
  }

  // 볼륨 조정하기
  async setVolumePersent(volumeDto: VolumnDto) : Promise<string>{
    const user: Token = await this.tokenRepository.findOne({ where: { userId: volumeDto.userId } });
    if (!user) throw new CustomException('사용자를 찾을 수 없습니다', HttpStatus.NOT_FOUND);

    let volume_percent = await this.getPlaybackState(user);
    const deviceId = await this.getDeviceId(user.accessToken, volumeDto.userId);

    if(volumeDto.volume && volume_percent === 100) return "It's already the maximum volume."
    else if (volumeDto.volume) volume_percent += 5;
    else if(volume_percent === 0 && !volumeDto.volume) return "Volume is 0%"
    else if(!volumeDto.volume) volume_percent -= 5;

    const authOptions = {
      headers: {
        Authorization: 'Bearer ' + user.accessToken
      },
      form: {
        device_id: deviceId
      }
    }
    this.AxiosErrorInterceptor(user.userId)

    try {
      await axios.put(PLAYLIST.URL.SET_PLAYBACK_VOLUME+volume_percent, authOptions.form, { headers: authOptions.headers });
      return `Volumn is ${volume_percent}%.`
    } catch (error) {
      console.log(error)
    }
  }

  // 재생 상태 가져오기
  async getPlaybackState(user: Token): Promise<number> {
    const headers = {
      Authorization: 'Bearer ' + user.accessToken
    }

    this.AxiosErrorInterceptor(user.userId);

    try {
      const response = await axios.get(PLAYLIST.URL.GET_PLAYBACK_STATE, { headers });
      return response.data.device.volume_percent;
    } catch (error) {
      console.log(error);
    }

  }
}

