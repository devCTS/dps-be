import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from 'src/services/jwt/jwt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Identity } from './entities/identity.entity';
import { In, Repository } from 'typeorm';
import { SignInDto } from './dto/signin.dto';
import {
  extractToken,
  generateRandomOTP,
  roundOffAmount,
  verifyToken,
} from 'src/utils/utils';
import { SignUpDto } from './dto/singup.dto';
import { VerifyOtpDto } from './dto/verifyotp.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { Member } from 'src/member/entities/member.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { Submerchant } from 'src/sub-merchant/entities/sub-merchant.entity';
import { IP } from './entities/ip.entity';
import { Agent } from 'src/agent/entities/agent.entity';
import { Payout } from 'src/payout/entities/payout.entity';
import { Withdrawal } from 'src/withdrawal/entities/withdrawal.entity';
import { OrderStatus, Role, WithdrawalOrderStatus } from 'src/utils/enum/enum';
import { send } from 'process';

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
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,

    @InjectRepository(IP)
    private ipRepository: Repository<IP>,
    private readonly jwtService: JwtService,

    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
  ) {
    this.membersContexts = {};
    this.forgotPasswordContexts = {};
  }

  makeAndSendOtp(email) {
    return 282907;
  }

  async getUser(
    identityId: number,
    role:
      | 'MERCHANT'
      | 'SUB_MERCHANT'
      | 'MEMBER'
      | 'SUPER_ADMIN'
      | 'SUB_ADMIN'
      | 'AGENT',
  ) {
    const query = { where: { identity: { id: identityId } } };
    switch (role) {
      case 'SUB_ADMIN':
      case 'SUPER_ADMIN':
        const admin = await this.adminRepository.findOne(query);
        return admin;

      case 'MEMBER':
        const member = await this.memberRepository.findOne(query);
        return member;

      case 'MERCHANT':
        const merchant = await this.merchantRepository.findOne(query);
        return merchant;

      case 'SUB_MERCHANT':
        const submerchant = await this.subMerchantRepository.findOne(query);
        return submerchant;

      case 'AGENT':
        const agent = await this.agentRepository.findOne(query);
        return agent;
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
      | 'SUB_ADMIN'
      | 'AGENT',
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

  async signin(signinDto: SignInDto, clientIp?: string) {
    const identity = await this.identityRepository.findOne({
      where: { email: signinDto.email },
    });

    if (!identity) {
      throw new UnauthorizedException('User name or password is incorrect');
    }

    if (identity.userType.toLocaleLowerCase() === Role.MERCHANT) {
      let whiteListedIps = [];
      const merchant = await this.merchantRepository.findOne({
        where: {
          identity,
        },
        relations: ['identity', 'identity.ips'],
      });

      if (merchant.identity.ips.length > 0) {
        merchant.identity.ips.forEach((item) =>
          whiteListedIps.push(item.value),
        );

        if (!whiteListedIps.includes(clientIp)) {
          throw new ForbiddenException('Ip restricted');
        }
      }
    }

    const password = signinDto.password;

    if (
      !this.jwtService.isHashedPasswordVerified(password, identity.password)
    ) {
      throw new UnauthorizedException('User name or password is incorrect');
    }

    const user = await this.getUser(identity.id, identity.userType);
    if (!user?.enabled) {
      throw new ForbiddenException('This user is currently disabled');
    }

    const token = this.jwtService.createToken({
      id: user.id,
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

      const user = await this.getUser(identity.id, identity.userType);
      if (!user?.enabled) {
        throw new ForbiddenException('This user is currently disabled');
      }

      const token = this.jwtService.createToken({
        id: user.id,
        email: identity.email,
        type: identity.userType,
      });

      return token;
    } else throw new UnauthorizedException('Provided OTP is incorrect.');
  }

  async changePassword(changePasswordDto: ChangePasswordDto, id: number) {
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
      throw new UnauthorizedException('User name or password is incorrect');
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
    return { jwt, type: identity.userType };
  }

  async updateLogin(id: number, newEmail: string, newPassword: string) {
    const hashedPassword = this.jwtService.getHashPassword(newPassword);

    await this.identityRepository.update(
      { id: id },
      { email: newEmail, password: hashedPassword },
    );
  }

  async remove(id: number) {
    await this.identityRepository.delete(id);
  }

  async updateIps(ips: string[], identity: Identity): Promise<IP[]> {
    // Step 1: Delete existing IPs for the given identity
    if (!ips || ips.length < 1) return;
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

  async getCurrentBalalnce(email) {
    const identity = await this.identityRepository.findOne({
      where: { email },
      relations: ['merchant', 'member', 'agent'],
    });
    let outstandingBalance = 0;
    let currentBalance = 0;

    if (identity?.member) currentBalance = identity.member.balance;
    if (identity?.agent) currentBalance = identity.agent.balance;

    if (identity?.merchant) {
      currentBalance = identity.merchant.balance;
      const pendingBalancePayoutRows = await this.payoutRepository.find({
        where: {
          merchant: { id: identity.merchant.id },
          status: In([
            OrderStatus.INITIATED,
            OrderStatus.ASSIGNED,
            OrderStatus.SUBMITTED,
          ]),
        },
      });

      outstandingBalance = pendingBalancePayoutRows.reduce(
        (acc, curr) => acc + curr.amount,
        0,
      );
    }

    const pendingBalanceWithdrawalRows = await this.withdrawalRepository.find({
      where: {
        user: { id: identity.id },
        status: WithdrawalOrderStatus.PENDING,
      },
    });
    outstandingBalance =
      outstandingBalance +
      pendingBalanceWithdrawalRows.reduce((acc, curr) => acc + curr.amount, 0);

    return roundOffAmount(currentBalance - outstandingBalance);
  }

  //   async getUserIdByIdentity(identityId) {
  //     const identity = await this.identityRepository.findOne({
  //       where: { id: identityId },
  //       relations: ['merchant', 'member', 'agent'],
  //     });

  //     if (identity.member) return identity.member.id;
  //     if (identity.agent) currentBalance = identity.agent.balance;

  //     if (identity.merchant) {
  //       currentBalance = identity.merchant.balance;
  //       const pendingBalancePayoutRows = await this.payoutRepository.find({
  //         where: {
  //           merchant: { id: identity.merchant.id },
  //           status: In([
  //             OrderStatus.INITIATED,
  //             OrderStatus.ASSIGNED,
  //             OrderStatus.SUBMITTED,
  //           ]),
  //         },
  //       });

  //       outstandingBalance = pendingBalancePayoutRows.reduce(
  //         (acc, curr) => acc + curr.amount,
  //         0,
  //       );
  //     }

  //     const pendingBalanceWithdrawalRows = await this.withdrawalRepository.find({
  //       where: {
  //         user: { id: identity.id },
  //         status: WithdrawalOrderStatus.PENDING,
  //       },
  //     });
  //     outstandingBalance =
  //       outstandingBalance +
  //       pendingBalanceWithdrawalRows.reduce((acc, curr) => acc + curr.amount, 0);
  //     console.log({ currentBalance, outstandingBalance });
  //     return currentBalance - outstandingBalance;
  //   }

  async getUserCurrentBalance(userId, body) {
    const { userType } = body;

    let amount;

    switch (userType) {
      case 'MERCHANT':
        amount = (await this.merchantRepository.findOneBy({ id: userId }))
          .balance;
        break;

      case 'MEMBER':
        amount = (await this.memberRepository.findOneBy({ id: userId })).quota;
        break;

      case 'AGENT':
        amount = (await this.agentRepository.findOneBy({ id: userId })).balance;
        break;

      default:
        throw new BadRequestException(
          'User type must be - MERCHANT, MEMBER or AGENT',
        );
    }

    if (!amount) throw new NotFoundException('User not found!');

    return roundOffAmount(amount);
  }

  async getMembersQuota(sendingMemberId, body) {
    const { receivingMemberEmail } = body;

    const sendingMember = await this.memberRepository.findOneBy({
      id: sendingMemberId,
    });
    if (!sendingMember)
      throw new NotFoundException('Sending member not found!');

    const receivingMember = await this.memberRepository.findOne({
      where: { identity: { email: receivingMemberEmail } },
      relations: ['identity'],
    });
    if (!receivingMember)
      throw new NotFoundException('Receiving member not found!');

    return {
      sendingMemberQuota: roundOffAmount(sendingMember.quota),
      receivingMemberQuota: roundOffAmount(receivingMember.quota),
    };
  }
}
