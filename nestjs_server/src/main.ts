import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from "@nestjs/config";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const docsConfig = new DocumentBuilder()
    .setTitle('Barden Whatsapp server')
    .setDescription('Whatsapp HTTP API using NestJS and Venom 🕷')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, docsConfig);
  SwaggerModule.setup('api', app, document);

  const config = app.get(ConfigService);
  const port = config.get('PORT', 5000);
  await app.listen(port);
}
bootstrap();
