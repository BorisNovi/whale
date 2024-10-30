import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { IToken } from './interfaces';

@Injectable()
export class AuthService {
  private onlineUsers = new Map<string, { username: string; color: string }>();
  private readonly secretKey = process.env.JWT_SECRET_KEY;

  isUsernameOnline(username: string): boolean {
    return Array.from(this.onlineUsers.values()).some(
      (user) => user.username === username,
    );
  }

  login(username: string): { username: string; token: IToken; color: string } {
    const token = this.generateToken(username);
    const color = this.generateRandomColor();
    this.onlineUsers.set(token.accessToken, { username, color });
    return { username, token, color };
  }

  logout(accessToken: string): { success: boolean; message: string } {
    if (this.onlineUsers.has(accessToken)) {
      const userInfo = this.onlineUsers.get(accessToken);
      this.onlineUsers.delete(accessToken);
      return { success: true, message: `User ${userInfo.username} logged out` };
    } else {
      return {
        success: false,
        message: `Invalid accessToken or user not found`,
      };
    }
  }

  validateUser(accessToken: string): boolean {
    try {
      const decoded = jwt.verify(accessToken, this.secretKey) as {
        username: string;
      };
      const userInfo = this.onlineUsers.get(accessToken);

      return userInfo && userInfo.username === decoded.username;
    } catch (err) {
      return false;
    }
  }

  getUsername(accessToken: string): string | null {
    const userInfo = this.onlineUsers.get(accessToken);
    return userInfo ? userInfo.username : null;
  }

  getUserColor(accessToken: string): string | null {
    const userInfo = this.onlineUsers.get(accessToken);
    return userInfo ? userInfo.color : null;
  }

  public generateToken(username: string): IToken {
    const accessPayload = { username, type: 'access' };
    const accessToken = jwt.sign(accessPayload, this.secretKey, {
      expiresIn: '15m',
    });

    const refreshPayload = { username, type: 'refresh' };
    const refreshToken = jwt.sign(refreshPayload, this.secretKey, {
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  public refreshToken(refreshToken: string): IToken {
    try {
      const decoded = jwt.verify(refreshToken, this.secretKey) as {
        username: string;
      };

      const user = Array.from(this.onlineUsers.entries()).find(
        ([accessToken, userInfo]) => userInfo.username === decoded.username,
      );

      if (!user) {
        throw new UnauthorizedException('User not found or not online');
      }

      const [oldAccessToken, userInfo] = user;

      const newTokens = this.generateToken(decoded.username);

      this.onlineUsers.delete(oldAccessToken);
      this.onlineUsers.set(newTokens.accessToken, userInfo);

      return newTokens;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private generateRandomColor(): string {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return `#${randomColor.padStart(6, '0')}`; // #RRGGBB
  }
}
