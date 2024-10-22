import { IsOptional, IsString } from 'class-validator';

export class CreateEndUserDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  mobile: string;

  @IsString()
  channel: string;

  @IsString()
  @IsOptional()
  channelDetails?: string;
}
