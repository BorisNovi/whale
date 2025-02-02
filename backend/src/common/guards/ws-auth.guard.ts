import {
  CanActivate,
  ExecutionContext,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthService } from 'src/modules/auth/auth.service';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {
    console.log('WS GUARD');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('CHECK');
    const client: Socket = context.switchToWs().getClient<Socket>();
    const accessToken = this.extractTokenFromHandshake(client);

    if (!accessToken) {
      throw new WsException({
        message: 'Authorization: Missing access token',
        code: 401,
      });
    }

    const isValid = await this.authService.validateUser(accessToken);

    if (!isValid) {
      console.log('INVALID TOKEN');
      throw new WsException({
        message: 'Authorization: Invalid access token',
        code: 401,
      });
    }

    return true;
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    return Array.isArray(client.handshake.query['Authorization'])
      ? client.handshake.query['Authorization'][0]
      : (client.handshake.query['Authorization'] as string);
  }
}
