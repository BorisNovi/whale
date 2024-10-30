import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './modules/auth/auth.module';
import { LogRequestsMiddleware } from './common';
import { WsChatModule } from './modules/ws-chat/ws-chat.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // SequelizeModule.forRoot({
    //   dialect: 'postgres',
    //   host: process.env.POSTGRES_HOST,
    //   port: 5432,
    //   username: process.env.POSTGRES_USER,
    //   password: process.env.POSTGRES_PASSWORD,
    //   database: process.env.POSTGRES_DB,
    //   models: [], // Models
    //   autoLoadModels: true,
    //   synchronize: true, // Don't trun on in prod
    // }),
    ConfigModule.forRoot(),
    AuthModule,
    WsChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogRequestsMiddleware).forRoutes('auth');
  }
}
