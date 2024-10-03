import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentSystemDto } from './create-payment-system.dto';

export class UpdatePaymentSystemDto extends PartialType(CreatePaymentSystemDto) {}
