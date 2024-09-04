import { Repository } from 'typeorm';
import { Identity } from './identity.entity';

export class IdentityRepository extends Repository<Identity> {}
