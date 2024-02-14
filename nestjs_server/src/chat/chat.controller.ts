import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { ChatRequest } from './chat.dto';
import { ChatService } from './chat.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Controller('chat')
@ApiTags('chat')
export class ChatController {
  constructor(
    private readonly whatsapp: WhatsappService,
    private readonly chatService: ChatService,
  ) {}

  @Post('/')
  @ApiOperation({ summary: 'Start negotiation with a number' })
  async startChat(@Body() request: ChatRequest) {
    const phoneNumber = request.number + '@c.us';  
    const response = await this.chatService.createChat(request)
    if (response.status !== 200) {
      return { error: "Error on creating chat" }
    }

    const message = response.data.answer.message.text;
    this.whatsapp.addChat(phoneNumber, request.userId);
    return this.whatsapp.sendText(phoneNumber, message);
  }

  @Get('/')
  @ApiOperation({ summary: 'Get all chats' })
  async getChats() {
    return this.whatsapp.getChats();
  }
}
