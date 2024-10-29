import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OrderStatus {
  PENDING = 'pending',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAID = 'paid',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column()
  amount: number;

  @Column()
  currency: string;

  @Column()
  customerEmail: string;

  @Column({ nullable: true })
  customerPhone: string;

  @Column()
  customerName: string;

  @Column({ unique: true })
  transactionReference: string;

  @Column({ nullable: true })
  flutterwaveTransactionId: string;

  @Column({
    type: 'text',
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column('simple-json', { nullable: true })
  cartItems: Record<string, any>[];

  @Column('simple-json', { nullable: true })
  paymentResponse: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
