import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { whatsappProvider } from './whatsapp/whatsapp';
import { WhatsappService } from './whatsapp/whatsapp.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, whatsappProvider, WhatsappService],
})
export class AppModule {}
