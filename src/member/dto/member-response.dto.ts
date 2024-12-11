import { MemberReferral } from 'src/member-referral/entities/member-referral.entity';
import { Exclude, Expose, Transform } from 'class-transformer';
import { Identity } from 'src/identity/entities/identity.entity';
import { DateFormat } from 'src/utils/decorators/dateformat.decorator';
import { ChannelProfileDto } from 'src/utils/dtos/channel-profile.dto';
import { roundOffAmount } from 'src/utils/utils';

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
  @Transform(({ obj }) => roundOffAmount(obj.balance), {
    toClassOnly: true,
  })
  balance: number;

  @Expose()
  @Transform(({ obj }) => roundOffAmount(obj.quota), {
    toClassOnly: true,
  })
  quota: number;

  @Expose()
  @Transform(
    ({ obj }) =>
      obj?.memberReferral?.member?.firstName +
      ' ' +
      obj?.memberReferral?.member?.lastName,
    {
      toClassOnly: true,
    },
  )
  memberReferral: string;

  @Expose()
  teamId: string;
}
