import { Exclude, Expose, Transform } from 'class-transformer';
import { DateFormat } from 'src/utils/decorators/dateformat.decorator';
import { TransformChannelList } from 'src/utils/decorators/channel-list.decorator';
import { PayinMode } from '../entities/payinMode.entity';
import { TransformPayinModeDetails } from 'src/utils/decorators/payin-mode.decorator';
import { TransformChannelProfileFields } from 'src/utils/decorators/channel-profile.decorator';

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
  payinServiceRate: number;

  @Expose()
  payoutServiceRate: number;

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
  @TransformChannelProfileFields()
  channelProfile: {
    channelName: string;
    fields: { label: string; value: string }[];
  }[];

  @Expose()
  @TransformChannelList('Payin')
  payinChannels: any[];

  @Expose()
  @TransformChannelList('Payout')
  payoutChannels: any[];

  @Expose()
  numberOfRangesOrRatio?: number;
}
