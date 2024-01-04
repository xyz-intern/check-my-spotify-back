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
import { Artist } from 'src/playlist/entities/artist.entity';
import { FavoriteDto } from './dto/request/favorite.dto';
@Injectable()
export class ChartsService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,
    private httpService: HttpService,
    private playlistService: PlaylistService
  ) { }

  // 최근에 들은 곡
  async lastSongs(): Promise<object> {
    // count가 높은 순으로 반환
    const songs = await this.playlistRepository.createQueryBuilder('playlist')
      .innerJoin('playlist.artist', 'artist')
      .select(['playlist.albumImage, playlist.songName, artist.artistName, playlist.count'])
      .orderBy({ 'playlist.count': 'DESC' })
      .getRawMany();
    return songs;
  }

  // 가장 많이 들은 아티스트
  async heardALotArtists(favoriteDto: FavoriteDto): Promise<object> {
    const user: Token = await this.playlistService.getUserToken(favoriteDto.userId);
    let authOptions = await this.playlistService.setRequestOptions('heard', user);
    
    // 중복 아티스트 -> SUM(COUNT)
    const result = await this.artistRepository.createQueryBuilder('artist')
    .select('artist.artistName, artist.artistId')
    .addSelect('SUM(artist.count)', 'total_count')
    .groupBy('artist.artistName, artist.artistId')
    .orderBy({'total_count': 'DESC'})
    .getRawMany();
 
    let artistId = result.map(item => item.artistId); // artistId 배열 추가
    let artistImage = [];

    for(let i = 0; i< artistId.length; i++){
      const response = await axios.get(`${CHART.URL.GET_ARTIST_IMAGE}${artistId[i]}`, { headers: authOptions.headers }) // artistImage 요청하기
      const images = response.data.images[0]
      if(!images) artistImage.push('https://url.kr/vtmp17'); // artistImage가 없다면
      else artistImage.push(images.url)
      result[i].image = artistImage[i]
    }

    return result;
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