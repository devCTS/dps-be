import { PartialType } from '@nestjs/mapped-types';
import { CreateMemberDto } from './create-member.dto';
import { Exclude } from 'class-transformer';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  @IsBoolean()
  @IsNotEmpty()
  updateLoginCredentials: boolean;
}
