import { NestFactory } from '@nestjs/core';
import { AppModule } from './module/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WsAdapter } from '@nestjs/platform-ws';
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
  
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
