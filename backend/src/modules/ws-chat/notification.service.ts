import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { IChatInfo } from './interfaces';
import { IUser } from '../auth/interfaces';

@Injectable()
export class NotificationService {
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
    if (userId) this.userSockets.delete(userId);
  }

  notifyUser(chatId: string, targetUserId: string, username: string): void {
    const socketId = this.userSockets.get(targetUserId);
    if (socketId && this.server) {
      this.server.to(socketId).emit('newPrivateMessage', { chatId, username });
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

  getChats(userId: string): IChatInfo[] {
    // TODO: Позволить запрашивать чаты только участникам чатов. Добавить ID юзера к токену.
    return Array.from(this.userChats.get(userId));
  }
}
