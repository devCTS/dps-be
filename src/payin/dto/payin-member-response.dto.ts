import { Exclude, Expose, Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  CallBackStatus,
  ChannelName,
  GatewayName,
  OrderStatus,
  PaymentMadeOn,
} from 'src/utils/enum/enum';
import { TransformTransactionDetails } from './payin-admin-response.dto';

@Exclude()
export class PayinMemberResponseDto {
  @Expose()
  id: string;

  @Expose()
  systemOrderId: string;

  @Expose()
  amount: number;

  @Expose()
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  status: string;

  @Expose()
  channel: ChannelName;

  @Expose()
  @Transform(({ value }) => value?.name, { toClassOnly: true })
  user: string;

  @Expose()
  commission: number;

  @Expose()
  quotaDebit: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class PayinDetailsMemberResDto {
  @Expose()
  id: string;

  @Expose()
  systemOrderId: string;

  @Expose()
  amount: number;

  @Expose()
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  status: OrderStatus;

  @Expose()
  channel: ChannelName;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Transform(
    ({ value }) => ({
      name: value?.name,
      mobile: value?.mobile,
      email: value?.email,
    }),
    { toClassOnly: true },
  )
  user: {};

  @Expose()
  quotaDetails: {};

  @Expose()
  @TransformTransactionDetails()
  transactionDetails: {};
}
