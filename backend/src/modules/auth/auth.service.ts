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

  logout(
    username: string,
    token: string,
  ): { success: boolean; message: string } {
    const storedToken = this.onlineUsers.get(username);
    if (storedToken && storedToken === token) {
      this.onlineUsers.delete(username);
      return { success: true, message: `User ${username} logged out` };
    } else {
      return { success: false, message: `Invalid token or user not found` };
    }
  }

  validateUser(token: string): boolean {
    return Array.from(this.onlineUsers.values()).includes(token);
  }

  getUsername(token: string): string | null {
    for (const [username, storedToken] of this.onlineUsers.entries()) {
      if (storedToken === token) {
        return username;
      }
    }
    return null;
  }

  private generateToken(username: string): string {
    return `${username}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
