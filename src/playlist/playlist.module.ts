import { Module } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../user/entities/token.entity';
import { Playlist } from './entities/playlist.entity';
import { UserService } from '../user/user.service';
import { PlaylistRepository } from './playlist.repository';
import { HttpModule } from '@nestjs/axios';
import { TokenRepository } from 'src/user/user.repository';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Token, Playlist, TokenRepository])],
  controllers: [PlaylistController],
  exports: [PlaylistService, UserService],
  providers: [PlaylistService, UserService],
})
export class PlaylistModule { }
