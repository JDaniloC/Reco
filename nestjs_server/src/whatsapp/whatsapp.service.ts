import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Whatsapp, Message } from 'venom-bot';

@Injectable()
export class WhatsappService implements OnApplicationShutdown {
  constructor(
    @Inject('WHATSAPP') private whatsapp: Whatsapp,
  ) {
    // Configure hooks
    this.whatsapp.onMessage(message => this.handleOnMessage(message));
  }

  private handleOnMessage(message: Message) {
    console.log(message)
    if (message.body === 'Hi' && message.isGroupMsg === false) {
      this.whatsapp.sendText(message.from, 'Welcome to Venom 🕷')
    }
  }

  onApplicationShutdown(signal?: string) {
    return this.whatsapp.close();
  }
}
