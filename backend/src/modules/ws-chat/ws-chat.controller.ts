import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { WsChatService } from './ws-chat.service';
import { IMessage } from './interfaces';
import { AuthGuard } from 'src/common';

@Controller('chat')
export class WsChatController {
  constructor(private readonly wsChatService: WsChatService) {}

  @Get('list')
  @UseGuards(AuthGuard)
  getAll(
    @Query('count')
    count?: number,
  ): IMessage[] {
    let parsedCount = Math.round(Number(count));
    if (isNaN(parsedCount)) {
      parsedCount = 0;
    }

    return this.wsChatService.getAllMessages(-parsedCount);
  }
}
