import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { IChatInfo } from './interfaces';
import { IUser } from '../auth/interfaces';

@Injectable()
export class ChatsService {
  private userSockets = new Map<string, string>();
  private userChats = new Map<string, IChatInfo[]>();
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  addUserSocket(userId: string, socketId: string) {
    this.userSockets.set(userId, socketId);
  }

  removeUserSocket(socketId: string) {
    const userId = [...this.userSockets.entries()].find(
      ([, id]) => id === socketId,
    )?.[0];
    if (userId) {
      this.userSockets.delete(userId);
    }
  }

  notifyUser(
    sender: Partial<IUser>,
    targetUser: Partial<IUser>,
    chatId: string,
  ): void {
    const senderSocketId = this.userSockets.get(sender.userId);
    const targetSocketId = this.userSockets.get(targetUser.userId);
    if (targetSocketId && this.server) {
      this.server
        .to([senderSocketId, targetSocketId])
        .emit('newChat', { chatId, sender, target: targetUser });
    }
  }

  saveChat(
    sender: Partial<IUser>,
    targetUser: Partial<IUser>,
    chatId: string,
  ): void {
    const addChatForUser = (
      userId: string,
      sender: Partial<IUser>,
      targetUser: Partial<IUser>,
    ) => {
      const chats = this.userChats.get(userId) || [];
      if (!chats.some((chat) => chat.chatId === chatId)) {
        chats.push({ chatId, sender, target: targetUser });
        this.userChats.set(userId, chats);
      }
    };

    addChatForUser(targetUser.userId, sender, targetUser); // Получатель может видеть чат
    addChatForUser(sender.userId, sender, targetUser); // Отправитель может видеть чат
  }

  getChats(userId: string): IChatInfo[] | [] {
    // TODO: Позволить запрашивать чаты только участникам чатов. Добавить ID юзера к токену.
    return Array.from(this.userChats.get(userId) || []);
  }

  removeChat(chatId: string): void {
    this.userChats.forEach((chats, userId) => {
      const updatedChats = chats.filter((chat) => chat.chatId !== chatId);
      if (updatedChats.length !== chats.length) {
        this.userChats.set(userId, updatedChats);
      }
    });
  }
}
