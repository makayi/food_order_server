import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService, InitiatePaymentDto } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Post('/initiate-payment')
  initiatePayment(@Body() paymentData: InitiatePaymentDto) {
    return this.appService.initiatePayment(paymentData);
  }

  @Get('/verify-payment')
  verifyPayment(
    @Query('transactionId') transactionId: string,
    @Query('tx_ref') tx_ref: string,
  ): Promise<{
    verified: boolean;
  }> {
    return this.appService.verifyPayment(tx_ref, transactionId);
  }
}
