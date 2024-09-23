import { PartialType } from '@nestjs/mapped-types';
import { CreateAgentReferralDto } from './create-agent-referral.dto';

export class UpdateAgentReferralDto extends PartialType(CreateAgentReferralDto) {}
