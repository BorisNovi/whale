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
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'john_doe' },
      },
      required: ['username'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully logged in',
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        token: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Username is already online' })
  @Post('login')
  async login(
    @Body('username') username: string,
  ): Promise<{ username: string; token: IToken }> {
    if (!username) {
      throw new BadRequestException('Username is required.');
    }

    if (this.authService.isUsernameOnline(username)) {
      throw new BadRequestException(
        'This username is already online. Please use a different username.',
      );
    }

    return this.authService.login(username);
  }

  @ApiOperation({ summary: 'Logout a user' })
  @ApiBearerAuth('access-token')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'john_doe' },
      },
      required: ['username'],
    },
  })
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer access token',
    required: true,
    example: 'Bearer yourAccessTokenHere',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged out',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User successfully logged out' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid authorization header',
  })
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

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'yourRefreshTokenHere' },
      },
      required: ['refreshToken'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'New access token issued',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'newAccessTokenHere' },
        refreshToken: { type: 'string', example: 'newRefreshTokenHere' },
      },
    },
  })
  @Post('refreshToken')
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<IToken> {
    return this.authService.refreshToken(refreshToken);
  }
}
