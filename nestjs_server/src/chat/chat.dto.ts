import { ApiProperty } from "@nestjs/swagger";

const phoneNumber = ApiProperty({
  example: '5581912345678'
})

const personName = ApiProperty({
  example: 'John Doe'
})

const userId = ApiProperty({
  example: 12345678900,
  type: 'number'
})

export class ChatRequest {
  @phoneNumber number: string;
  @personName name: string;
  @userId userId: number;
  @ApiProperty() totalDebit: number;
}

export class ChatMessageRequest {
  userId: number;
  message: string;
}

interface ChatApiMessage {
  text: string;
  role: string;
}

interface ChatApiAnswer {
  message: ChatApiMessage,
}

export class ChatApiResponse {
  answer: ChatApiAnswer;
}