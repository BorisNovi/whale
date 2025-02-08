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
export class GroupChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly saveMessageService: SaveMessageService,
    private readonly authService: AuthService,
    private readonly chatsService: ChatsService,
  ) {}

  afterInit() {
    this.chatsService.setServer(this.server);
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    if (!token || !this.authService.validateUser(token)) {
      client.disconnect(true);
    }

    const userData = await this.authService.getUserData(token);
    if (!userData?.userId) {
      return client.disconnect(true);
    }

    this.chatsService.addUserSocket(userData.userId, client.id);
  }

  handleDisconnect(client: Socket) {
    this.chatsService.removeUserSocket(client.id);
  }

  @SubscribeMessage('message')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleMessage(
    @MessageBody() messageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const token = client.handshake.auth?.token;

    // Получаем данные пользователя из БД
    const senderData = await this.authService.getUserData(token);

    const message: IMessage = {
      username: senderData.username,
      userId: senderData.userId,
      color: senderData.color,
      timestamp: new Date().toISOString(),
      text: messageDto.message.text,
    };

    // Сохраняем сообщения
    this.saveMessageService.saveMessage('public', message);

    // Отправляем сообщение всем клиентам
    this.server.emit('message', message);
  }
}
