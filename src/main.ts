import { NestFactory } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WsAdapter } from '@nestjs/platform-ws';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { PlaylistService } from './playlist/playlist.service';

async function bootstrap() {
  const app = await NestFactory.create(UserModule);
  // Swagger Setting
  const config = new DocumentBuilder()
    .setTitle('Spotify example')
    .setDescription('Spotify API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // WebSockter Setting
  app.useWebSocketAdapter(new WsAdapter(app));
  app.use(cookieParser())

  // Session 설정
  app.use(session({
    secret: 'e12o45',
    resave: false,
    saveUninitialized: false,

    cookie: {
      secure: false,
      path: '/',
      domain: 'localhost',
      sameSite: 'lax',
      httpOnly: true,
    }
  }));

  app.enableCors({
    origin: ['http://localhost:8080'],
    credentials: true,
  }
  );

  const { axiosErrorMiddleware } = require('./common/exception/axiosErrorMiddleware');
  app.use(axiosErrorMiddleware());
  await app.listen(3000);
}
bootstrap();
