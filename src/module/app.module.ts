import { Module } from '@nestjs/common';
import { AppController } from '../apis/controller/app.controller';
import { AppService } from '../apis/service/app.service';
import { ConfigModule } from '@nestjs/config'
import { ApisModule } from './apis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../apis/entities/token.entity';
import { TokenRepository } from '../apis/repository/app.repository';
import { Playlist } from '../apis/entities/playlist.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { EventsModule } from 'src/module/event.module';


@Module({
  imports: [ApisModule,
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
