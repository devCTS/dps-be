import { Exclude, Expose, Transform } from 'class-transformer';
import { Identity } from 'src/identity/entities/identity.entity';
import { DateFormat } from 'src/utils/decorators/dateformat.decorator';
import { ChannelProfileDto } from 'src/utils/dtos/channel-profile.dto';
import { roundOffAmount } from 'src/utils/utils';

@Exclude()
export class AgentResponseDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  @Transform(({ obj }) => obj.identity.email, { toClassOnly: true })
  email: string;

  @Expose()
  @Transform(({ obj }) => obj.phone ?? null, { toClassOnly: true }) // Handle optional field
  phone: string | null;

  @Expose()
  referralCode: string;

  @Expose()
  enabled: boolean;

  @Expose()
  @DateFormat()
  createdAt: Date;

  @Expose()
  @DateFormat()
  updatedAt: Date;

  @Exclude()
  identity: Identity;

  @Expose()
  withdrawalRate: string;

  @Expose()
  minWithdrawalAmount: number;

  @Expose()
  maxWithdrawalAmount: number;

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

  @Expose()
  @Transform(({ obj }) => roundOffAmount(obj.balance), {
    toClassOnly: true,
  })
  balance: number;
}
