import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  private onlineUsers: Set<string> = new Set();

  isUsernameOnline(username: string): boolean {
    return this.onlineUsers.has(username);
  }

  login(username: string): { success: boolean; username: string } {
    this.onlineUsers.add(username);
    return { success: true, username };
  }

  logout(username: string): { success: boolean; message: string } {
    const isExisted = this.onlineUsers.has(username);

    let message: string;

    if (isExisted) {
      this.onlineUsers.delete(username);
      message = `User ${username} logged out.`;
    } else {
      message = `User ${username} not existed.`;
    }

    return {
      success: true,
      message: message,
    };
  }
}
