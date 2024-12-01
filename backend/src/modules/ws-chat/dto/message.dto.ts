import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MessageContent {
  @IsString()
  @IsNotEmpty()
  text: string; // Вложенное поле
}

export class CreateMessageDto {
  @ValidateNested() // Проверяем вложенный объект
  @Type(() => MessageContent) // Автоматически преобразуем вложенный объект
  @IsNotEmpty()
  message: MessageContent; // Объект с полем message

  @IsString()
  @IsNotEmpty()
  chatId: string;
}
