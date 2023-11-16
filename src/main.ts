import { NestFactory } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WsAdapter } from '@nestjs/platform-ws';
import session from 'express-session';
import cookieParser from 'cookie-parser';

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
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,

    cookie: {
      secure: false,
      path: '/',
      domain: 'localhost',
      sameSite: 'lax',
      maxAge: 3600,
      httpOnly: true,
    }
  }));
  
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
