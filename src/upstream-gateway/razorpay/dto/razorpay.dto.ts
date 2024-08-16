export class PaymentDetailsDto {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export class RequestPaymentDto {
  amount: string;
  currency: string;
  receipt: string;
}
