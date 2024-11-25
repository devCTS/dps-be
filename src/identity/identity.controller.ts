import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import { IdentityService } from './identity.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/singup.dto';
import { VerifyOtpDto } from './dto/verifyotp.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';

@Controller('identity')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Post('sign-in')
  async signIn(@Body() signinDto: SignInDto) {
    return await this.identityService.signin(signinDto);
  }

  @Post('sign-up')
  signUp(@Body() signupDto: SignUpDto): Promise<any> {
    return this.identityService.signupMember(signupDto);
  }

  @Post('verify-otp')
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<any> {
    return this.identityService.verifyOtp(verifyOtpDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.identityService.forgotPassword(forgotPasswordDto);
  }

  @Post('verify-otp-forgot-password')
  verifyOtpForgotPassword(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.identityService.verifyOtpForForgotPassword(verifyOtpDto);
  }

  @Put('current-balance/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ALL)
  getCurrentBalance(@Param('id') id: string) {
    return this.identityService.getCurrentBalalnce(id);
  }

  @Put('user-details/current-balance/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ALL)
  getUserCurrentBalance(@Param('id') id: string, @Body() body) {
    return this.identityService.getUserCurrentBalance(+id, body);
  }

  @Put('user-details/current-quota/:sendingMemberId')
  @UseGuards(RolesGuard)
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN, Role.MEMBER)
  getmemberCurrentQuotas(
    @Param('sendingMemberId') sendingMemberId: string,
    @Body() body,
  ) {
    return this.identityService.getMembersQuota(sendingMemberId, body);
  }
}
