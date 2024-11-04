import { PayoutMerchantService } from './../payout/payout-merchant.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { IdentityService } from 'src/identity/identity.service';
import { ChangePasswordDto } from 'src/identity/dto/changePassword.dto';
import { PayoutService } from 'src/payout/payout.service';
import { VerifyWithdrawalPasswordDto } from './dto/verify-withdrawal-password.dto';

@Controller('merchant')
export class MerchantController {
  constructor(
    private readonly merchantService: MerchantService,
    private identityService: IdentityService,
    private readonly payoutMerchantService: PayoutMerchantService,
  ) {}

  @Post()
  create(@Body() createMerchantDto: CreateMerchantDto) {
    return this.merchantService.create(createMerchantDto);
  }

  @Get()
  findAll() {
    return this.merchantService.findAll();
  }

  @Get('profile/:id')
  getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.merchantService.getProfile(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.merchantService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMerchantDto: UpdateMerchantDto,
  ) {
    return this.merchantService.update(+id, updateMerchantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.merchantService.remove(+id);
  }

  @Post('paginate')
  paginate(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.merchantService.paginate(paginateRequestDto);
  }

  @Post('change-password/:id')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.merchantService.changePassword(changePasswordDto, id);
  }

  @Post('change-withdrawal-password/:id')
  changeWithdrawalPassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.merchantService.changeWithdrawalPassword(changePasswordDto, id);
  }

  @Post('payouts/paginate')
  paginatePayouts(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.payoutMerchantService.paginate(paginateRequestDto);
  }

  @Get('payout/:id')
  getPayoutDetails(@Param('id') id: string) {
    return this.payoutMerchantService.getPayoutDetails(id);
  }

  @Post('verify-withdrawal-password')
  verifyWithdrawalPassword(
    @Body() verifyWithdrawalPasswordDto: VerifyWithdrawalPasswordDto,
  ) {
    return this.merchantService.verifyWithdrawalPassword(
      verifyWithdrawalPasswordDto,
    );
  }
}
