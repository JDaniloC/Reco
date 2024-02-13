import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { WhatsappService } from './whatsapp/whatsapp.service';
import { ChatService } from './chat/chat.service';
import { whatsappProvider } from './whatsapp/whatsapp';
import { ChatController } from './chat/chat.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule
  ],
  controllers: [ChatController],
  providers: [whatsappProvider, WhatsappService, ChatService],
})
export class AppModule {}
