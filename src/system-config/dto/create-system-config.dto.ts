import { Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ChannelProfileDto } from 'src/utils/dtos/channel-profile.dto';

export class CreateSystemConfigDto {
  // Gateways and Timeouts
  @IsNumber()
  defaultPayinGateway: number;

  @IsNumber()
  defaultPayoutGateway: number;

  @IsNumber()
  defaultWithdrawalGateway: number;

  @IsNumber()
  payinTimeout: number;

  @IsNumber()
  payoutTimeout: number;

  @IsString()
  currency: string;

  // Topup Configurations
  @IsString()
  topupThreshold: string;

  @IsNumber()
  topupAmount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChannelProfileDto)
  defaultTopupChannels: ChannelProfileDto[];

  // Member Defaults
  @IsNumber()
  payinCommissionRateForMember: number;

  @IsNumber()
  payoutCommissionRateForMember: number;

  @IsNumber()
  topupCommissionRateForMember: number;

  @IsNumber()
  minimumPayoutAmountForMember: number;

  @IsNumber()
  maximumPayoutAmountForMember: number;

  @IsNumber()
  maximumDailyPayoutAmountForMember: number;

  // Merchant Defaults
  @IsNumber()
  payinServiceRateForMerchant: number;

  @IsNumber()
  payoutServiceRateForMerchant: number;

  @IsNumber()
  minimumPayoutAmountForMerchant: number;

  @IsNumber()
  maximumPayoutAmountForMerchant: number;

  @IsNumber()
  withdrawalServiceRateForMerchant: number;

  @IsNumber()
  minimumWithdrawalAmountForMerchant: number;

  @IsNumber()
  maximumWithdrawalAmountForMerchant: number;
}
