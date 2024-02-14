import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

import { ChatApiResponse, ChatRequest, ChatMessageRequest } from './chat.dto';

@Injectable()
export class ChatService {
  httpHost: string;

  constructor(
    private readonly http: HttpService,
    private configService: ConfigService
  ) {
    const dftHttpHost = 'http://localhost:8080/api/v1';
    this.httpHost = this.configService.get<string>('API_URL', dftHttpHost);
  }

  createChat(chat: ChatRequest): Promise<AxiosResponse<ChatApiResponse>> {
    return firstValueFrom(this.http.post(`${this.httpHost}`, {
      name: chat.name,
      user_id: chat.userId,
      total_debit: chat.totalDebit,
      old_messages: []
    }));
  }

  getAnswer(msg: ChatMessageRequest): Promise<AxiosResponse<ChatApiResponse>> {
    return firstValueFrom(this.http.get(`${this.httpHost}`, {
      params: {
        user_id: msg.userId,
        message: msg.message,
      }
    }));
  }
}
