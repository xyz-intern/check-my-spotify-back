import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Playlist } from 'src/playlist/entities/playlist.entity';
import { Repository } from 'typeorm';
import * as PLAYLIST from '../common/constants/spotify.url';
import { ChartEntity } from './entities/chart.entity';
import { ArtistEntity } from './entities/artist.entity';

@Injectable()
export class ChartsService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    private httpService: HttpService
  ){}

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

  // Top Songs 50
  async topSongs(): Promise<ChartEntity[]> {
    const response = await this.httpService.get(PLAYLIST.URL.GET_SPOTIFY_CHART).toPromise();
    const topSongs = response.data['chartEntryViewResponses'][0]['entries'];
    return topSongs.map(entry => ({
      rank: entry['chartEntryData']['currentRank'],
      artist: entry['trackMetadata']['artists'].map(artist => artist['name']).join(', '),
      trackName: entry['trackMetadata']['trackName'],
    }));
  }


  // Top Artists
  async topArtists(): Promise<ArtistEntity[]> {
    const response = await this.httpService.get(PLAYLIST.URL.GET_SPOTIFY_CHART).toPromise();
    const topArtists = response.data['chartEntryViewResponses'][2]['entries'];
    return topArtists.map(entry => ({
      rank: entry['chartEntryData']['currentRank'],
      artist: entry['artistMetadata']['artistName']
    }));
  }
}
