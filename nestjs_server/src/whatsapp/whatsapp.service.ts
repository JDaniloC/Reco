import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Whatsapp, Message } from 'venom-bot';

import { Chat } from './whatsapp.dto';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class WhatsappService implements OnApplicationShutdown {
  private chats: { [key: string]: Chat } = {};

  constructor(
    @Inject('WHATSAPP') private whatsapp: Whatsapp,
    private readonly chatService: ChatService,
  ) {
    // Configure hooks
    this.whatsapp.onMessage((message) => this.handleOnMessage(message));
  }

  private async handleOnMessage(message: Message) {
    const canAnswer = this.chatExists(message.from);
    console.log(`Message from ${message.from}: ${canAnswer}`);
    if (message.isGroupMsg === false && canAnswer) {
      const response = await this.chatService.getAnswer({
        userId: this.chats[message.from].userId,
        message: message.body,
      });

      const answer = response.data.answer.message.text;
      this.whatsapp.sendText(message.from, answer);
    }
  }

  public async sendText(number: string, message: string) {
    return this.whatsapp.sendText(number, message);
  }

  public addChat(number: string, userId: number) {
    this.chats[number] = { number, userId };
  }

  private chatExists(number: string) {
    return this.chats[number] !== undefined;
  }

  public getChats() {
    return this.chats;
  }

  onApplicationShutdown(signal?: string) {
    return this.whatsapp.close();
  }
}
