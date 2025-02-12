import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreatePayuDto {
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
  client_id: string;

  @IsNotEmpty()
  @IsString()
  client_secret: string;

  @IsNotEmpty()
  @IsString()
  sandbox_merchant_id: string;

  @IsNotEmpty()
  @IsString()
  sandbox_client_id: string;

  @IsNotEmpty()
  @IsString()
  sandbox_client_secret: string;
}

export class UpdatePayuDto extends PartialType(CreatePayuDto) {}
