import {
  IsAlphanumeric,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreatePaymentOrderDto {
  @IsNumber()
  @IsNotEmpty()
  amount: string;

  @IsAlphanumeric()
  @IsNotEmpty()
  orderId: string;

  @IsNotEmpty()
  userId: string;

  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @IsNotEmpty()
  userMobileNumber: string;

  @IsAlphanumeric()
  @IsNotEmpty()
  integrationId: string;

  @IsEnum(['upi', 'netbanking', 'e-wallet'])
  channel: 'upi' | 'netbanking' | 'e-wallet';

  @IsEnum(['sandbox', 'live'])
  environment: 'sandbox' | 'live';
}
