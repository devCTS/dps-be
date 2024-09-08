import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { Exclude, Expose, Transform } from 'class-transformer';
import { Identity } from 'src/identity/entities/identity.entity';
import { Rename } from 'src/utils/decorators/rename.decorator';
import { DateFormat } from 'src/utils/decorators/dateformat.decorator';

@Exclude()
export class MemberResponseDto {
  @Expose()
  @Transform(({ obj }) => obj.identity.email, { toClassOnly: true })
  email: string;

  @Exclude()
  identity: Identity; // Assuming Identity is an object you want to exclude from the response

  @Expose()
  @Rename('first_name')
  firstName: string;

  @Expose()
  @Rename('last_name')
  lastName: string;

  @Expose()
  @Transform(({ obj }) => obj.phone ?? null, { toClassOnly: true }) // Handle optional field
  phone: string | null;

  @Expose()
  id: number;

  @Expose()
  enabled: boolean;

  @Expose()
  @Rename('payin_commission_rate') // Add any other relevant renaming
  payinCommissionRate: number;

  @Expose()
  @Rename('payout_commission_rate') // Add any other relevant renaming
  payoutCommissionRate: number;

  @Expose()
  @Rename('topup_commission_rate') // Add any other relevant renaming
  topupCommissionRate: number;

  @Expose()
  @Rename('single_payout_upper_limit') // Add any other relevant renaming
  singlePayoutUpperLimit: number;

  @Expose()
  @Rename('single_payout_lower_limit') // Add any other relevant renaming
  singlePayoutLowerLimit: number;

  @Expose()
  @Rename('daily_total_payout_limit') // Add any other relevant renaming
  dailyTotalPayoutLimit: number;

  @Expose()
  @Rename('created_at')
  @DateFormat()
  createdAt: Date;

  @Expose()
  @Rename('updated_at')
  @DateFormat()
  updatedAt: Date;
}
