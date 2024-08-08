import { Controller, Get, Post } from '@nestjs/common';
import { PhonepeService } from './phonepe.service';

@Controller('phonepe')
export class PhonepeController {
  constructor(private phonepeService: PhonepeService) {}

  @Get()
  phonepePayement() {
    return this.phonepeService.phonepePayement();
  }
}
