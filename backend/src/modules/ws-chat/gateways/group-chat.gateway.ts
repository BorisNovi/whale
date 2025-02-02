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
    origin: '*',
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
    console.log(
      'WebSocket server initialized and passed to NotificationService',
    );
  }

  async handleConnection(client: Socket) {
    const token = this.extractToken(client);
    const userData = await this.authService.getUserData(token);

    if (userData?.userId) {
      this.chatsService.addUserSocket(userData.userId, client.id);

      console.log(
        `\x1b[32mUser connected: ${userData.userId} (Socket: ${client.id})\x1b[0m`,
      );
    }

    // Если юзер утратил токен, то отключаем его, иначе он сможет видеть сообщения, но не сможет писать
    // if (!this.authService.validateUser(token)) {
    //   console.log(`Client ${client.id} disconnected due to invalid token`);
    //   client.disconnect();
    //   return;
    // }

    console.log(
      `Client ${client.id} connected`,
      `IP: ${client.request.socket.remoteAddress}`,
    );
  }

  handleDisconnect(client: Socket) {
    this.chatsService.removeUserSocket(client.id);

    console.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('message')
  @UseGuards(WsAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleMessage(
    @MessageBody() messageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const token = this.extractToken(client);

    // Получаем данные пользователя из БД
    const senderData = await this.authService.getUserData(token);

    if (!senderData) {
      console.log('Invalid token or user not found');
      return;
    }

    const message: IMessage = {
      username: senderData.username,
      userId: senderData.userId,
      color: senderData.color,
      timestamp: new Date().toISOString(),
      text: messageDto.message.text, // Используем вложенное поле
    };

    this.saveMessageService.saveMessage('public', message);

    // Отправляем сообщение всем клиентам
    this.server.emit('message', message);
  }

  private extractToken(client: Socket): string {
    return Array.isArray(client.handshake.query['Authorization'])
      ? client.handshake.query['Authorization'][0]
      : (client.handshake.query['Authorization'] as string);
  }
}
