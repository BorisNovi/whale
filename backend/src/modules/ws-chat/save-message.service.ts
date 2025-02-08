import { Injectable } from '@nestjs/common';
import { IMessage } from './interfaces';
import { ChatsService } from './chats.service';

@Injectable()
export class SaveMessageService {
  private chatMessages: Record<string, IMessage[]> = {};
  private autoDeleteTimeouts: Record<string, NodeJS.Timeout | null> = {};
  private readonly autoDeleteDelayMinutes: number = 5; // min

  constructor(private readonly chatsService: ChatsService) {}

  saveMessage(chatId: string, message: IMessage): void {
    const messageWithTimestamp = this.addTimestampToMessage(message);

    if (!this.chatMessages[chatId]) {
      this.chatMessages[chatId] = [];
    }

    this.chatMessages[chatId].push(messageWithTimestamp);
    console.log(`Message saved for chat [${chatId}]:`, messageWithTimestamp);

    this.resetAutoDeleteTimer(chatId);
  }

  getAllMessages(chatId: string, count: number): IMessage[] {
    if (!this.chatMessages[chatId]) {
      return [];
    }
    return this.chatMessages[chatId].slice(-count);
  }

  private addTimestampToMessage(message: IMessage): IMessage {
    return {
      ...message,
      timestamp: new Date().toISOString(),
    };
  }

  private resetAutoDeleteTimer(chatId: string): void {
    if (this.autoDeleteTimeouts[chatId]) {
      clearTimeout(this.autoDeleteTimeouts[chatId]);
    }

    this.autoDeleteTimeouts[chatId] = setTimeout(
      () => {
        this.clearMessages(chatId);
      },
      this.autoDeleteDelayMinutes * 60 * 1000,
    );
  }

  // Для удаления сообщений и личных чатов по истечению срока неактивности
  private clearMessages(chatId: string): void {
    console.log(`Clearing all messages for chat [${chatId}] due to inactivity`);
    delete this.chatMessages[chatId];
    delete this.autoDeleteTimeouts[chatId];

    this.chatsService.removeChat(chatId);
  }
}
