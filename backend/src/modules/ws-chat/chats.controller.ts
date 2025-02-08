import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { IMessage } from './interfaces';
import { AuthGuard } from 'src/common';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SaveMessageService } from './save-message.service';
import { ChatsService } from './chats.service';

@Controller('chat')
export class ChatsController {
  constructor(
    private readonly saveMessageService: SaveMessageService,
    private readonly chatsService: ChatsService,
  ) {}

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get list of chat messages' })
  @ApiQuery({
    name: 'chatId',
    type: String,
    required: true,
    description: 'Id of the chat we ask messages',
  })
  @ApiQuery({
    name: 'count',
    type: Number,
    required: false,
    description:
      'Number of recent messages to retrieve (default: all messages)',
  })
  @Get('messages')
  @UseGuards(AuthGuard)
  getMessages(
    @Query('chatId')
    chatId: string,
    @Query('count')
    count?: number,
  ): IMessage[] {
    let parsedCount = Math.round(Number(count));
    if (isNaN(parsedCount)) {
      parsedCount = 0;
    }

    console.log(chatId, count);

    console.log(this.saveMessageService.getAllMessages(chatId, -parsedCount));

    return this.saveMessageService.getAllMessages(chatId, -parsedCount);
  }

  // TODO: добавить метод для запроса сообщений из конкретного чата, но проверять по id, имеем ли мы на это право

  @Get('chats')
  @UseGuards(AuthGuard)
  getChats(
    @Query('userId')
    userId: string,
  ) {
    return this.chatsService.getChats(userId);
  }
}
