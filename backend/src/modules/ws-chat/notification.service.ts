import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class NotificationService {
  private userSockets = new Map<string, string>();
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  addUserSocket(userId: string, socketId: string) {
    this.userSockets.set(userId, socketId);

    console.log(this.userSockets);
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
      console.log(`Notified user ${targetUserId} about new chat: ${chatId}`);
    } else {
      console.log(
        `User ${targetUserId} is not connected or server is undefined`,
      );
    }
  }
}
