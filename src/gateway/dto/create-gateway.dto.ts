import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateGatewayDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsBoolean()
  incomingStatus?: boolean;

  @IsOptional()
  @IsBoolean()
  outgoingStatus?: boolean;

  @IsNotEmpty()
  @IsArray()
  @IsObject({ each: true })
  uatMerchantKeys: {
    label: string;
    value: string;
  }[];

  @IsNotEmpty()
  @IsArray()
  @IsObject({ each: true })
  prodMerchantKeys: {
    label: string;
    value: string;
  }[];

  @IsNotEmpty()
  @IsArray()
  @IsObject({ each: true })
  channels: {
    id: number;
    payinsEnabled: boolean;
    payoutsEnabled: boolean;
    payinFees: string;
    payoutFees: string;
    lowerLimitForPayins: string;
    upperLimitForPayins: string;
    lowerLimitForPayouts: string;
    upperLimitForPayouts: string;
  }[];
}
