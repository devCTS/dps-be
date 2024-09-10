import { PartialType } from '@nestjs/mapped-types';
import { CreateMemberDto } from './create-member.dto';
import { Exclude } from 'class-transformer';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {}
