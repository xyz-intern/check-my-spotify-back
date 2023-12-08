import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Playlist } from 'src/playlist/entities/playlist.entity';
import { Repository } from 'typeorm';
import * as PLAYLIST from '../common/constants/spotify.url';
import { ChartEntity } from './entities/chart.entity';
import { ArtistEntity } from './entities/artist.entity';
import axios from 'axios'
import { Token } from 'src/user/entities/token.entity';
import * as CHART from '../common/constants/spotify.url'
import { PlaylistService } from 'src/playlist/playlist.service';
import {CustomException} from '../common/exception/custom.exception'
@Injectable()
export class ChartsService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    private httpService: HttpService,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    // private playlistService: PlaylistService
  ) { }

  // 가장 많이 들은 노래순
  async favoriteSongs(): Promise<object> {
    return await this.playlistRepository.find({ order: { count: 'DESC' } })
  }

  // 가장 많이 들은 아티스트
  async heardALotArtists(): Promise<any> {
    try {
      const queryBuilder = this.playlistRepository.createQueryBuilder('playlist');
      const query = queryBuilder
        .select('playlist.artistName', 'artistName')
        .addSelect('SUM(playlist.count)', 'count')
        .addSelect('playlist.userId', 'userId')
        .addSelect('playlist.artistImage', 'artistImage')
        .groupBy('playlist.artistName, playlist.userId, playlist.artistImage')
        .orderBy('SUM(playlist.count)', 'DESC');

      const result = await query.getRawMany();

      const dataResult = await Promise.all(result.map(async (row) => {
        // const user: Token = await this.playlistService.getUserToken(row.userId)
        // let authOptions = await this.playlistService.setRequestOptions('heard', user)

        const user: Token = await this.tokenRepository.findOne({ where: { userId: row.userId } });
        if (!user) throw new CustomException('사용자를 찾을 수 없습니다', HttpStatus.NOT_FOUND);

        const headers = {
          Authorization: 'Bearer ' + user.accessToken
        };



        const response = await axios.get(`${CHART.URL.GET_ARTIST_IMAGE}${row.artistImage}`, { headers: headers });
        const artistImage = response.data.images[0].url;

        return {
          artistName: row.artistName,
          artistId: row.artistImage,
          count: +row.count,
          userId: row.userId,
          artistImage: artistImage,
          songId: Math.random(),
        };
      }));
      return dataResult;
    } catch (error) {
      console.log(error)
    }
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