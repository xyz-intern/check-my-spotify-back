import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { HttpService } from '@nestjs/axios'
import { Repository } from 'typeorm';
import { Playlist } from './entities/playlist.entity';
import { PlaylistDto } from './dto/playlist.dto';
import axios from 'axios';

@Injectable()
export class ApisService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>
  ) { }

  async getPlayingTrack(userId: string): Promise<void> {
    // 현재 듣고있는 트랙 정보 가져오기
    const user = await this.tokenRepository.findOne({ where: { userId } })

    const url = "https://api.spotify.com/v1/me/player/currently-playing"
    const headers = {
      'Authorization': 'Bearer ' + user.accessToken,
      'Content-Type': 'application/x-www-form-urlencoded'
    }

    try {
      const response = await axios.get(url, { headers });

      // 여러명의 아티스트 때 object로 저장
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

      const saveTrackData = new PlaylistDto();

      saveTrackData.userId = userId;
      saveTrackData.albumName = albumName;
      saveTrackData.artistName = artistName;
      saveTrackData.songName = songName;
      saveTrackData.imageUri = imageUri.find((image) => image.height === 640).url
      saveTrackData.deviceId = device;

      this.playlistRepository.save(saveTrackData);

    } catch (error) {
      console.error(error);
    }
  }

  async getDeviceId(accessToken: string): Promise<string> {
    let authOptions = {
      url: 'https://api.spotify.com/v1/me/player/devices',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      },
      json: true
    };

    const response = await axios.get(authOptions.url, { headers: authOptions.headers });
    const deviceId = response.data.devices[0].id;
    return deviceId;
  }


}
