import { BookingService } from "./booking.service";
import { Test, TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { BookingStatus } from "./ booking-status.enum";

describe('BookingService', () => {
  let service: BookingService;

  const mockManager: any ={
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn()
  }
  const mockDataSource = { transaction: jest.fn((cb) => cb(mockManager)) };
  

  beforeEach(async () => {
    jest.clearAllMocks(); 

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService, 
        {
          provide: DataSource,
          useValue: mockDataSource
        }
      ]
    }).compile();

    service = module.get<BookingService>(BookingService);
  })


  it('service should defined', () => {
    expect(service).toBeDefined();
  })

  it('service should throw error when event not found', async () => {
    mockManager.findOne.mockResolvedValueOnce(null);
    
    await expect(service.book(1, 1)).rejects.toMatchObject({
      response: {
        code: 'EVENT_NOT_FOUND'
      }
    })
  })

  it('service should throw error when booking is duplicate', async () => {
    mockManager.findOne.mockResolvedValueOnce({
      id: 1,
      maxSeats: 5,
      bookedCount: 0
    }) 
    .mockResolvedValueOnce({
      id: 99,
      eventId: 1,
      userId: 1
    });

    await expect(service.book(1, 1)).rejects.toMatchObject({
      response: {
        code: 'DUPLICATE_BOOKING'
      }
    })
  })

  it('service should return status CONFIRM if available seat', async () => {
    mockManager.findOne.mockResolvedValueOnce({
      id: 1,
      maxSeats: 5,
      bookedCount: 0
    })
    .mockResolvedValueOnce(null);

    mockManager.create.mockReturnValue({
      eventId: 1,
      userId: 1,
      status: BookingStatus.CONFIRMED
    })

    const booking = await service.book(1, 1);

    expect(booking.status).toBe(BookingStatus.CONFIRMED);
  })

  it('service should throw booking not found', async () => {
    mockManager.findOne.mockResolvedValueOnce(null);
    
    await expect(service.cancel(1)).rejects.toMatchObject({
      response: {
        code: 'BOOKING_NOT_FOUND'
      }
    })
  })

  it('service should throw BOOKING_ALREADY_CANCELLED', async () => {
    mockManager.findOne.mockResolvedValueOnce({
      id: 99,
      eventId: 1,
      userId: 1,
      status: BookingStatus.CANCELLED
    });

    await expect(service.cancel(1)).rejects.toMatchObject({
      response: {
        code: 'BOOKING_ALREADY_CANCELLED'
      }
    })
  })

  it('service should return Waitlist booking cancelled', async () => {
    mockManager.findOne.mockResolvedValueOnce({
      id: 99,
      eventId: 1,
      userId: 1,
      status: BookingStatus.WAITLIST
    });

    const result = await service.cancel(1);

    expect(result.message).toBe('Waitlist booking cancelled');
  })

  it('service should PROMOTE WAITLIST When has CANCEL Records', async () => {
    mockManager.findOne.mockResolvedValueOnce({
      id: 1,
      eventId: 1,
      userId: 1,
      status: BookingStatus.CONFIRMED
    })
    .mockResolvedValueOnce({
      id: 1,
      maxSeats: 50,
      bookedCount: 4
    })
    .mockResolvedValueOnce({
      id: 51,
      eventId: 1,
      userId: 2,
      status: BookingStatus.WAITLIST
    })

    const result = await service.cancel(1);

    expect(result.message).toBe('Promoted waitlist user');
  })

  it('service should return Booking cancelled, no waitlist', async () => {
    mockManager.findOne.mockResolvedValueOnce({
      id: 1,
      eventId: 1,
      userId: 1,
      status: BookingStatus.CONFIRMED
    })
    .mockResolvedValueOnce({
      id: 1,
      maxSeats: 50,
      bookedCount: 4
    })
    .mockResolvedValueOnce(null)

    const result = await service.cancel(1);

    expect(result.message).toBe('Booking cancelled, no waitlist');
  })


});