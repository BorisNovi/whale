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
export class PrivateChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  // private privateChats: Map<string, IMessage[]> = new Map();

  constructor(
    private readonly wsChatService: WsChatService,
    private readonly authService: AuthService,
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

    const message: IMessage = {
      ...messageDto,
      username: senderData.username,
      userId: senderData.userId,
      color: senderData.color,
      timestamp: new Date().toISOString(),
    };

    // Получение текущих сообщений для чата или создание нового массива
    // const existingMessages = this.privateChats.get(messageDto.chatId) || [];
    // if (!Array.isArray(existingMessages)) {
    //   throw new Error('Expected an array for privateChats');
    // }

    // // Добавление нового сообщения в массив
    // this.privateChats.set(messageDto.chatId, existingMessages.concat(message));

    this.server.to(messageDto.chatId).emit('privateMessage', message);
  }

  private extractToken(client: Socket): string {
    return Array.isArray(client.handshake.query['Authorization'])
      ? client.handshake.query['Authorization'][0]
      : (client.handshake.query['Authorization'] as string);
  }
}
