import { Repository } from 'typeorm';
import { Identity } from './entities/identity.entity';
import { IP } from './entities/ip.entity';

export class IdentityRepository extends Repository<Identity> {}

export class IpRepository extends Repository<IP> {}
