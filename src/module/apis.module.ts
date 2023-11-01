import { Module } from '@nestjs/common';
import { ApisService } from '../apis/service/apis.service';
import { ApisController } from '../apis/controller/apis.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../apis/entities/token.entity';
import { TokenRepository } from 'src/apis/repository/app.repository';
import { HttpModule } from '@nestjs/axios';
import { Playlist } from '../apis/entities/playlist.entity';
// import {SessionModule} from '@nestjs/sesson';
@Module({
  imports: [TypeOrmModule.forFeature([Token, Playlist, TokenRepository]),
],
  controllers: [ApisController],
  providers: [ApisService],
})
export class ApisModule {}
