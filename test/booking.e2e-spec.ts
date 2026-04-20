/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { BookingStatus } from '../src/booking/ booking-status.enum';
import { DataSource } from 'typeorm';

describe('Booking Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('booking CONFIRM should not more than maxSeats', async () => {
    
    const eventRes = await request(app.getHttpServer())
      .post('/events')
      .send({
        name: 'Test Event',
        maxSeats: 5,
      });

    const eventId = eventRes.body.id;
    
    // 10 requests
    const requests = Array.from({ length: 10 }).map((_, i) =>
      request(app.getHttpServer())
        .post('/bookings')
        .send({
          eventId,
          userId: i + 1,
        })
    );

    const responses = await Promise.all(requests);

    const confirmed = responses.filter((booking) => booking.body.status === BookingStatus.CONFIRMED);
    const waitlist = responses.filter((booking) => booking.body.status === BookingStatus.WAITLIST);

    expect(confirmed.length).toBe(5);
    expect(waitlist.length).toBe(5);
  });

  it('should PROMOTE WAITLIST user when confirmed booking is CANCELLED', async () => {

    const createEvent = await request(app.getHttpServer())
        .post('/events')
        .send({
        name: 'Test Event',
        maxSeats: 1,
        });

    const eventId = createEvent.body.id;

    const booking1 = await request(app.getHttpServer())
        .post('/bookings')
        .send({ eventId, userId: 1 });

    const booking2 = await request(app.getHttpServer())
        .post('/bookings')
        .send({ eventId, userId: 2 });

    expect(booking1.body.status).toBe(BookingStatus.CONFIRMED);
    expect(booking2.body.status).toBe(BookingStatus.WAITLIST);

    const res = await request(app.getHttpServer())
        .patch(`/bookings/${booking1.body.id}/cancel`);

    console.log("Booking 1", booking1.body);

    const dataSource = app.get(DataSource);
    const bookings = await dataSource.query(`SELECT * FROM booking WHERE "eventId" = $1`, [eventId]);

    const userB = bookings.find((b: any) => b.userId === 2);
    
    expect(userB).toBeDefined();
    expect(userB.status).toBe(BookingStatus.CONFIRMED);
    });

  afterAll(async () => {
    await app.close();
  });
});