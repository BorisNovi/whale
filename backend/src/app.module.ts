import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './modules/auth/auth.module';
import { LearnModule } from './modules/learn/learn.module';
import { LogRequestsMiddleware } from './common';
import { WsChatModule } from './modules/ws-chat/ws-chat.module';

@Module({
  imports: [
    // SequelizeModule.forRoot({
    //   dialect: 'postgres',
    //   host: 'postgres',
    //   port: 5432,
    //   username: 'postgres',
    //   password: 'password', // Get from env
    //   database: 'whale-db',
    //   models: [], // Models
    //   autoLoadModels: true,
    //   synchronize: true, // Don't trun on in prod
    // }),
    AuthModule,
    LearnModule,
    WsChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogRequestsMiddleware).forRoutes('learn', 'auth');
  }
}
