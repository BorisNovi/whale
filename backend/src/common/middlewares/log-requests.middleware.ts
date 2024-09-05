import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request } from 'express';

@Injectable()
export class LogRequestsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(
      'Request url:',
      req.url,
      'Body:',
      req.body,
      'Query: ',
      req.query,
      'Headers',
      req.headers,
    );
    next();
  }
}
