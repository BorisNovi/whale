import { Injectable } from '@nestjs/common';
import { IMessage } from './interfaces';

@Injectable()
export class WsChatService {
  private messages: IMessage[] = [];
  private autoDeleteTimeout: NodeJS.Timeout | null = null;
  private readonly autoDeleteDelayMinutes: number = 5; // min

  saveMessage(message: IMessage): void {
    const messageWithTimestamp = this.addTimestampToMessage(message);
    this.messages.push(messageWithTimestamp);
    console.log(`Message saved:`, messageWithTimestamp);

    this.resetAutoDeleteTimer();
  }

  getAllMessages(count: number): IMessage[] {
    return this.messages.slice(-count);
  }

  private addTimestampToMessage(message: IMessage): IMessage {
    return {
      ...message,
      timestamp: new Date().toISOString(),
    };
  }

  private resetAutoDeleteTimer(): void {
    if (this.autoDeleteTimeout) {
      clearTimeout(this.autoDeleteTimeout);
    }

    this.autoDeleteTimeout = setTimeout(
      () => {
        this.clearMessages();
      },
      this.autoDeleteDelayMinutes * 60 * 1000,
    );
  }

  private clearMessages(): void {
    console.log(`Clearing all messages due to inactivity`);
    this.messages = [];
  }
}
