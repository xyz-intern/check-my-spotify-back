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
import { CommandDto } from './dto/command.dto';

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

    this.AxiosErrorInterceptor(userId);

    try {
      const response = await axios.get(url, { headers });
      const data = response.data.item;
      let artists = Object.values(data.artists);
      const artistName = artists.map(artist => artist['name']).join(', ');
      const device = await this.getDeviceId(user.accessToken, userId);

      const progress_ms = parseInt(response.data.progress_ms);
      const duration_ms = parseInt(data.duration_ms);
      const current_ms = String(duration_ms - progress_ms);

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
        return duplication.songName + "|" + duplication.artistName;
      }
      else {
        const saveTrackData = new PlaylistDto();
        saveTrackData.token = user;
        saveTrackData.albumName = data.album.name;
        saveTrackData.artistName = artistName;
        saveTrackData.songName = data.name;
        saveTrackData.count = 1;
        saveTrackData.deviceId = device;
        saveTrackData.imageUri = data.album.images.find((image) => image.height === 640).url;

        await this.playlistRepository.save(saveTrackData);
        await this.userService.sendSocketData(current_ms);
        return saveTrackData.songName + "|" + saveTrackData.artistName;
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  // 디바이스 이름 가져오기
  async getDeviceId(accessToken: string, userId: string): Promise<string> {
    let authOptions = {
      url: 'https://api.spotify.com/v1/me/player/devices',
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
      json: true
    };

    this.AxiosErrorInterceptor(userId);

    try {
      const response = await axios.get(authOptions.url, { headers: authOptions.headers });
      return response.data.devices[0].id;
    } catch (error) {
      console.log(error);
    }
  }

  // Command 실행하기
  async executeCommand(commandDto: CommandDto): Promise<string | PlaylistDto> {
    const user = await this.tokenRepository.findOne({ where: { userId: commandDto.userId } });
    if (!user) throw new CustomException("사용자를 찾을 수 없습니다", HttpStatus.NOT_FOUND);

    const deviceId = await this.getDeviceId(user.accessToken, commandDto.userId);

    let authOptions = {
      url: '',
      form: {
        'device_id': deviceId
      },
      headers: {
        Authorization: 'Bearer ' + user.accessToken
      }
    };

    switch (commandDto.command) {
      case 'play':
        authOptions.url = "https://api.spotify.com/v1/me/player/play";
        this.AxiosErrorInterceptor(commandDto.userId);
        await axios.put(authOptions.url, authOptions.form, { headers: authOptions.headers });
        return await this.getPlayingTrack(commandDto.userId);
      case 'stop':
        authOptions.url = "https://api.spotify.com/v1/me/player/pause";
        await axios.put(authOptions.url, authOptions.form, { headers: authOptions.headers });
        return "음악이 정지되었습니다.";
      case 'next':
        authOptions.url = "https://api.spotify.com/v1/me/player/next";
        await axios.post(authOptions.url, authOptions.form, { headers: authOptions.headers });
        return "다음곡으로 전환하였습니다.";
      case 'previous':
        authOptions.url = "https://api.spotify.com/v1/me/player/previous";
        axios.post(authOptions.url, authOptions.form, { headers: authOptions.headers });
        return "이전곡으로 전환하였습니다.";
      default:
        throw new CustomException("잘못된 명령어입니다.", HttpStatus.BAD_REQUEST);
    }
  }

  async AxiosErrorInterceptor(userId: string) {
    axios.interceptors.response.use(
      (response) => { return response },
      (error) => {
        if (error.response && error.response.status === 404) {
          throw new CustomException("다른 기기에서 곡이 재생/정지 중입니다.", 404);
        }
        else if (error.response.status === 401) {
          this.afterTokenExpiration(userId);
          throw new CustomException("다시 로그인해주세요", 401);
        }
        throw error;
      }
    );
  }

  async afterTokenExpiration(userId: string): Promise<void> {
    const user = await this.tokenRepository.findOne({ where: { userId } });

    if (!user) throw new CustomException('사용자를 찾을 수 없습니다', HttpStatus.NOT_FOUND);

    // 토큰이 만료되지 않았다면
    if (!user.refreshToken_expiration) {
      const updateExpire = {
        ...user,
        refreshToken_expiration: true, // false -> true
      };
      await this.tokenRepository.update(userId, updateExpire);
    }

    await this.playlistRepository.delete({ token: { userId: userId } });
    await this.tokenRepository.delete(userId);
  }



  async setVolumePersent(volume_percent: string) {
    const url = `https://api.spotify.com/v1/me/player/volume?volume_percent=${volume_percent}`
    const authOptions = {
      headers: {
        Authorization: 'Bearer ' // + user.accessToken
      }
    }

    const response = await axios.put(url, authOptions.headers);
  }


  // 가장 많이 들은 노래순
  async favoriteSongs(): Promise<object> {
    return await this.playlistRepository.find({ order: { count: 'DESC' } })
  }

  // 가장 많이 들은 아티스트
  async heardALotArtists(): Promise<object> {
    const queryBuilder = this.playlistRepository.createQueryBuilder('playlist');
    const result = await queryBuilder
      .select('playlist.artistName', 'artistName')
      .addSelect('COUNT(*)', 'playCount')
      .groupBy('playlist.artistName')
      .orderBy('playCount', 'DESC')
      .getRawMany();
    return result
  }

  // 최근에 들은 곡
  async lastSongs(): Promise<object> {
    return await this.playlistRepository.find({ order: { songId: 'DESC' } })
  }

}

