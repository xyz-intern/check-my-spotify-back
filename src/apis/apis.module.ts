import { Module } from '@nestjs/common';
import { ApisService } from './apis.service';
import { ApisController } from './apis.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { TokenRepository } from 'src/app.repository';
import { HttpModule } from '@nestjs/axios';
import { Playlist } from './entities/playlist.entity';
@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Token, Playlist, TokenRepository]),],
  controllers: [ApisController],
  providers: [ApisService],
})
export class ApisModule {}
