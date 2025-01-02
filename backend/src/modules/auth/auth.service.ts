import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { IToken, IUser } from './interfaces';

@Injectable()
export class AuthService {
  private onlineUsers = new Map<
    string,
    { username: string; userId: string; color: string }
  >();
  private readonly secretKey = process.env.JWT_SECRET_KEY;

  isUsernameOnline(username: string): boolean {
    return Array.from(this.onlineUsers.values()).some(
      (user) => user.username === username,
    );
  }

  login(username: string): IUser {
    const userId = this.generateUniqueUserId();
    const token = this.generateToken(username);
    const color = this.generateRandomColor();
    this.onlineUsers.set(token.accessToken, { username, userId, color });

    return { username, userId, token, color };
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

  getUserData(accessToken: string, key?: string): Partial<IUser> | null {
    const userInfo = this.onlineUsers.get(accessToken);
    if (!!key) {
      return userInfo ? userInfo[key] : null;
    } else {
      return userInfo;
    }
  }

  getFullUserDataById(userId: string): Partial<IUser> | null {
    const user = Array.from(this.onlineUsers.values()).find(
      (userInfo) => userInfo.userId === userId,
    );
    return user || null;
  }

  private generateToken(username: string): IToken {
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

  private generateUniqueUserId(): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let userId: string;
    do {
      userId = '';
      for (let i = 0; i < 12; i++) {
        userId += characters.charAt(
          Math.floor(Math.random() * characters.length),
        );
      }
    } while (
      Array.from(this.onlineUsers.values()).some(
        (user) => user.userId === userId,
      )
    );

    return userId;
  }
}
