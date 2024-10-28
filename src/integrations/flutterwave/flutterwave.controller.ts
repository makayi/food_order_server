import { Controller, Post, Body, Headers } from '@nestjs/common';
import { FlutterwaveService } from './flutterwave.service';
import { FlutterwaveWebhookDto } from '../../dto/webhook.dto';

@Controller('webhooks/flutterwave')
export class FlutterwaveController {
  constructor(private readonly flutterwaveService: FlutterwaveService) {}

  @Post()
  async handleWebhook(
    @Headers('verif-hash') verifHash: string,
    @Body() webhookData: FlutterwaveWebhookDto,
  ) {
    // Verify webhook signature
    if (verifHash !== process.env.FLUTTERWAVE_WEBHOOK_HASH) {
      throw new Error('Invalid webhook signature');
    }

    return this.flutterwaveService.handleWebhook(webhookData);
  }
}