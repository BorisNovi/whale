import { Module } from '@nestjs/common';
import { WsChatService } from './ws-chat.service';
import { WsChatGateway } from './ws-chat.gateway';
import { WsChatController } from './ws-chat.controller';

@Module({
  controllers: [WsChatController],
  providers: [WsChatGateway, WsChatService],
})
export class WsChatModule {}
