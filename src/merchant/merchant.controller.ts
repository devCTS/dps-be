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
import { UserInReq } from 'src/utils/decorators/user-in-req.decorator';

@Controller('merchant')
@UseGuards(RolesGuard)
export class MerchantController {
  constructor(
    private readonly merchantService: MerchantService,
    private identityService: IdentityService,
    private readonly payoutMerchantService: PayoutMerchantService,
  ) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MERCHANT)
  create(@Body() createMerchantDto: CreateMerchantDto) {
    return this.merchantService.create(createMerchantDto);
  }

  // @Get()
  // @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  // findAll() {
  //   return this.merchantService.findAll();
  // }

  @Get()
  @Roles(Role.MERCHANT)
  getProfile(@UserInReq() user) {
    return this.merchantService.getProfile(user.id);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  findOne(@Param('id') id: string) {
    return this.merchantService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateMerchantDto: UpdateMerchantDto,
  ) {
    return this.merchantService.update(+id, updateMerchantDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  remove(@Param('id') id: string) {
    return this.merchantService.remove(+id);
  }

  @Post('paginate')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  paginate(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.merchantService.paginate(paginateRequestDto);
  }

  @Post('change-password')
  @Roles(Role.MERCHANT)
  changePassword(
    @UserInReq() user,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.merchantService.changePassword(changePasswordDto, user.id);
  }

  @Post('change-withdrawal-password')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MERCHANT)
  changeWithdrawalPassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @UserInReq() user,
  ) {
    return this.merchantService.changeWithdrawalPassword(
      changePasswordDto,
      user.id,
    );
  }

  // @Post('payouts/paginate')
  // @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MERCHANT)
  // paginatePayouts(@Body() paginateRequestDto: PaginateRequestDto) {
  //   return this.payoutMerchantService.paginate(paginateRequestDto);
  // }

  // @Get('payout/:id')
  // @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MERCHANT)
  // getPayoutDetails(@Param('id') id: string) {
  //   return this.payoutMerchantService.getPayoutDetails(id);
  // }

  @Post('verify-withdrawal-password')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MERCHANT)
  verifyWithdrawalPassword(
    @UserInReq() user,
    @Body() verifyWithdrawalPasswordDto: VerifyWithdrawalPasswordDto,
  ) {
    return this.merchantService.verifyWithdrawalPassword(
      verifyWithdrawalPasswordDto,
      user.id,
    );
  }
}
