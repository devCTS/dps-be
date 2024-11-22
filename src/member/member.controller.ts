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

@Controller('member')
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
    private identityService: IdentityService,
    private readonly payoutMemberService: PayoutMemberService,
  ) {}

  // @Roles(Role.MEMBER)
  // @UseGuards(JwtGuard, RolesGuard)
  @Post()
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.memberService.create(createMemberDto);
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.memberService.registerViaSignup(registerDto);
  }

  @Get()
  findAll() {
    return this.memberService.findAll();
  }

  @Get('profile/:id')
  getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.memberService.getProfile(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.memberService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.memberService.update(+id, updateMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.memberService.remove(+id);
  }

  @Post('paginate')
  paginate(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.memberService.paginate(paginateRequestDto);
  }

  @Post('change-password/:id')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.memberService.changePassword(changePasswordDto, id);
  }

  @Post('payouts/paginate')
  paginatePayouts(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.payoutMemberService.paginate(paginateRequestDto);
  }

  @Get('payout/:id')
  getPayoutDetails(@Param('id') id: string) {
    return this.payoutMemberService.getPayoutDetails(id);
  }

  @Post('verify-withdrawal-password')
  verifyWithdrawalPassword(
    @Body() verifyWithdrawalPasswordDto: VerifyWithdrawalPasswordDto,
  ) {
    return this.memberService.verifyWithdrawalPassword(
      verifyWithdrawalPasswordDto,
    );
  }
}
