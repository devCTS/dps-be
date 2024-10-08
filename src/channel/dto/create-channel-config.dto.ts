import { IsBoolean, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ChannelName } from 'src/utils/enum/enum';
import { PrimaryGeneratedColumn } from 'typeorm';

export class CreateChannelConfigDto {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsEnum(ChannelName)
  name: ChannelName;

  @IsNotEmpty()
  @IsBoolean()
  incoming: boolean;

  @IsNotEmpty()
  @IsBoolean()
  outgoing: boolean;
}
