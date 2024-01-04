import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from '../user/entities/token.entity';
import { PlaylistDto } from '../charts/dto/playlist.dto';
import { CustomException } from 'src/common/exception/custom.exception';
import { HttpStatus } from '@nestjs/common';
import { CommandDto } from './dto/command.dto';
import { VolumnDto } from './dto/volume.dto';
import * as PLAYLIST from '../common/constants/spotify.url';
import * as REQUEST from '../common/constants/request.option'
import { Playlist } from './entities/playlist.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { Music } from './dto/music.dto';
import { Artist } from './entities/artist.entity';
import { ArtistDto } from 'src/charts/dto/artist.dto';
import { Equal } from 'typeorm';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,
    private userService: UserService
  ) { }

  // 현재 듣고 있는 트랙 가져오기
  async getPlayingTrack(userId: string): Promise<any> {
    try {
      const user: Token = await this.getUserToken(userId)
      const authOptions = await this.setRequestOptions(REQUEST.OPTIONS.TRACK, user)
      const response = await axios.get(PLAYLIST.URL.GET_CURRENT_PLAYING, { headers: authOptions.headers });
      const data = response.data.item;

      let artists = Object.values(data.artists);
      const artistName = artists.map(artist => artist['name']);

      const volume = await this.getPlaybackState(user);
      const device = await this.getDeviceId(user);
      const progress_ms = parseInt(response.data.progress_ms); // 현재까지 들은 시간
      const duration_ms = parseInt(data.duration_ms);   // 전체시간
      const current_ms = String(duration_ms - progress_ms); // 남은 시간 
      
      const duplication = await this.playlistRepository.createQueryBuilder('playlist')
        .innerJoin('playlist.artist', 'artist')
        .select(['playlist.*'])
        .where('playlist.songName = :songName', { songName: data.name })
        .andWhere('artist.artistName = :artistName', { artistName: artistName[0] })
        .getRawMany();

      console.log(duplication)
      const song: Music = { current_ms, duration_ms, device, user, artistName, duplication, data }
      if (duplication.length > 0) return await this.deduplicationOfSongs(song) + "|" + volume
      return await this.saveTrackData(song) + "|" + volume
    } catch (error) {
      console.log(error);
    }
  }


  async deduplicationOfSongs(song: Music) {
    await this.deduplicationOfArtist(song);
    const updateInfo = {
      ...song.duplication[0],
      count: song.duplication[0].count + 1
    }
    await this.playlistRepository.save(updateInfo);
    await this.userService.sendSocketData(String(song.current_ms), String(song.duration_ms));
    return updateInfo.songName + "|" + song.artistName[0];
  }

  async deduplicationOfArtist(artist: Music) {
    const artists: Artist[] = await this.artistRepository.find({ where: { playlist: Equal(artist.duplication[0].songId) } });
    const updatedArtists = artists.map(artist => {
      return {
        ...artist,
        count: artist.count + 1
      };
    });
    
    await this.artistRepository.save(updatedArtists);
    await this.userService.sendSocketData(String(artist.current_ms), String(artist.duration_ms));
    return artist.duplication.songName + "|" + artist.artistName;
  }


  async saveTrackData(song: Music) {
    let artist = Object.values(song.data.artists);
    const artistName = artist.map(artist => artist['id']);
    const saveTrackData: PlaylistDto = new PlaylistDto;
    saveTrackData.token = song.user;
    saveTrackData.songName = song.data.name;
    saveTrackData.albumImage = song.data.album.images.find((image) => image.height === 640).url;
    saveTrackData.count = 1;

    const track = await this.playlistRepository.save(saveTrackData);

    for (let i = 0; i < artist.length; i++) {
      const saveArtistData: ArtistDto = new ArtistDto;
      saveArtistData.artistId = artistName[i];
      saveArtistData.artistName = song.artistName[i];
      saveArtistData.count = 1;
      saveArtistData.playlist = track;
      await this.artistRepository.save(saveArtistData)
    }

    await this.userService.sendSocketData(song.current_ms, String(song.duration_ms));
    return saveTrackData.songName + "|" + song.artistName;
  }


  // 디바이스 이름 가져오기
  async getDeviceId(user: Token): Promise<string> {
    let authOptions = await this.setRequestOptions(REQUEST.OPTIONS.DEVICE, user)
    try {
      const response = await axios.get(PLAYLIST.URL.GET_DEVICE_ID, { headers: authOptions.headers });
      return response.data.devices[0].id;
    } catch (error) {
      console.log(error)
    }
  }

  // Command 실행하기
  async executeCommand(commandDto: CommandDto): Promise<string> {
    const user: Token = await this.getUserToken(commandDto.userId);
    let authOptions = await this.setRequestOptions(REQUEST.OPTIONS.COMMAND, user);

    switch (commandDto.command) {
      case 'play':
        await this.transferUserPlayback(user);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return await this.getPlayingTrack(user.userId);
      case 'stop':
        await axios.put(PLAYLIST.URL.PLAYLIST_SET_STOP, authOptions.form, { headers: authOptions.headers });
        let volume = await this.getPlaybackState(user)
        return `stoped|${volume}`;
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

  async getUserToken(userId: string): Promise<Token> {
    const user: Token = await this.tokenRepository.findOne({ where: { userId } });
    if (!user) {
      throw new CustomException("사용자를 찾을 수 없습니다", HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async setRequestOptions(type: string, user: Token) {
    try {
      const headers = {
        'Authorization': 'Bearer ' + user.accessToken
      }

      switch (type) {
        case REQUEST.OPTIONS.TRANSFER:
          return {
            headers: { ...headers, "Content-Type": "application/json" },
            data: {
              device_ids: [`${await this.getDeviceId(user)}`],
              play: true
            }
          }
        case REQUEST.OPTIONS.COMMAND: case REQUEST.OPTIONS.VOLUME:
          return {
            headers: { ...headers },
            form: { device_id: await this.getDeviceId(user) },
          }
        default:
          return { headers: { ...headers } }
      }
    } catch (error) {
      console.log(error)
    }

  }

  async afterTokenExpiration(userId: string): Promise<string> {
    try {
      const user: Token = await this.getUserToken(userId)

      if (!user.refreshToken_expiration) {
        const updateExpire = {
          ...user,
          refreshToken_expiration: true, // false -> true
        };
        await this.tokenRepository.update(userId, updateExpire);
      }

      await this.playlistRepository.delete({ token: { userId: userId } })
      await this.tokenRepository.delete(userId);
      return "로그아웃이 완료되었습니다."
    } catch (error) {
      console.log(error)
    }
  }

  // 볼륨 조정하기
  async setVolumePersent(volumeDto: VolumnDto): Promise<string> {
    try {
      const user: Token = await this.getUserToken(volumeDto.userId)
      let authOptions = await this.setRequestOptions(REQUEST.OPTIONS.VOLUME, user)
      let volume_percent = await this.getPlaybackState(user);

      if (volumeDto.volume && volume_percent === 100) return "It's already the maximum volume." // up
      else if (volumeDto.volume) volume_percent += 5; // up
      else if (volume_percent === 0 && !volumeDto.volume) return "Volume is 0%" // down
      else if (!volumeDto.volume) volume_percent -= 5; // down

      await axios.put(PLAYLIST.URL.SET_PLAYBACK_VOLUME + volume_percent, authOptions.form, { headers: authOptions.headers });
      return `${volume_percent}%`
    } catch (error) {
      console.log(error)
    }
  }

  // 재생 상태 가져오기
  async getPlaybackState(user: Token): Promise<number> {
    try {
      let authOptions = await this.setRequestOptions(REQUEST.OPTIONS.PLAYBACK, user);
      const response = await axios.get(PLAYLIST.URL.GET_PLAYBACK_STATE, { headers: authOptions.headers });
      return response.data.device.volume_percent;
    } catch (error) {
      console.log(error)
    }
  }

  // 재생 전송
  async transferUserPlayback(user: Token): Promise<void> {
    try {
      let authOptions = await this.setRequestOptions(REQUEST.OPTIONS.TRANSFER, user);
      await axios.put(PLAYLIST.URL.TRANSFER_PLAYBACK, authOptions.data, { headers: authOptions.headers })
    } catch (error) {
      console.log(error)
    }
  }
}