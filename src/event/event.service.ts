import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
  ) {}

  create(data: { name: string; maxSeats: number }) {
    const event = this.eventRepo.create({
      name: data.name,
      maxSeats: data.maxSeats,
      bookedCount: 0,
    });

    return this.eventRepo.save(event);
  }
}