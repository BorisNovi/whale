import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { WsException as WebSocketException } from '@nestjs/websockets';

@Catch()
export class WsChatExceptionFilter
  extends BaseWsExceptionFilter
  implements ExceptionFilter
{
  catch(exception: WebSocketException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    console.log('WS error:', exception);

    client.emit('error', exception);
  }
}
