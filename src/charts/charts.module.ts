import { Module } from '@nestjs/common';
import { ChartsService } from './charts.service';
import { ChartsController } from './charts.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { playlistRepository } from 'src/playlist/playlist.repository';
import { Playlist } from 'src/playlist/entities/playlist.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([playlistRepository, Playlist])],
  controllers: [ChartsController],
  providers: [ChartsService],
})
export class ChartsModule {}
