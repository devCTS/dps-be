import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitPaymentOrderDto {
  @IsString()
  @IsNotEmpty()
  txnId: string;
}
