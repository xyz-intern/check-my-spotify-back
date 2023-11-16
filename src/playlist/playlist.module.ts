import { Module } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../user/entities/token.entity';
import { TokenRepository } from 'src/user/user.repository';
import { Playlist } from './entities/playlist.entity';
import { UserService } from '../user/user.service';
import { playlistRepository } from './playlist.repository';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Token, Playlist, TokenRepository, playlistRepository])],
  controllers: [PlaylistController],
  exports: [PlaylistService],
  providers: [PlaylistService, UserService],
})
export class PlaylistModule { }
