import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import {
  CreateRazorpayDto,
  UpdateRazorpayDto,
} from './dto/create-razorpay.dto';
import { GatewayService } from './gateway.service';
import { CreatePhonepeDto, UpdatePhonepDto } from './dto/create-phonepe.dto';

@Controller('gateway')
export class GatewayController {
  constructor(private gatewayService: GatewayService) {}

  @Post('razorpay/create')
  CreateRazorpay(@Body() createRazorpayDto: CreateRazorpayDto) {
    return this.gatewayService.createRazorPay(createRazorpayDto);
  }

  @Post('razorpay/update/:id')
  UpdateRazorpay(
    @Body() updateRazorpayDto: UpdateRazorpayDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.gatewayService.updateRazorpay(id, updateRazorpayDto);
  }

  @Post('phonepe/create')
  createPhonepe(@Body() createPhonepeDto: CreatePhonepeDto) {
    return this.gatewayService.createPhonepe(createPhonepeDto);
  }

  @Post('phonepe/update/:id')
  updatePhonepe(
    @Body() updatePhonepeDto: UpdatePhonepDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.gatewayService.updatePhonepe(id, updatePhonepeDto);
  }
}
