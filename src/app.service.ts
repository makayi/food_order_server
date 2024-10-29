import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlutterwaveService } from './integrations/flutterwave/flutterwave.service';
import { Order, OrderStatus } from './entities/order.entity';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

interface CartItem {
  id: number;
  name: string;
  price: number;
  description: string;
  quantity: number;
}
export interface InitiatePaymentDto {
  totalAmount: number;
  cartItems: CartItem[];
}

export interface PaymentResponse {
  status: string;
  message: string;
  data: {
    link: string;
  };
}

@Injectable()
export class AppService {
  constructor(
    private readonly flutterwaveService: FlutterwaveService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async initiatePayment(
    paymentData: InitiatePaymentDto,
  ): Promise<PaymentResponse> {
    // Create transaction reference§
    const tx_ref = `FLW-${uuidv4()}`;

    // Create order record
    const order = this.orderRepository.create({
      customerId: faker.string.uuid(),
      amount: paymentData.totalAmount,
      currency: 'NGN',
      customerEmail: faker.internet.email(),
      customerPhone: faker.phone.number(),
      customerName: faker.name.fullName(),
      transactionReference: tx_ref,
      status: OrderStatus.PENDING,
      cartItems: paymentData.cartItems,
    });

    await this.orderRepository.save(order);

    // Initiate payment with Flutterwave
    const flutterwaveResponse =
      await this.flutterwaveService.initiatePayment(order);

    return {
      status: flutterwaveResponse.status,
      message: flutterwaveResponse.message,
      data: {
        link: flutterwaveResponse.data.link,
      },
    };
  }

  async verifyPayment(
    tx_ref: string,
    transactionId: string,
  ): Promise<{ verified: boolean; amount: number; status: string }> {
    const order = await this.orderRepository.findOne({
      where: { transactionReference: tx_ref },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const flutterwaveResponse =
      await this.flutterwaveService.verifyPayment(transactionId);
    console.log(flutterwaveResponse);
    console.log(order.amount);

    if (
      flutterwaveResponse?.data?.status === 'successful' &&
      flutterwaveResponse?.data?.currency === 'NGN'
    ) {
      // Success! Confirm the customer's payment
      order.status = OrderStatus.PAID;
      order.flutterwaveTransactionId = transactionId;
      await this.orderRepository.save(order);
      return {
        verified: true,
        amount: order.amount,
        status: flutterwaveResponse.data.status,
      };
    } else {
      // Inform the customer their payment was unsuccessful
      return { verified: false, amount: 0, status: '' };
    }
  }
}
