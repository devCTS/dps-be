import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ChannelName } from 'src/utils/enum/enum';

export class CreateWithdrawalDto {
  @IsString()
  channel: ChannelName;

  @IsString()
  channelDetails: string;

  @IsNumber()
  withdrawalAmount: number;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
