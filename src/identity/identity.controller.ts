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

  @Get()
  findAll() {
    return this.identityService.findAll();
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.identityService.findOne(+id);
  }

  @Put('current-balance/:id')
  getCurrentBalance(@Param('id') id: string) {
    return this.identityService.getCurrentBalalnce(id);
  }
}
