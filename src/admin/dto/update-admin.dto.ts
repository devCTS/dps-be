import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminDto } from './create-admin.dto';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  @IsBoolean()
  @IsNotEmpty()
  updateLoginCredentials: boolean;
}
