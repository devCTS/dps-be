import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from 'src/services/jwt/jwt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Identity } from './entities/identity.entity';
import { Repository } from 'typeorm';
import { SignInDto } from './dto/signin.dto';
import { generateRandomOTP } from 'src/utils/utils';
import { SignUpDto } from './dto/singup.dto';
import { VerifyOtpDto } from './dto/verifyotp.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { Member } from 'src/member/entities/member.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { Submerchant } from 'src/sub-merchant/entities/sub-merchant.entity';
import { IP } from './entities/ip.entity';

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
export class IdentityService {
  membersContexts: MemberContextMap;
  forgotPasswordContexts: ForogotPasswordContextMap;

  constructor(
    @InjectRepository(Identity)
    private identityRepository: Repository<Identity>,
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Submerchant)
    private subMerchantRepository: Repository<Submerchant>,

    @InjectRepository(IP)
    private ipRepository: Repository<IP>,
    private readonly jwtService: JwtService,
  ) {
    this.membersContexts = {};
    this.forgotPasswordContexts = {};
  }

  makeAndSendOtp(email) {
    return 282907;
  }

  async getUserID(
    identityId: number,
    role: 'MERCHANT' | 'SUB_MERCHANT' | 'MEMBER' | 'SUPER_ADMIN' | 'SUB_ADMIN',
  ) {
    const query = { where: { identity: { id: identityId } } };
    switch (role) {
      case 'SUB_ADMIN':
      case 'SUPER_ADMIN':
        const admin = await this.adminRepository.findOne(query);
        return admin.id;

      case 'MEMBER':
        const member = await this.memberRepository.findOne(query);
        return member.id;

      case 'MERCHANT':
        const merchant = await this.merchantRepository.findOne(query);
        return merchant.id;

      case 'SUB_MERCHANT':
        const submerchant = await this.subMerchantRepository.findOne(query);
        return submerchant.id;
    }
  }

  async create(
    email: string,
    password: string,
    userType:
      | 'MERCHANT'
      | 'SUB_MERCHANT'
      | 'MEMBER'
      | 'SUPER_ADMIN'
      | 'SUB_ADMIN',
  ) {
    // Check if an Identity with the given email already exists
    const existingIdentity = await this.identityRepository.findOne({
      where: { email },
    });

    if (existingIdentity) {
      throw new ConflictException('A user with this email already exists.');
    }

    // Hash the password before saving
    const hashedPassword = this.jwtService.getHashPassword(password);

    // Create and save the Identity
    const identity = this.identityRepository.create({
      email,
      password: hashedPassword,
      userType: userType,
    });

    await this.identityRepository.save(identity);

    return identity;
  }

  async signin(signinDto: SignInDto) {
    const identity = await this.identityRepository.findOne({
      where: { email: signinDto.email },
    });
    if (!identity) {
      throw new UnauthorizedException('User name or pawword is incorrect');
    }

    const password = signinDto.password;

    if (
      !this.jwtService.isHashedPasswordVerified(password, identity.password)
    ) {
      throw new UnauthorizedException('User name or pawword is incorrect');
    }

    const jwt = this.jwtService.createToken({
      id: await this.getUserID(identity.id, identity.userType),
      email: identity.email,
      type: identity.userType,
    });

    return { jwt, type: identity.userType };
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
    } else return 'Provided OTP is incorrect.';
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

      return this.jwtService.createToken({
        userId: identity.email,
        userType: identity.userType,
      });
    } else return 'Provided OTP is incorrect.';
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const existingIdentity = await this.identityRepository.findOne({
      where: { email: changePasswordDto.email },
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
      throw new UnauthorizedException('User name or pawword is incorrect');
    }

    const hashedPassword = this.jwtService.getHashPassword(
      changePasswordDto.newPassword,
    );
    const identity = await this.identityRepository.findOne({
      where: { email: changePasswordDto.email },
    });

    this.identityRepository.update(
      { email: changePasswordDto.email },
      { password: hashedPassword },
    );

    const jwt = this.jwtService.createToken({
      userId: identity.email,
      userType: identity.userType,
    });

    return { jwt, type: identity.userType };
  }

  findAll() {
    return `This action returns all identity`;
  }

  findOne(id: number) {
    return `This action returns a #${id} identity`;
  }

  update(id: number, updateIdentityDto: any) {
    return `This action updates a #${id} identity`;
  }

  async remove(id: number) {
    await this.identityRepository.delete(id);
  }

  async updateIps(ips: string[], identity: Identity): Promise<IP[]> {
    // Step 1: Delete existing IPs for the given identity
    await this.ipRepository.delete({ identity });

    // Step 2: Create and save new IP entities
    const ipEntities: IP[] = [];

    for (const ipValue of ips) {
      const ip = new IP();
      ip.value = ipValue;
      ip.identity = identity;

      ipEntities.push(ip);
    }

    // Step 3: Save all new IP entities in bulk
    return this.ipRepository.save(ipEntities);
  }

  async deleteIps(identity: Identity) {
    await this.ipRepository.delete({ identity });
  }
}
