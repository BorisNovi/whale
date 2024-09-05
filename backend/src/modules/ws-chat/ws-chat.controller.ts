import { Controller, Get, Query } from '@nestjs/common';
import { WsChatService } from './ws-chat.service';
import { IMessage } from './interfaces';

@Controller('chat')
export class WsChatController {
  constructor(private readonly wsChatService: WsChatService) {}

  @Get('list')
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
