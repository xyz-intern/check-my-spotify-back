import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Playlist } from 'src/playlist/entities/playlist.entity';
import { Repository } from 'typeorm';
import * as PLAYLIST from '../common/constants/spotify.url';
import { ChartEntity } from './entities/chart.entity';
import { ArtistEntity } from './entities/artist.entity';
import axios from 'axios'
import { Token } from 'src/user/entities/token.entity';

@Injectable()
export class ChartsService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    private httpService: HttpService
  ) { }

  // 가장 많이 들은 노래순
  async favoriteSongs(): Promise<object> {
    return await this.playlistRepository.find({ order: { count: 'DESC' } })
  }

  // 가장 많이 들은 아티스트
  async heardALotArtists(): Promise<any> {
    const queryBuilder = this.playlistRepository.createQueryBuilder('playlist');
    const result = await queryBuilder
      .select('playlist.artistName, COUNT(playlist.artistName)', 'result')
      .addSelect('playlist.artistName', 'artistName')
      .addSelect('playlist.userId', 'userId')
      .addSelect('playlist.songId', 'songId')
      .addSelect('playlist.artistImage', 'artistImage')
      .groupBy('playlist.artistName, playlist.artistImage, playlist.userId, playlist.songId')
      .orderBy('COUNT(playlist.artistName)', 'DESC')
      .getRawMany();

    /*
      select * from playlist 
    */
  
    const dataResult = [];
  
    for (const row of result) {
      try {
        const user: Token = await this.tokenRepository.findOne({ where: { userId: row.userId } });
        const headers = {
          Authorization: 'Bearer ' + user.accessToken
        }
  
        const response = await axios.get(`https://api.spotify.com/v1/artists/${row.artistImage}`, { headers: headers });
        const artistImage = response.data.images[0].url;
  
        dataResult.push({
          artistName: row.artistName,
          count: parseInt(row.result),
          artistImage: artistImage,
          userId: row.userId,
          songId: row.songId
        });
        
      } catch (error) {
        console.log(error);
      }
    }
    return dataResult;
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
      imageUri: entry['trackMetadata']['displayImageUri']
    }));
  }


  // Top Artists
  async topArtists(): Promise<ArtistEntity[]> {
    const response = await this.httpService.get(PLAYLIST.URL.GET_SPOTIFY_CHART).toPromise();
    const topArtists = response.data['chartEntryViewResponses'][2]['entries'];
    return topArtists.map(entry => ({
      rank: entry['chartEntryData']['currentRank'],
      artist: entry['artistMetadata']['artistName'],
      imageUri: entry['artistMetadata']['displayImageUri']
    }));
  }
}
