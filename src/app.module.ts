import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingModule } from './booking/booking.module';
import { EventModule } from './event/event.module';
import { Booking } from './booking/booking.entity';
import { Event } from './event/event.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Booking, Event],
      synchronize: true,
      logging: true
    }),
    BookingModule,
    EventModule
  ],
})
export class AppModule {
  // constructor() {
  //   console.log('DB_HOST:', process.env.DB_HOST);
  //   console.log('DB_PORT:', process.env.DB_PORT);
  //   console.log('DB_NAME:', process.env.DB_NAME);
  // }
}
