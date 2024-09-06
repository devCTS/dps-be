import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChannelDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  tag: string;

  @IsOptional()
  @IsBoolean()
  incoming_status: boolean;

  @IsOptional()
  @IsBoolean()
  outgoing_status: boolean;
}
