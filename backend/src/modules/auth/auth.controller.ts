import { BadRequestException, Body, Controller, Get, ParseIntPipe, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { delay, of, timer } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('test')
  async test(@Query('delay', ParseIntPipe) delayTime: number) {
    return of('test').pipe(delay(delayTime));
  }

  @Post('login')
  async login(@Body('username') username: string): Promise<any> {
    const isOnline = this.authService.isUsernameOnline(username);

    if (isOnline) {
      throw new BadRequestException(
        'This username is already online. Use other username.',
      );
    }

    return this.authService.login(username);
  }

  @Post('logout')
  async logout(@Body('username') username: string): Promise<any> {
    return this.authService.logout(username);
  }
}
