import { Controller, Post, Body } from '@nestjs/common';
import { EventService } from './event.service';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  create(@Body() body: { name: string; maxSeats: number }) {
    return this.eventService.create(body);
  }
}