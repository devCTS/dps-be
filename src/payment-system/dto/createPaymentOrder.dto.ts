import {
  IsAlphanumeric,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ChannelName } from 'src/utils/enum/enum';

export class CreatePaymentOrderDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsNotEmpty()
  userId: string;

  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsNotEmpty()
  userMobileNumber: string;

  @IsAlphanumeric()
  @IsNotEmpty()
  integrationId: string;

  @IsEnum(ChannelName)
  channel: ChannelName;

  @IsEnum(['sandbox', 'live'])
  environment: 'sandbox' | 'live';
}

export class CreatePaymentOrderDtoAdmin {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  @IsOptional()
  merchantId: number;

  @IsNotEmpty()
  @IsOptional()
  memberId: number;

  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsNotEmpty()
  userMobileNumber: string;

  @IsEnum(ChannelName)
  channel: ChannelName;
}
