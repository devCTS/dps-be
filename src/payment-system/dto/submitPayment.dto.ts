import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitPaymentOrderDto {
  @IsString()
  @IsNotEmpty()
  txnId: string;

  @IsString()
  @IsNotEmpty()
  receipt: string;
}
