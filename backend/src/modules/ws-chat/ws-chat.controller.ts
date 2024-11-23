import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { WsChatService } from './ws-chat.service';
import { IMessage } from './interfaces';
import { AuthGuard } from 'src/common';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('chat')
export class WsChatController {
  constructor(private readonly wsChatService: WsChatService) {}

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get list of chat messages' })
  @ApiQuery({
    name: 'count',
    type: Number,
    required: false,
    description:
      'Number of recent messages to retrieve (default: all messages)',
  })
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
