import { Repository } from 'typeorm';
import { Merchant } from './entities/merchant.entity';

export class MerchantRepository extends Repository<Merchant> {}
