import { PartialType } from '@nestjs/mapped-types';
import { CreateTopupDto } from './create-topup.dto';

export class UpdateTopupDto extends PartialType(CreateTopupDto) {}
