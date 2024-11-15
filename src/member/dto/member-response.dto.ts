import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { Identity } from 'src/identity/entities/identity.entity';
import { DateFormat } from 'src/utils/decorators/dateformat.decorator';
import { ChannelProfileDto, UpiDto } from 'src/utils/dtos/channel-profile.dto';

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
  @Transform(
    ({ obj }) => {
      const channelProfile = {
        upi: obj.identity.upi,
        eWallet: obj.identity.eWallet,
        netBanking: obj.identity.netBanking,
      };
      return channelProfile;
    },
    { toClassOnly: true },
  )
  channelProfile: ChannelProfileDto;

  @Exclude()
  identity: Identity;

  @Expose()
  balance: number;

  @Expose()
  quota: number;
}
