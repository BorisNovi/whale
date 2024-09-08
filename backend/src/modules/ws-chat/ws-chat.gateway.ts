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

@WebSocketGateway({ namespace: '/chat' })
@UseFilters(new WsChatExceptionFilter())
export class WsChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly wsChatService: WsChatService,
    private readonly authService: AuthService,
  ) {}

  afterInit(server: Server) {
    console.log('WebSocket initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    const token = Array.isArray(client.handshake.query.token)
      ? client.handshake.query.token[0]
      : client.handshake.query.token;

    console.log(this.authService.validateUser(token));

    if (!this.authService.validateUser(token)) {
      client.disconnect();
      console.log(`Client ${client.id} disconnected due to invalid token`);
      return;
    }

    console.log(token);
    console.log(
      `Client connected: ${client.id}`,
      `ip: ${client.request.socket.remoteAddress}`,
      `token ${token}`,
    );
  }

  handleDisconnect(client: Socket) {
    console.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('message')
  @UsePipes(new ValidationPipe({ transform: true }))
  handleMessage(
    @MessageBody() message: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const token = Array.isArray(client.handshake.query.token)
      ? client.handshake.query.token[0]
      : client.handshake.query.token;

    if (!this.authService.validateUser(token)) {
      client.emit('error', 'Invalid token');
      return;
    }

    this.wsChatService.saveMessage(message);
    console.log(
      `Message sent by user ${message.username}, client ID: ${client.id}`,
    );
    this.server.emit('message', message);
  }
}
