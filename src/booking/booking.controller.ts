import { Controller, Post, Body, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  book(@Body() body: { eventId: number; userId: number }) {
    return this.bookingService.book(body.eventId, body.userId);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number){
    return this.bookingService.cancel(id);
  }
}
