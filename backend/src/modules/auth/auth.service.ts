import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  private onlineUsers = new Map<string, { username: string; color: string }>();

  isUsernameOnline(username: string): boolean {
    return Array.from(this.onlineUsers.values()).some(
      (user) => user.username === username,
    );
  }

  login(username: string): { username: string; token: string; color: string } {
    const token = this.generateToken(username);
    const color = this.generateRandomColor();
    this.onlineUsers.set(token, { username, color });
    return { username, token, color };
  }

  logout(token: string): { success: boolean; message: string } {
    if (this.onlineUsers.has(token)) {
      const userInfo = this.onlineUsers.get(token);
      this.onlineUsers.delete(token);
      return { success: true, message: `User ${userInfo.username} logged out` };
    } else {
      return { success: false, message: `Invalid token or user not found` };
    }
  }

  validateUser(token: string): boolean {
    return this.onlineUsers.has(token);
  }

  getUsername(token: string): string | null {
    const userInfo = this.onlineUsers.get(token);
    return userInfo ? userInfo.username : null;
  }

  getUserColor(token: string): string | null {
    const userInfo = this.onlineUsers.get(token);
    return userInfo ? userInfo.color : null;
  }

  private generateToken(username: string): string {
    return `${username}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  private generateRandomColor(): string {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return `#${randomColor.padStart(6, '0')}`; // #RRGGBB
  }
}
