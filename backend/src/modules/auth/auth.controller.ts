import {
  BadRequestException,
  Body,
  Headers,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { IToken } from './interfaces';
import { AuthGuard } from 'src/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body('username') username: string,
  ): Promise<{ username: string; token: IToken }> {
    if (this.authService.isUsernameOnline(username)) {
      throw new BadRequestException(
        'This username is already online. Please use a different username.',
      );
    }

    return this.authService.login(username);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(
    @Body('username') username: string,
    @Headers('authorization') authHeader: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const accessToken = authHeader.split(' ')[1];
    console.log(`Bye ${username}!`);

    return this.authService.logout(accessToken);
  }

  @Post('refreshToken')
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<IToken> {
    return this.authService.refreshToken(refreshToken);
  }
}
