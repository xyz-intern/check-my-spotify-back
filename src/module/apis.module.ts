import { Module } from '@nestjs/common';
import { ApisService } from '../apis/service/apis.service';
import { ApisController } from '../apis/controller/apis.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../apis/entities/token.entity';
import { TokenRepository } from 'src/apis/repository/app.repository';
import { Playlist } from '../apis/entities/playlist.entity';
import { AppModule } from './app.module';
import { AppService } from 'src/apis/service/app.service';

@Module({
  imports: [TypeOrmModule.forFeature([Token, Playlist, TokenRepository])],
  controllers: [ApisController],
  exports: [ApisService],
  providers: [ApisService, AppService],
})
export class ApisModule { }
