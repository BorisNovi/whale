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
import { WsChatService } from './ws-chat.service';
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
export class WsChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly wsChatService: WsChatService,
    private readonly authService: AuthService,
  ) {}

  afterInit() {
    console.log('WebSocket initialized');
  }

  handleConnection(client: Socket) {
    const token = this.extractToken(client);

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
    console.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('message')
  @UseGuards(WsAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  handleMessage(
    @MessageBody() messageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const token = this.extractToken(client);

    const senderUsername = this.authService.getUsername(token);
    const senderColor = this.authService.getUserColor(token);
    const message: IMessage = {
      ...messageDto,
      username: senderUsername,
      timestamp: new Date().toISOString(),
      color: senderColor,
    };

    this.wsChatService.saveMessage(message);

    this.server.emit('message', message);
  }

  private extractToken(client: Socket): string {
    return Array.isArray(client.handshake.query['Authorization'])
      ? client.handshake.query['Authorization'][0]
      : (client.handshake.query['Authorization'] as string);
  }
}
