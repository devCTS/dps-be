import { Repository } from 'typeorm';
import { Member } from './member.entity';

export class MemberRepository extends Repository<Member> {}
