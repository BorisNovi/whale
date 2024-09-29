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
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsChatExceptionFilter } from './filters';
import { AuthService } from '../auth/auth.service';
import { IMessage } from './interfaces';

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

    if (!this.authService.validateUser(token)) {
      console.log(`Client ${client.id} disconnected due to invalid token`);
      client.disconnect();
      return;
    }

    console.log(
      `Client connected: ${client.id}`,
      `IP: ${client.request.socket.remoteAddress}`,
      `Token: ${token}`,
    );
  }

  handleDisconnect(client: Socket) {
    console.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('message')
  @UsePipes(new ValidationPipe({ transform: true }))
  handleMessage(
    @MessageBody() messageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const token = this.extractToken(client);

    if (!this.authService.validateUser(token)) {
      client.emit('error', 'Invalid token');
      return;
    }

    const senderUsername = this.authService.getUsername(token);
    const senderColor = this.authService.getUserColor(token);
    const message: IMessage = {
      ...messageDto,
      username: senderUsername,
      timestamp: new Date().toISOString(),
      color: senderColor,
    };

    this.wsChatService.saveMessage(message);
    console.log(
      `Message sent by user ${message.username}, client ID: ${client.id}`,
    );

    this.server.emit('message', message);
  }

  private extractToken(client: Socket): string {
    return Array.isArray(client.handshake.query.token)
      ? client.handshake.query.token[0]
      : (client.handshake.query.token as string);
  }
}
