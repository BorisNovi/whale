import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { AuthService } from 'src/modules/auth/auth.service';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const accessToken = this.extractTokenFromHandshake(client);

    if (!accessToken) {
      throw new WsException('Token not found');
    }

    const isValid = this.authService.validateUser(accessToken);

    if (!isValid) {
      throw new WsException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    return Array.isArray(client.handshake.query['Authorization'])
      ? client.handshake.query['Authorization'][0]
      : (client.handshake.query['Authorization'] as string);
  }
}
