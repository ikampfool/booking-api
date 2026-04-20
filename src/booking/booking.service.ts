import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Booking } from './booking.entity';
import { Event } from '../event/event.entity';
import { BookingStatus } from './ booking-status.enum';

@Injectable()
export class BookingService {
  constructor(private dataSource: DataSource) {}

  async book(eventId: number, userId: number) {
    return this.dataSource.transaction(async (manager) => {

      const event = await manager.findOne(Event, {
        where: { id: eventId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!event) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Event not found',
          code: 'EVENT_NOT_FOUND'
        });
      }


      const existing = await manager.findOne(Booking, {
        where: { eventId, userId },
      });

      if (existing) {
        throw new BadRequestException({
          statusCode: 400, 
          message: 'User already booked this event',
          code: 'DUPLICATE_BOOKING'
        });
      }

      let status: BookingStatus;

      
      if (event.bookedCount < event.maxSeats) {
        
        status = BookingStatus.CONFIRMED;

        
        event.bookedCount += 1;
        await manager.save(event);

      } else {
        status = BookingStatus.WAITLIST;
      }

      const booking = manager.create(Booking, {
        eventId,
        userId,
        status,
      });

      await manager.save(booking);

      return {
        status,
        id: booking.id, 
        message: status === BookingStatus.CONFIRMED ? 'Booking confirmed' : 'Added to waitlist',
      };
    });
  }

  async cancel(bookingId: number) {
    return this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: {id: bookingId}
      })

      if (!booking) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Booking not found',
          code: 'BOOKING_NOT_FOUND'
        });
      }

      if (booking.status === BookingStatus.CANCELLED) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Booking already cancelled',
          code: 'BOOKING_ALREADY_CANCELLED',
        });
      }

      const isConfirmed = booking.status === BookingStatus.CONFIRMED;
      const isWaitList = booking.status === BookingStatus.WAITLIST;

      if(isWaitList){
        booking.status = BookingStatus.CANCELLED;
        await manager.save(booking);

        return { message: 'Waitlist booking cancelled' };
      }

      console.log("isConfirmed", isConfirmed);

      if(isConfirmed){
        const event = await manager.findOne(Event, {
          where: { id: booking.eventId }, 
          lock: { mode: 'pessimistic_write' }
        });

        if(!event){
          throw new BadRequestException({
            statusCode: 400,
            message: 'Event not found',
            code: 'EVENT_NOT_FOUND'
          });
        }

        booking.status = BookingStatus.CANCELLED;
        await manager.save(booking);

        event.bookedCount -= 1;

        const next = await manager.findOne(Booking, {
          where: { eventId: booking.eventId, status: BookingStatus.WAITLIST },
          order: { createdAt: 'ASC', id: 'ASC' },
          lock: { mode: 'pessimistic_write' }
        })

        console.log("next", next);

        if(next){
          next.status = BookingStatus.CONFIRMED;
          await manager.save(next);

          event.bookedCount += 1;
        }
        await manager.save(event);

        return {
          message: next
            ? 'Promoted waitlist user'
            : 'Booking cancelled, no waitlist',
        };
      }

      return { message: 'Booking cancelled' };

    });
  }
}
