import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { RegisterDto } from './dto/register.dto';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { ChangePasswordDto } from 'src/identity/dto/changePassword.dto';
import { IdentityService } from 'src/identity/identity.service';
import { PayoutMemberService } from 'src/payout/payout-member.service';
import { VerifyWithdrawalPasswordDto } from './dto/verify-withdrawal-password.dto';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';

@Controller('member')
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
    private identityService: IdentityService,
    private readonly payoutMemberService: PayoutMemberService,
  ) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.memberService.create(createMemberDto);
  }

  @Post('register')
  @Roles(Role.MEMBER)
  @UseGuards(RolesGuard)
  register(@Body() registerDto: RegisterDto) {
    return this.memberService.registerViaSignup(registerDto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  @UseGuards(RolesGuard)
  findAll() {
    return this.memberService.findAll();
  }

  @Get('profile/:id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.memberService.getProfile(id);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string) {
    return this.memberService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.memberService.update(+id, updateMemberDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.memberService.remove(+id);
  }

  @Post('paginate')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  paginate(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.memberService.paginate(paginateRequestDto);
  }

  @Post('change-password/:id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.memberService.changePassword(changePasswordDto, id);
  }

  @Post('payouts/paginate')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  paginatePayouts(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.payoutMemberService.paginate(paginateRequestDto);
  }

  @Get('payout/:id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  getPayoutDetails(@Param('id') id: string) {
    return this.payoutMemberService.getPayoutDetails(id);
  }

  @Post('verify-withdrawal-password')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  verifyWithdrawalPassword(
    @Body() verifyWithdrawalPasswordDto: VerifyWithdrawalPasswordDto,
  ) {
    return this.memberService.verifyWithdrawalPassword(
      verifyWithdrawalPasswordDto,
    );
  }
}
