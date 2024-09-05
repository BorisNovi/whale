import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto';
import { IMessage } from './interfaces';

@Injectable()
export class WsChatService {
  private messages: IMessage[] = [];
  private autoDeleteInterval: NodeJS.Timeout | null = null;
  private autoDeleteDelay: number = 5; // min

  saveMessage(message: CreateMessageDto) {
    const serverTime = new Date().toISOString();

    const messageWithServerTime: IMessage = {
      ...message,
      timestamp: serverTime,
    };

    this.messages.push(messageWithServerTime);
    this.deleteIfInactivity(this.autoDeleteDelay);

    console.log(this.messages);
  }

  getAllMessages(count: number): IMessage[] {
    return this.messages.slice(count);
  }

  private deleteIfInactivity(delay: number): void {
    if (this.autoDeleteInterval) {
      clearTimeout(this.autoDeleteInterval);
    }

    this.autoDeleteInterval = setTimeout(
      () => (this.messages = []),
      delay * 60 * 1000,
    );
  }
}
