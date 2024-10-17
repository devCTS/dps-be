import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PayoutService } from './payout.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdatePayoutDto } from './dto/update-payout.dto';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';

@Controller('payout')
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post()
  create(@Body() createPayoutDto: CreatePayoutDto) {
    return this.payoutService.create(createPayoutDto);
  }

  @Get()
  findAll() {
    return this.payoutService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payoutService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePayoutDto: UpdatePayoutDto) {
    return this.payoutService.update(+id, updatePayoutDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payoutService.remove(+id);
  }

  @Post('update-status-assigned')
  updatePayinStatusToAssigned(@Body() body) {
    return this.payoutService.updatePayoutStatusToAssigned(body);
  }

  @Post('update-status-completed')
  updatePayinStatusToCompleted(@Body() body) {
    return this.payoutService.updatePayoutStatusToComplete(body);
  }

  @Post('update-status-failed')
  updatePayinStatusToFailed(@Body() body) {
    return this.payoutService.updatePayoutStatusToFailed(body);
  }

  @Post('update-status-submitted')
  updatePayinStatusToSubmitted(@Body() body) {
    return this.payoutService.updatePayoutStatusToSubmitted(body);
  }
}