import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config'
import { PlaylistModule } from '../playlist/playlist.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { TokenRepository } from './user.repository';
import { Playlist } from '../playlist/entities/playlist.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { EventsModule } from 'src/socket/event.module';
import { SortModule } from 'src/sort/sort.module';

@Module({
  imports: [PlaylistModule,
    SortModule,
    EventsModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      entities: [Token, Playlist],
      database: process.env.DATABASE_NAME,
      synchronize: false,
      autoLoadEntities: true
    }),
    TypeOrmModule.forFeature([Token, TokenRepository]),

  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule { }
