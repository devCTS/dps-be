import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ChannelProfileFieldDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  regex: string;

  @IsString()
  @IsNotEmpty()
  errorMessage: string;

  @IsBoolean()
  optional: boolean;

  @Exclude()
  filledFields: any[];
}

export class ChannelProfileFieldResponseDto {
  @Expose()
  id: number;

  @Expose()
  label: string;

  @Expose()
  regex: string;

  @Expose()
  errorMessage: string;

  @Expose()
  optional: boolean;

  @Expose()
  filledFields: any[];
}
