import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { Exclude, Expose, Transform } from 'class-transformer';
import { Identity } from 'src/identity/entities/identity.entity';
import { Rename } from 'src/utils/decorators/rename.decorator';
import { DateFormat } from 'src/utils/decorators/dateformat.decorator';
import { TransformChannelProfileFields } from 'src/utils/decorators/channel-profile.decorator';

@Exclude()
export class MemberResponseDto {
  @Expose()
  @Transform(({ obj }) => obj.identity.email, { toClassOnly: true })
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  referralCode: string;

  @Expose()
  lastName: string;

  @Expose()
  @Transform(({ obj }) => obj.phone ?? null, { toClassOnly: true }) // Handle optional field
  phone: string | null;

  @Expose()
  telegramId: string;

  @Expose()
  id: number;

  @Expose()
  enabled: boolean;

  @Expose()
  payinCommissionRate: number;

  @Expose()
  payoutCommissionRate: number;

  @Expose()
  topupCommissionRate: number;

  @Expose()
  singlePayoutUpperLimit: number;

  @Expose()
  singlePayoutLowerLimit: number;

  @Expose()
  dailyTotalPayoutLimit: number;

  @Expose()
  withdrawalRate: number;

  @Expose()
  minWithdrawalAmount: number;

  @Expose()
  maxWithdrawalAmount: number;

  @Expose()
  @DateFormat()
  createdAt: Date;

  @Expose()
  @DateFormat()
  updatedAt: Date;

  @Expose()
  @TransformChannelProfileFields()
  channelProfile: any;

  @Exclude()
  identity: Identity;
}
