import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';

export class MemberRepository extends Repository<Member> {}
