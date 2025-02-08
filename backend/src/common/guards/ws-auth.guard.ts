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
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const accessToken = client.handshake.auth?.token;

    if (!accessToken) {
      throw new WsException({
        message: 'Authorization: Missing access token',
        code: 401,
      });
    }

    const isValid = await this.authService.validateUser(accessToken);

    if (!isValid) {
      throw new WsException({
        message: 'Authorization: Invalid access token',
        code: 401,
      });
    }

    return true;
  }
}
