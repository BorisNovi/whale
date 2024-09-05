import { Injectable } from '@nestjs/common';

@Injectable()
export class LearnService {
  findAll(
    count: number,
  ): Array<{ name: string; color: string; price: number }> {
    return [
      {
        name: 'a',
        color: 'red',
        price: 1,
      },
      {
        name: 'b',
        color: 'green',
        price: 2,
      },
      {
        name: 'c',
        color: 'blue',
        price: 3,
      },
      {
        name: 'd',
        color: 'blue',
        price: 4,
      },
      {
        name: 'e',
        color: 'blue',
        price: 5,
      },
    ].slice(0, count);
  }

  summon(role): string {
    return `Demons summoned successfully! Role is ${role} `;
  }
}
