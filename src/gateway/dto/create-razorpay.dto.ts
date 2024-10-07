import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateRazorpayDto {
  @IsNotEmpty()
  @IsBoolean()
  incoming: boolean;

  @IsNotEmpty()
  @IsBoolean()
  outgoing: boolean;

  @IsNotEmpty()
  @IsString()
  key_secret: string;

  @IsNotEmpty()
  @IsString()
  key_id: string;

  @IsNotEmpty()
  @IsString()
  sandbox_key_id: string;

  @IsNotEmpty()
  @IsString()
  sandbox_key_secret: string;
}

export class UpdateRazorpayDto extends PartialType(CreateRazorpayDto) {}
