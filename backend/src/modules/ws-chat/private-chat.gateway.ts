import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayInit,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from './dto';
import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WsChatExceptionFilter } from './filters';
import { AuthService } from '../auth/auth.service';
import { IMessage } from './interfaces';
import { WsAuthGuard } from 'src/common';
import { NotificationService } from './notification.service';
import { SaveMessageService } from './save-message.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  },
})
@UseFilters(new WsChatExceptionFilter())
export class PrivateChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly saveMessageService: SaveMessageService,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
  ) {}

  afterInit() {
    console.log('Private chat initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected to private chat: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from private chat: ${client.id}`);
  }

  @SubscribeMessage('joinPrivateChat')
  @UseGuards(WsAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  joinPrivateChat(
    @MessageBody() { chatId }: { chatId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(chatId);
    console.log(`User joined private chat: ${chatId}`);
  }

  @SubscribeMessage('privateMessage')
  @UseGuards(WsAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  handlePrivateMessage(
    @MessageBody() messageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ): void {
    if (!messageDto.chatId) {
      throw new Error('chatId is required in messageDto');
    }

    const token = this.extractToken(client);
    const senderData = this.authService.getUserData(token);
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

    this.saveMessageService.saveMessage(messageDto.chatId, message);

    this.server.to(messageDto.chatId).emit('privateMessage', message);

    console.log(
      `Message sent in private chat ${messageDto.chatId} from user \x1b[34m${senderData.userId}\x1b[0m to user \x1b[33m${targetUserId}\x1b[0m`,
    );

    // Уведомляем целевого пользователя о новом сообщении
    this.notificationService.notifyUser(
      messageDto.chatId,
      targetUserId,
      senderData.username,
    );
  }

  private extractToken(client: Socket): string {
    return Array.isArray(client.handshake.query['Authorization'])
      ? client.handshake.query['Authorization'][0]
      : (client.handshake.query['Authorization'] as string);
  }
}
