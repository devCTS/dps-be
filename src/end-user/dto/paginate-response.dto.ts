import { Exclude, Expose, Transform } from 'class-transformer';
import { Merchant } from 'src/merchant/entities/merchant.entity';

@Exclude()
export class EndUserPaginateResponseDto {
  @Expose()
  id: number;

  @Expose()
  userId: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  mobile: string;

  @Expose()
  channel: string;

  @Expose()
  channelDetails: string;

  @Expose()
  isBlacklisted: boolean;

  @Expose()
  totalPayinAmount: number;

  @Expose()
  totalPayoutAmount: number;

  @Expose()
  merchant: Merchant;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
