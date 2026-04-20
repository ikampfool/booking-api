import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, Index } from 'typeorm';
import { BookingStatus } from './ booking-status.enum';

@Entity()
@Unique(['eventId', 'userId'])
@Index(['eventId', 'status', 'createdAt'])
export class Booking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  eventId!: number;

  @Column()
  userId!: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.WAITLIST
  })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
