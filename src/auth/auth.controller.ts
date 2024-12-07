import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/singup.dto';
import { VerifyOtpDto } from './dto/verifyotp.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { UserInReq } from 'src/utils/decorators/user-in-req.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('sign-in')
  async signIn(@Request() request, @Body() signinDto: SignInDto) {
    const clientIp = request.connection.remoteAddress.substring(7);
    return await this.service.signin(signinDto, clientIp);
  }

  @Post('sign-up')
  signUp(@Body() signupDto: SignUpDto): Promise<any> {
    return this.service.signupMember(signupDto);
  }

  @Post('verify-otp')
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<any> {
    return this.service.verifyOtp(verifyOtpDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.service.forgotPassword(forgotPasswordDto);
  }

  @Post('verify-otp-forgot-password')
  verifyOtpForgotPassword(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.service.verifyOtpForForgotPassword(verifyOtpDto);
  }

  @Post('change-password')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @UserInReq() user,
  ) {
    return this.service.changePassword(changePasswordDto, user?.id);
  }
}
