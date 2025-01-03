import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { AuthModule } from '../auth/auth.module';
import { AuthGuard, WsAuthGuard } from '../../common';
import { GroupChatGateway, PrivateChatGateway } from './gateways';
import { ChatsService } from './chats.service';
import { SaveMessageService } from './save-message.service';

@Module({
  controllers: [ChatsController],
  providers: [
    GroupChatGateway,
    PrivateChatGateway,
    SaveMessageService,
    ChatsService,
    AuthGuard,
    WsAuthGuard,
  ],
  imports: [AuthModule],
})
export class WsChatModule {}
