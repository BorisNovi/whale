import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body('username') username: string,
  ): Promise<{ username: string; token: string }> {
    username = username.trim().toLowerCase();

    if (this.authService.isUsernameOnline(username)) {
      throw new BadRequestException(
        'This username is already online. Please use a different username.',
      );
    }

    return this.authService.login(username);
  }

  @Post('logout')
  async logout(
    @Body('username') username: string,
    @Body('token') token: string,
  ): Promise<{ success: boolean; message: string }> {
    username = username.trim().toLowerCase();

    if (!this.authService.validateUser(token)) {
      throw new UnauthorizedException('Invalid token.');
    }

    if (this.authService.getUsername(token) !== username) {
      throw new UnauthorizedException(
        'Token does not match the given username.',
      );
    }

    return this.authService.logout(username, token);
  }
}
