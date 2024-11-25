import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PhonepeService } from './phonepe.service';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';

@Controller('phonepe')
export class PhonepeController {
  constructor(private phonepeService: PhonepeService) {}

  @Get()
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  phonepePayement() {
    return this.phonepeService.phonepePayement();
  }
}
