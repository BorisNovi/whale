import { CreateMessageDto } from '../dto';

export interface IMessage extends CreateMessageDto {
  timestamp: string;
}
