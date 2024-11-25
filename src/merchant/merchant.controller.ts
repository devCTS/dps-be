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
  UseGuards,
} from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { IdentityService } from 'src/identity/identity.service';
import { ChangePasswordDto } from 'src/identity/dto/changePassword.dto';
import { VerifyWithdrawalPasswordDto } from './dto/verify-withdrawal-password.dto';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';

@Controller('merchant')
export class MerchantController {
  constructor(
    private readonly merchantService: MerchantService,
    private identityService: IdentityService,
    private readonly payoutMerchantService: PayoutMerchantService,
  ) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MERCHANT)
  @UseGuards(RolesGuard)
  create(@Body() createMerchantDto: CreateMerchantDto) {
    return this.merchantService.create(createMerchantDto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  @UseGuards(RolesGuard)
  findAll() {
    return this.merchantService.findAll();
  }

  @Get('profile/:id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MERCHANT)
  @UseGuards(RolesGuard)
  getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.merchantService.getProfile(id);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MERCHANT)
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string) {
    return this.merchantService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MERCHANT)
  @UseGuards(RolesGuard)
  update(
    @Param('id') id: string,
    @Body() updateMerchantDto: UpdateMerchantDto,
  ) {
    return this.merchantService.update(+id, updateMerchantDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MERCHANT)
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.merchantService.remove(+id);
  }

  @Post('paginate')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MERCHANT)
  @UseGuards(RolesGuard)
  paginate(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.merchantService.paginate(paginateRequestDto);
  }

  @Post('change-password/:id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MERCHANT)
  @UseGuards(RolesGuard)
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.merchantService.changePassword(changePasswordDto, id);
  }

  @Post('change-withdrawal-password/:id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MERCHANT)
  @UseGuards(RolesGuard)
  changeWithdrawalPassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.merchantService.changeWithdrawalPassword(changePasswordDto, id);
  }

  @Post('payouts/paginate')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MERCHANT)
  @UseGuards(RolesGuard)
  paginatePayouts(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.payoutMerchantService.paginate(paginateRequestDto);
  }

  @Get('payout/:id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MERCHANT)
  @UseGuards(RolesGuard)
  getPayoutDetails(@Param('id') id: string) {
    return this.payoutMerchantService.getPayoutDetails(id);
  }

  @Post('verify-withdrawal-password')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MERCHANT)
  @UseGuards(RolesGuard)
  verifyWithdrawalPassword(
    @Body() verifyWithdrawalPasswordDto: VerifyWithdrawalPasswordDto,
  ) {
    return this.merchantService.verifyWithdrawalPassword(
      verifyWithdrawalPasswordDto,
    );
  }
}
