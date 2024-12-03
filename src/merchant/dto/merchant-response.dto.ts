import { Exclude, Expose, plainToClass, Transform } from 'class-transformer';
import { DateFormat } from 'src/utils/decorators/dateformat.decorator';
import { TransformChannelList } from 'src/utils/decorators/channel-list.decorator';
import { PayinMode } from '../entities/payinMode.entity';
import { TransformPayinModeDetails } from 'src/utils/decorators/payin-mode.decorator';
import { TransformChannelProfileFields } from 'src/utils/decorators/channel-profile.decorator';
import { ChannelProfileDto } from 'src/utils/dtos/channel-profile.dto';
import { roundOffAmount } from 'src/utils/utils';
import { AmountRangePayinMode } from '../entities/amountRangePayinMode.entity';
import { ProportionalPayinMode } from '../entities/proportionalPayinMode.entity';
import { ServiceRateType } from 'src/utils/enum/enum';

@Exclude()
export class MerchantResponseDto {
  @Expose()
  @Transform(({ obj }) => obj.identity.email, { toClassOnly: true })
  email: string;

  @Expose()
  @TransformPayinModeDetails()
  payinModeDetails: PayinMode;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  phone: string;

  @Expose()
  id: number;

  @Expose()
  enabled: boolean;

  @Expose()
  @DateFormat()
  createdAt: Date;

  @Expose()
  @DateFormat()
  updatedAt: Date;

  @Expose()
  businessName: string;

  @Expose()
  referralCode: string;

  @Expose()
  integrationId: string;

  @Expose()
  businessUrl: string;

  @Expose()
  allowMemberChannelsPayin: boolean;

  @Expose()
  allowPgBackupForPayin: boolean;

  @Expose()
  allowMemberChannelsPayout: boolean;

  @Expose()
  allowPgBackupForPayout: boolean;

  @Expose()
  payinServiceRate: ServiceRateType;

  @Expose()
  payoutServiceRate: ServiceRateType;

  @Expose()
  withdrawalServiceRate: number;

  @Expose()
  minPayout: number;

  @Expose()
  maxPayout: number;

  @Expose()
  minWithdrawal: number;

  @Expose()
  maxWithdrawal: number;

  @Expose()
  payinMode: 'DEFAULT' | 'PROPORTIONAL' | 'AMOUNT RANGE';

  @Expose()
  @Transform(({ obj }) => obj.identity?.ips?.map((ip) => ip.value), {
    toClassOnly: true,
  })
  ips: string[];

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
  payinChannels: number[];

  @Expose()
  payoutChannels: number[];

  @Expose()
  numberOfRangesOrRatio?: number;

  @Expose()
  @Transform(({ obj }) => roundOffAmount(obj.balance), {
    toClassOnly: true,
  })
  balance: number;

  @Expose()
  withdrawalsCompleted: number;

  @Expose()
  frozenAmount: number;

  @Expose()
  @Transform(
    ({ obj }) => {
      return (
        obj?.payinModeDetails?.amountRangeRange.map((item) => ({
          ...item,
          lower: parseInt(item.lower),
          upper: parseInt(item.upper),
        })) || []
      );
    },
    { toClassOnly: true },
  )
  amountRangeRange: AmountRangePayinMode[];

  @Expose()
  @Transform(
    ({ obj }) => {
      return (
        obj?.payinModeDetails?.proportionalRange.map((item) => ({
          ratio: item.ratio,
          gateway: item.gateway,
        })) || []
      );
    },
    { toClassOnly: true },
  )
  propotionRatio: ProportionalPayinMode[];
}
