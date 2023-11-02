import { NestFactory } from '@nestjs/core';
import { AppModule } from './module/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WsAdapter } from '@nestjs/platform-ws';
import session from 'express-session';
import cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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

  app.use(session({
    secret: 'your-secret-key', // 복잡한 문자열로 수정
    resave: false,
    saveUninitialized: false, // 추가
    cookie: {
      secure: false,
      path: '/',
      domain: 'localhost',
      sameSite: 'lax', // 'lax'로 수정
      httpOnly: true, // 'true'로 수정
    }
  }));
  
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
