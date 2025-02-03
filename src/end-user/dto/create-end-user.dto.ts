import { IsOptional, IsString } from 'class-validator';
import { Merchant } from 'src/merchant/entities/merchant.entity';

export class CreateEndUserDto {
  @IsString()
  name: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsString()
  channel: string;

  @IsString()
  @IsOptional()
  channelDetails?: string;

  merchant: Merchant;
}
