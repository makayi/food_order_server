import { Body, Controller, Post } from '@nestjs/common';
import { AppService, InitiatePaymentDto } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Post('/initiate-payment')
  initiatePayment(@Body() paymentData: InitiatePaymentDto) {
    return this.appService.initiatePayment(paymentData);
  }
}
