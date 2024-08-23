import { HttpStatus, Injectable } from '@nestjs/common';
import { MemberRegistrationDto } from './dto/member.dto';
import { encryptPassword, generateJwtToken } from 'src/utils/utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './member.entity';
import { Repository } from 'typeorm';
import { IdentityService } from 'src/identity/identity.service';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    private identityService: IdentityService,
  ) {}

  async registerMember(registrationDetails: MemberRegistrationDto) {
    const { email, password, phone, first_name, last_name } =
      registrationDetails;

    const isUserExists = await this.memberRepository.findOneBy({ email });
    if (isUserExists) {
      return {
        status: HttpStatus.CONFLICT,
        message: 'User already exists. Please Sign in.',
      };
    }

    // generate password hash with salts and generate jwt token
    const hashedPassword = await encryptPassword(password);
    const jwtToken = await generateJwtToken(email, hashedPassword);

    // Insert data to identity table
    const identityInserted = await this.identityService.registerIdentity({
      email,
      phone,
      password: hashedPassword,
    });

    // insert data to member table
    await this.memberRepository.save({
      email,
      phone,
      first_name,
      last_name,
      identity: identityInserted,
    });

    return jwtToken;
  }
}
