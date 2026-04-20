import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking } from './booking.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../event/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Event])],
  providers: [BookingService],
  controllers: [BookingController],
})
export class BookingModule {}
