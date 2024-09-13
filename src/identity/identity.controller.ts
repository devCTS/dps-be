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
} from '@nestjs/common';
import { IdentityService } from './identity.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/singup.dto';
import { VerifyOtpDto } from './dto/verifyotp.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { Request, Response } from 'express';

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

  @Post('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const { jwt, type } =
        await this.identityService.changePassword(changePasswordDto);
      response.cookie('dps_token', `Bearer_${jwt}`, {
        httpOnly: true,
        maxAge: 2 * 60 * 60 * 1000,
      });
      return { message: 'Password Changed.', type };
    } catch (error) {
      console.error(error);
      return { message: 'Failed.', error: error.message };
    }
  }

  @Get()
  findAll() {
    return this.identityService.findAll();
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.identityService.findOne(+id);
  }
}
