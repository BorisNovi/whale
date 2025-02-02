import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { IToken, IUser } from './interfaces';
import { InjectModel } from '@nestjs/sequelize';
import { Token, User } from 'src/common';
import { uid } from 'uid';

@Injectable()
export class AuthService {
  private readonly secretKey = process.env.JWT_SECRET_KEY;

  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Token) private tokenModel: typeof Token,
  ) {}

  async isUserLoggedIn(username: string): Promise<boolean> {
    const user = await this.userModel.findOne({ where: { username } });
    return !!user;
  }

  async login(username: string): Promise<IUser> {
    let user = await this.userModel.findOne({ where: { username } });

    if (!user) {
      user = await this.userModel.create({
        userId: uid(),
        username,
        color: this.generateRandomColor(),
        lastSeen: new Date(),
      });
    }

    await this.tokenModel.destroy({ where: { userId: user.userId } });

    const token = this.generateToken(user.userId);

    await this.tokenModel.create({
      userId: user.userId,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    });

    return {
      username: user.username,
      userId: user.userId,
      token,
      color: user.color,
      lastSeen: user.lastSeen,
    };
  }

  async logout(
    accessToken: string,
  ): Promise<{ success: boolean; message: string }> {
    const token = await this.tokenModel.findOne({ where: { accessToken } });

    if (token) {
      await this.userModel.destroy({ where: { userId: token.userId } });
      await this.tokenModel.destroy({ where: { userId: token.userId } });

      return { success: true, message: 'User logged out and deleted' };
    } else {
      return {
        success: false,
        message: 'Invalid accessToken or user not found',
      };
    }
  }

  async validateUser(accessToken: string): Promise<boolean> {
    console.log('VALIDATE USER');
    try {
      const decoded = jwt.verify(accessToken, this.secretKey) as {
        userId: string;
      };
      const token = await this.tokenModel.findOne({ where: { accessToken } });

      return !!token && token.userId === decoded.userId;
    } catch {
      return false;
    }
  }

  async getUserData(
    accessToken: string,
    key?: string,
  ): Promise<Partial<IUser> | null> {
    const token = await this.tokenModel.findOne({ where: { accessToken } });

    if (!token) {
      return null;
    }

    const user = await this.userModel.findOne({
      where: { userId: token.userId },
    });

    if (!user) {
      return null;
    }

    if (key) {
      return { [key]: user[key] };
    }

    return {
      username: user.username,
      userId: user.userId,
      color: user.color,
      lastSeen: user.lastSeen,
    };
  }

  async getFullUserDataById(userId: string): Promise<Partial<IUser> | null> {
    const user = await this.userModel.findOne({ where: { userId } });

    if (!user) {
      return null;
    }

    return {
      username: user.username,
      userId: user.userId,
      color: user.color,
    };
  }

  private generateToken(userId: string): IToken {
    const accessPayload = { userId, type: 'access' };
    const accessToken = jwt.sign(accessPayload, this.secretKey, {
      expiresIn: '4h',
    });

    const refreshPayload = { userId, type: 'refresh' };
    const refreshToken = jwt.sign(refreshPayload, this.secretKey, {
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<IToken> {
    try {
      const decoded = jwt.verify(refreshToken, this.secretKey) as {
        userId: string;
      };
      const token = await this.tokenModel.findOne({ where: { refreshToken } });

      if (!token) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const newTokens = this.generateToken(decoded.userId);

      token.accessToken = newTokens.accessToken;
      token.refreshToken = newTokens.refreshToken;
      await token.save();

      return newTokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private generateRandomColor(): string {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return `#${randomColor.padStart(6, '0')}`; // #RRGGBB
  }
}
