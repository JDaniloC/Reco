import { ApiProperty } from "@nestjs/swagger";

const phoneNumber = ApiProperty({
  example: '5581996207886'
})

export class Chat {
  @phoneNumber number: string;
  userId: number;
}
