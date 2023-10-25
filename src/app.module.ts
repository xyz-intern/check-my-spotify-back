import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config'
import { ApisModule } from './apis/apis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './apis/entities/token.entity';
import { TokenRepository } from './app.repository';

@Module({
  imports: [HttpModule, ApisModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      entities: [Token],
      database: process.env.DATABASE_NAME,
      synchronize: true,
      autoLoadEntities: true
    }),
    TypeOrmModule.forFeature([Token, TokenRepository]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
