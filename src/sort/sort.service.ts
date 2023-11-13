import { Playlist } from "src/playlist/entities/playlist.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { Injectable } from "@nestjs/common";
@Injectable()
export class SortService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>
  ) { }

  // 가장 많이 들은 노래순
  async favoriteSongs(): Promise<object> {
    return await this.playlistRepository.find({ order: { count: 'DESC' } })
  }

  // 가장 많이 들은 아티슽
  async heardALotArtists(): Promise<object> {
    const queryBuilder = this.playlistRepository.createQueryBuilder('playlist');
    const result = await queryBuilder
      .select('playlist.artistName', 'artistName')
      .addSelect('COUNT(*)', 'playCount')
      .groupBy('playlist.artistName')
      .orderBy('playCount', 'DESC')
      .getRawMany();
    console.log(result);
    return result
  }

  // 최근에 들은 곡
  async lastSongs(): Promise<object> {
    return await this.playlistRepository.find({ order: { songId: 'DESC' } })
  }

}