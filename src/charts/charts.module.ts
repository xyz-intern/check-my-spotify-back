import { Module } from '@nestjs/common';
import { ChartsService } from './charts.service';
import { ChartsController } from './charts.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaylistRepository } from 'src/playlist/playlist.repository';
import { Playlist } from 'src/playlist/entities/playlist.entity';
import { TokenRepository } from 'src/user/user.repository';
import { Token } from 'src/user/entities/token.entity';
import { UserService } from 'src/user/user.service';
import { PlaylistService } from 'src/playlist/playlist.service';
import { ArtistRepository } from 'src/playlist/artist.repository';
import { Artist } from 'src/playlist/entities/artist.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([PlaylistRepository, Playlist, TokenRepository, Token, ArtistRepository, Artist])],
  controllers: [ChartsController],
  providers: [ChartsService, PlaylistService, UserService],
})
export class ChartsModule {}
