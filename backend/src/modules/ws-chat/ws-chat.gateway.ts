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

@WebSocketGateway({ namespace: '/chat' })
@UseFilters(new WsChatExceptionFilter())
export class WsChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private readonly wsChatService: WsChatService) {}

  afterInit(server: Server) {
    console.log('WebSocket initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(
      `Client connected: ${client.id}`,
      `ip: ${client.request.socket.remoteAddress}`,
    );
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  @UsePipes(new ValidationPipe({ transform: true }))
  handleMessage(
    @MessageBody() message: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ): void {
    this.wsChatService.saveMessage(message);
    console.log(
      `Message sent by user ${message.username}, client ID: ${client.id}`,
    );
    this.server.emit('message', message);
  }
}
