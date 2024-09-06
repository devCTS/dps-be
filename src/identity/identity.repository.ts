import { Repository } from 'typeorm';
import { Identity } from './entities/identity.entity';

export class IdentityRepository extends Repository<Identity> {}
