import { Controller, Get, Query, UnauthorizedException } from '@nestjs/common';
import { WsChatService } from './ws-chat.service';
import { IMessage } from './interfaces';
import { AuthService } from '../auth/auth.service';

@Controller('chat')
export class WsChatController {
  constructor(
    private readonly wsChatService: WsChatService,
    private readonly authService: AuthService,
  ) {}

  @Get('list')
  getAll(
    @Query('token')
    token?: string,
    @Query('count')
    count?: number,
  ): IMessage[] {
    if (!this.authService.validateUser(token)) {
      throw new UnauthorizedException('Invalid token.');
    }

    let parsedCount = Math.round(Number(count));
    if (isNaN(parsedCount)) {
      parsedCount = 0;
    }

    return this.wsChatService.getAllMessages(-parsedCount);
  }
}
