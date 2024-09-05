import {
  Controller,
  Get,
  HttpCode,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { LearnService } from './learn.service';

@Controller('learn')
export class LearnController {
  constructor(private readonly learnService: LearnService) {}

  @Get('')
  findAll(@Query('count', ParseIntPipe) count: number): any {
    return this.learnService.findAll(count);
  }

  @Post('summon')
  @HttpCode(666)
  create(@Query('role') role: string): any {
    return this.learnService.summon(role);
  }
}
