export class FlutterwaveWebhookDto {
  event: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    charged_amount: number;
    status: string;
    payment_type: string;
    created_at: string;
    customer: {
      email: string;
      phone_number: string;
      name: string;
    };
  };
}
