import { Module } from '@nestjs/common';
import { WsChatService } from './ws-chat.service';
import { WsChatGateway } from './ws-chat.gateway';
import { WsChatController } from './ws-chat.controller';
import { AuthModule } from '../auth/auth.module';
import { AuthGuard, WsAuthGuard } from '../../common';
import { PrivateChatGateway } from './private-chat.gateway';
import { NotificationService } from './notification.service';

@Module({
  controllers: [WsChatController],
  providers: [
    WsChatGateway,
    PrivateChatGateway,
    WsChatService,
    NotificationService,
    AuthGuard,
    WsAuthGuard,
  ],
  imports: [AuthModule],
})
export class WsChatModule {}
