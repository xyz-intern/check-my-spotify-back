import { Module } from '@nestjs/common';
import { SortService } from './sort.service';
import { SortController } from './sort.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { playlistRepository } from 'src/playlist/playlist.repository';
import { Playlist } from 'src/playlist/entities/playlist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Playlist, playlistRepository])],
  controllers: [SortController],
  providers: [SortService]
})
export class SortModule {}
