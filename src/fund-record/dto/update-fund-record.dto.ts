import { PartialType } from '@nestjs/mapped-types';
import { CreateFundRecordDto } from './create-fund-record.dto';

export class UpdateFundRecordDto extends PartialType(CreateFundRecordDto) {}
