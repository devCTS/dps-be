import { Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { ChannelProfileDto } from 'src/utils/dtos/channel-profile.dto';
import { GatewayName } from 'src/utils/enum/enum';

export class CreateSystemConfigDto {
  // Gateways and Timeouts
  @IsEnum(GatewayName)
  defaultPayinGateway: GatewayName;

  @IsEnum(GatewayName)
  defaultPayoutGateway: GatewayName;

  @IsEnum(GatewayName)
  defaultWithdrawalGateway: GatewayName;

  @IsNumber()
  payinTimeout: number;

  @IsNumber()
  payoutTimeout: number;

  @IsString()
  currency: string;

  // Topup Configurations
  @IsNumber()
  topupThreshold: number;

  @IsNumber()
  topupAmount: number;

  @IsOptional()
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
  withdrawalRate: number;

  @IsNumber()
  minWithdrawalAmount: number;

  @IsNumber()
  maxWithdrawalAmount: number;
}
