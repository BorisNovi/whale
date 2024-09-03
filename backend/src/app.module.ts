import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
