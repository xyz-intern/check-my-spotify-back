import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { HttpService } from '@nestjs/axios'
import { Repository } from 'typeorm';
import { Playlist } from './entities/playlist.entity';
import { PlaylistDto } from './dto/playlist.dto';
@Injectable()
export class ApisService {
  constructor(
    private httpService: HttpService,
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>
  ) { }

  async getPlayingTrack(userId: string): Promise<void> {
    // 현재 듣고있는 트랙 정보 가져오기
    const user = await this.tokenRepository.findOne({ where: { userId } })

    let authOptions = {
      'url': 'https://api.spotify.com/v1/me/player/currently-playing?market=kr',
      headers: {
        'Authorization': 'Bearer ' + user.accessToken,
        'Content-Type': 'application/x-www-form-urlencoded,'
      },
      json: true
    };

    try {
      // HttpModule Post 요청
      const response = await this.httpService.get(authOptions.url, { headers: authOptions.headers }).toPromise();

      // 여러명의 아티스트 때 object로 저장
      let artists = response.data.item.artists;
      let singers = Object.values(artists);

      let results = [];

      // 다중 ArtistName 가져오기
      for (let i = 0; i < singers.length; i++) results[i] = singers[i]['name'];

      const albumName = response.data.item.album.name;
      const songName = response.data.item.name;
      const imageUri = response.data.item.album.images;

      const saveTrackData = new PlaylistDto();

      saveTrackData.userId = userId;
      saveTrackData.albumName = albumName;
      saveTrackData.artistName = results.join(', ');
      saveTrackData.songName = songName;
      saveTrackData.imageUri = imageUri.find((image) => image.height === 640).url

      // 곡 정보 저장
      this.playlistRepository.save(saveTrackData);

    } catch (error) {
      console.error(error);
    }

  }

}
