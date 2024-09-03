import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { id: number; value: string } {
    return {
      id: 1,
      value: 'You got this phrase from backend!',
    };
  }
}
