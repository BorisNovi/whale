import { Module } from '@nestjs/common';
import { GroupChatGateway } from './group-chat.gateway';
import { ChatsController } from './chats.controller';
import { AuthModule } from '../auth/auth.module';
import { AuthGuard, WsAuthGuard } from '../../common';
import { PrivateChatGateway } from './private-chat.gateway';
import { NotificationService } from './notification.service';
import { SaveMessageService } from './save-message.service';

@Module({
  controllers: [ChatsController],
  providers: [
    GroupChatGateway,
    PrivateChatGateway,
    SaveMessageService,
    NotificationService,
    AuthGuard,
    WsAuthGuard,
  ],
  imports: [AuthModule],
})
export class WsChatModule {}
