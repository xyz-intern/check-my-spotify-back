import { Module } from '@nestjs/common';
import { ChartsService } from './charts.service';
import { ChartsController } from './charts.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { playlistRepository } from 'src/playlist/playlist.repository';
import { Playlist } from 'src/playlist/entities/playlist.entity';
import { TokenRepository } from 'src/user/user.repository';
import { Token } from 'src/user/entities/token.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([playlistRepository, Playlist, TokenRepository, Token])],
  controllers: [ChartsController],
  providers: [ChartsService],
})
export class ChartsModule {}
