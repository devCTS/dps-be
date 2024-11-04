import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { IsValidPassword } from 'src/utils/decorators/validPassword.decorator';
import { ChannelProfileDto } from 'src/utils/dtos/channel-profile.dto';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail(undefined, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsValidPassword()
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsValidPassword()
  withDrawalPassword: string;

  @IsString()
  @IsOptional()
  referralCode?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChannelProfileDto)
  channelProfile: ChannelProfileDto[];
}
