import { IsString } from 'class-validator';

export class CreateEndUserDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  channel: string;

  @IsString()
  channelDetails: string;
}
