import { Module } from '@nestjs/common';
import { WsChatService } from './ws-chat.service';
import { WsChatGateway } from './ws-chat.gateway';
import { WsChatController } from './ws-chat.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [WsChatController],
  providers: [WsChatGateway, WsChatService],
  imports: [AuthModule],
})
export class WsChatModule {}
