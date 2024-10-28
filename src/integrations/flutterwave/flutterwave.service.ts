import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { flutterwaveAxios } from './flutterwave.config';
import { FlutterwaveWebhookDto } from 'src/dto/webhook.dto';
import { Order, OrderStatus } from 'src/entities/order.entity';

interface CollectionPayload {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  customer: {
    email: string;
    name: string;
    phone_number: string;
  };
  meta: Record<string, any>;
  customizations?: {
    title: string;
    description: string;
    logo: string;
  };
  payment_options?: string;
}

interface FlutterwaveResponse {
  message: string;
  data: Record<string, any>;
  status: string;
}

interface FlutterwaveError {
  message: string;
  status?: number;
  data?: any;
}

@Injectable()
export class FlutterwaveService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {
    if (!process.env.FLUTTERWAVE_SECRET_KEY) {
      throw new Error(
        'FLUTTERWAVE_SECRET_KEY is not defined in environment variables',
      );
    }
  }

  async initiatePayment(order: Order): Promise<FlutterwaveResponse> {
    try {
      const payload: CollectionPayload = {
        tx_ref: order.transactionReference,
        amount: order.amount,
        currency: order.currency,
        redirect_url: `${process.env.FRONTEND_URL}/payment-success`,
        payment_options: 'card',
        customer: {
          email: order.customerEmail,
          phone_number: order.customerPhone,
          name: order.customerName,
        },
        customizations: {
          title: 'Payment',
          description: 'Payment for order',
          logo: 'https://your-logo-url.com',
        },
        meta: {
          order_id: order.id,
        },
      };
      const { data } = await flutterwaveAxios.post('/payments', payload);
      return data;
    } catch (error) {
      const flwError = error as FlutterwaveError;
      throw new Error(`Payment initiation failed: ${flwError.message}`);
    }
  }

  async handleWebhook(webhookData: FlutterwaveWebhookDto) {
    const order = await this.orderRepository.findOne({
      where: { transactionReference: webhookData.data.tx_ref },
    });

    if (!order) {
      throw new Error('Order not found.');
    }

    // Update order status based on webhook data
    switch (webhookData.data.status) {
      case 'successful':
        order.status = OrderStatus.SUCCESSFUL;
        break;
      case 'failed':
        order.status = OrderStatus.FAILED;
        break;
      case 'cancelled':
        order.status = OrderStatus.CANCELLED;
        break;
      default:
        order.status = OrderStatus.PENDING;
    }

    order.flutterwaveTransactionId = webhookData.data.id.toString();
    order.paymentResponse = webhookData.data;

    await this.orderRepository.save(order);

    return order;
  }
}
