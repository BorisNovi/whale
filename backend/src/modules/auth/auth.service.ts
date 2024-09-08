import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  private onlineUsers = new Map<string, string>();

  isUsernameOnline(username: string): boolean {
    return this.onlineUsers.has(username);
  }

  login(username: string): {
    username: string;
    token: string;
  } {
    const token = this.generateToken(username);
    this.onlineUsers.set(username, token);
    return { username, token };
  }

  logout(username: string): { success: boolean; message: string } {
    if (this.onlineUsers.has(username)) {
      this.onlineUsers.delete(username);
      return { success: true, message: `User ${username} logged out` };
    } else {
      return { success: false, message: `User ${username} not found` };
    }
  }

  validateUser(token: string): boolean {
    return Array.from(this.onlineUsers.values()).includes(token);
  }

  private generateToken(username: string): string {
    return `${username}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
