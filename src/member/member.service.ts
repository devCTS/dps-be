import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IdentityService } from 'src/identity/identity.service';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { MemberRegisterDto, MemberUpdateDto } from './dto/member.dto';
import { encryptPassword } from 'src/utils/utils';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    private identityService: IdentityService,
  ) {}

  // Get Member by Identity id
  async getMemberByIdentityId(identity_id: number) {
    return await this.memberRepository.findOne({
      where: { identity: { id: identity_id } },
    });
  }

  // Get Member details by user name
  async getMemberByUserName(user_name: string) {
    const memberIdentity =
      await this.identityService.getIdentityByUserName(user_name);

    if (!memberIdentity) {
      throw new NotFoundException('Member not found.');
    }

    const memberData = await this.getMemberByIdentityId(memberIdentity.id);
    delete memberData.identity;
    delete memberIdentity.password;
    return { ...memberIdentity, ...memberData };
  }

  // Register member
  async registerMember(memberRegisterData: MemberRegisterDto) {
    const { user_name, password, email, phone, first_name, last_name } =
      memberRegisterData;
    const identity =
      await this.identityService.getIdentityByUserName(user_name);
    if (identity) {
      throw new ConflictException('Member already exists. Please login');
    }

    const hashedPassword = await encryptPassword(password);

    const data = await this.identityService.registerIdentity({
      email,
      password: hashedPassword,
      user_name,
      user_type: 'member',
    });

    await this.memberRepository.save({
      phone,
      first_name,
      last_name,
      identity: data,
    });

    return {
      memberRegisterData,
      status: HttpStatus.CREATED,
      message: 'Member created.',
    };
  }

  // Get all members
  async getAllMembers() {
    return await this.memberRepository.find();
  }

  // Update member details
  async updateMemberDetails(
    memberUpdateData: MemberUpdateDto,
    user_name: string,
  ) {
    const memberIdentity =
      await this.identityService.getIdentityByUserName(user_name);
    if (!memberIdentity) {
      throw new NotFoundException('Member account not found.');
    }

    const memberData = await this.getMemberByIdentityId(memberIdentity.id);

    await this.memberRepository.update(memberData.id, {
      ...memberData,
      ...memberUpdateData,
    });

    return { message: 'Member data updated.', memberUpdateData };
  }

  // delete one member
  async deleteOneMember(user_name: string) {
    const member = await this.getMemberByUserName(user_name);

    if (!member) {
      throw new NotFoundException('User does not exists.');
    }
    if (member.user_type === 'super-admin') {
      throw new ForbiddenException('Deleting this user is not permitted');
    }
    await this.identityService.deleteUserById(member.id);

    return { message: 'User deleted.' };
  }
}
