import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { SignInDto } from './dto/signin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Identity } from 'src/users/identity/entities/identity.entity';
import { Repository } from 'typeorm';
import { Users } from 'src/utils/enums/users';
import { JwtService } from 'src/integrations/jwt/jwt.service';
import { SignUpDto } from './dto/singup.dto';
import { VerifyOtpDto } from './dto/verifyotp.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';

type MemberContext = {
  firstName: string;
  lastName: string;
  isVerified: boolean;
  otp: number;
};

type MemberContextMap = {
  [key: string]: MemberContext;
};

type ForogotPasswordContext = {
  password: string;
  isVerified: boolean;
  otp: number;
};

type ForogotPasswordContextMap = {
  [key: string]: ForogotPasswordContext;
};

@Injectable()
export class AuthService {
  membersContexts: MemberContextMap;
  forgotPasswordContexts: ForogotPasswordContextMap;

  constructor(
    @InjectRepository(Identity)
    private identityRepository: Repository<Identity>,
    private readonly jwtService: JwtService,
  ) {
    this.membersContexts = {};
    this.forgotPasswordContexts = {};
  }

  makeAndSendOtp(email) {
    return 282907;
  }

  async signin(signinDto: SignInDto, clientIp?: string) {
    const identity = await this.identityRepository.findOne({
      where: { email: signinDto.email },
    });

    if (!identity) {
      throw new UnauthorizedException('User name or password is incorrect');
    }

    // if (identity.userType === Users.MERCHANT) {
    //   let whiteListedIps = [];
    //   const merchant = await this.merchantRepository.findOne({
    //     where: {
    //       identity,
    //     },
    //     relations: ['identity', 'identity.ips'],
    //   });

    //   if (merchant.identity.ips.length > 0) {
    //     merchant.identity.ips.forEach((item) =>
    //       whiteListedIps.push(item.value),
    //     );

    //     if (!whiteListedIps.includes(clientIp)) {
    //       throw new ForbiddenException('Ip restricted');
    //     }
    //   }
    // }

    const password = signinDto.password;

    if (
      !this.jwtService.isHashedPasswordVerified(password, identity.password)
    ) {
      throw new UnauthorizedException('User name or password is incorrect');
    }

    if (!identity?.enabled) {
      throw new ForbiddenException('This user is currently disabled');
    }

    const token = this.jwtService.createToken({
      id: identity.id,
      email: identity.email,
      type: identity.userType,
    });

    return token;
  }

  async signupMember(signupDto: SignUpDto): Promise<any> {
    // Check if an Identity with the given email already exists

    const existingIdentity = await this.identityRepository.findOne({
      where: { email: signupDto.email },
    });

    if (existingIdentity) {
      throw new ConflictException('A user with this email already exists.');
    }

    this.membersContexts[signupDto.email] = {
      firstName: signupDto.firstName,
      lastName: signupDto.lastName,
      isVerified: false,
      otp: this.makeAndSendOtp(signupDto.email),
    };

    return {
      email: signupDto.email,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<any> {
    const email = verifyOtpDto.email;
    const requiredMember = this.membersContexts[email];
    if (!requiredMember)
      throw new NotFoundException('Invalid Request: Request Context not found');

    if (requiredMember.otp === verifyOtpDto.otp) {
      this.membersContexts[email].isVerified = true;

      return {
        email,
        firstName: requiredMember.firstName,
        lastName: requiredMember.lastName,
      };
    } else throw new UnauthorizedException('Provided OTP is incorrect.');
  }

  async isMemberVerifedForRegister(email) {
    const requiredMember = this.membersContexts[email];
    if (!requiredMember || !requiredMember.isVerified)
      throw new NotFoundException('Invalid Request: Request Context not found');

    return requiredMember;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const existingIdentity = await this.identityRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    if (!existingIdentity) {
      throw new ConflictException('User with this email does not exist');
    }

    this.forgotPasswordContexts[forgotPasswordDto.email] = {
      password: forgotPasswordDto.password,
      isVerified: false,
      otp: this.makeAndSendOtp(forgotPasswordDto.email),
    };

    return {
      email: forgotPasswordDto.email,
    };
  }

  async verifyOtpForForgotPassword(verifyOtpDto: VerifyOtpDto) {
    const email = verifyOtpDto.email;
    const requiredContext = this.forgotPasswordContexts[email];
    if (!requiredContext)
      throw new NotFoundException('Invalid Request: Request Context not found');

    if (requiredContext.otp === verifyOtpDto.otp) {
      this.forgotPasswordContexts[email].isVerified = true;
      const hashedPassword = this.jwtService.getHashPassword(
        requiredContext.password,
      );
      const identity = await this.identityRepository.findOne({
        where: { email: verifyOtpDto.email },
      });

      this.identityRepository.update(
        { email: verifyOtpDto.email },
        { password: hashedPassword },
      );

      if (!identity?.enabled) {
        throw new ForbiddenException('This user is currently disabled');
      }

      const token = this.jwtService.createToken({
        id: identity.id,
        email: identity.email,
        type: identity.userType,
      });

      return token;
    } else throw new UnauthorizedException('Provided OTP is incorrect.');
  }

  async changePassword(changePasswordDto: ChangePasswordDto, id: string) {
    const existingIdentity = await this.identityRepository.findOne({
      where: { id: id },
    });
    if (!existingIdentity) {
      throw new ConflictException('User with this email does not exist');
    }
    if (
      !this.jwtService.isHashedPasswordVerified(
        changePasswordDto.oldPassword,
        existingIdentity.password,
      )
    ) {
      throw new UnauthorizedException('Password is incorrect');
    }
    const hashedPassword = this.jwtService.getHashPassword(
      changePasswordDto.newPassword,
    );
    const identity = await this.identityRepository.findOne({
      where: { id },
    });
    this.identityRepository.update({ id }, { password: hashedPassword });
    const jwt = this.jwtService.createToken({
      userId: identity.email,
      userType: identity.userType,
    });
    return HttpStatus.OK;
  }
}
