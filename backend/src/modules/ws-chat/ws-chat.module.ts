import { Module } from '@nestjs/common';
import { WsChatGateway } from './ws-chat.gateway';
import { WsChatController } from './ws-chat.controller';
import { AuthModule } from '../auth/auth.module';
import { AuthGuard, WsAuthGuard } from '../../common';
import { PrivateChatGateway } from './private-chat.gateway';
import { NotificationService } from './notification.service';
import { SaveMessageService } from './save-message.service';

@Module({
  controllers: [WsChatController],
  providers: [
    WsChatGateway,
    PrivateChatGateway,
    SaveMessageService,
    NotificationService,
    AuthGuard,
    WsAuthGuard,
  ],
  imports: [AuthModule],
})
export class WsChatModule {}
