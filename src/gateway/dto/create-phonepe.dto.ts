import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreatePhonepeDto {
  @IsNotEmpty()
  @IsBoolean()
  incoming: boolean;

  @IsNotEmpty()
  @IsBoolean()
  outgoing: boolean;

  @IsNotEmpty()
  @IsString()
  merchant_id: string;

  @IsNotEmpty()
  @IsString()
  salt_key: string;

  @IsNotEmpty()
  @IsString()
  salt_index: string;

  @IsNotEmpty()
  @IsString()
  sandbox_merchant_id: string;

  @IsNotEmpty()
  @IsString()
  sandbox_salt_key: string;

  @IsNotEmpty()
  @IsString()
  sandbox_salt_index: string;
}

export class UpdatePhonepDto extends PartialType(CreatePhonepeDto) {}
