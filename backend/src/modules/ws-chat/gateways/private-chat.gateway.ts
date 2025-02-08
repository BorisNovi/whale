import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from '../dto';
import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WsChatExceptionFilter } from '../filters';
import { AuthService } from '../../auth/auth.service';
import { IMessage } from '../interfaces';
import { WsAuthGuard } from 'src/common';
import { ChatsService } from '../chats.service';
import { SaveMessageService } from '../save-message.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: process.env.CORS_ORIGIN.split(','),
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  },
})
@UseFilters(new WsChatExceptionFilter())
export class PrivateChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly saveMessageService: SaveMessageService,
    private readonly authService: AuthService,
    private readonly chatsService: ChatsService,
  ) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    if (!token || !this.authService.validateUser(token)) {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('joinPrivateChat')
  @UseGuards(WsAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  joinPrivateChat(
    @MessageBody() { chatId }: { chatId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(chatId);
  }

  @SubscribeMessage('privateMessage')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handlePrivateMessage(
    @MessageBody() messageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    if (!messageDto.chatId) {
      throw new Error('chatId is required in messageDto');
    }

    const token = client.handshake.auth?.token;
    const senderData = await this.authService.getUserData(token);
    const [creatorId, targetUserId] = messageDto.chatId.split(':');

    if (
      senderData.userId !== creatorId && // Отправитель должен быть creatorId
      senderData.userId !== targetUserId // или targetUserId
    ) {
      throw new Error(
        `${senderData.userId} not authorized to send messages in this chat`,
      );
    }

    const message: IMessage = {
      username: senderData.username,
      userId: senderData.userId,
      color: senderData.color,
      timestamp: new Date().toISOString(),
      text: messageDto.message.text, // Используем вложенное поле
    };

    // Отправляем сообщение
    this.server.to(messageDto.chatId).emit('privateMessage', message);

    // Сохраняем сообщения
    this.saveMessageService.saveMessage(messageDto.chatId, message);

    // Сохраняем чат для обоих пользователей
    const targetUserData =
      await this.authService.getFullUserDataById(targetUserId);
    this.chatsService.saveChat(senderData, targetUserData, messageDto.chatId);

    // Уведомляем целевого пользователя о новом сообщении
    this.chatsService.notifyUser(senderData, targetUserData, messageDto.chatId);
  }
}
