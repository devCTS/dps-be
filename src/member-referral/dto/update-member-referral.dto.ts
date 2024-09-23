import { PartialType } from '@nestjs/mapped-types';
import { CreateMemberReferralDto } from './create-member-referral.dto';

export class UpdateMemberReferralDto extends PartialType(CreateMemberReferralDto) {}
