import { Module } from '@nestjs/common';
import { WsChatService } from './ws-chat.service';
import { WsChatGateway } from './ws-chat.gateway';
import { WsChatController } from './ws-chat.controller';
import { AuthModule } from '../auth/auth.module';
import { AuthGuard } from '../../common';

@Module({
  controllers: [WsChatController],
  providers: [WsChatGateway, WsChatService, AuthGuard],
  imports: [AuthModule],
})
export class WsChatModule {}
