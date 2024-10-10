import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionUpdateDto } from './create-transaction-update.dto';

export class UpdateTransactionUpdateDto extends PartialType(CreateTransactionUpdateDto) {}
