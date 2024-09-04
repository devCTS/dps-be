import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Merchant } from './merchant.entity';
import { Repository } from 'typeorm';
import { IdentityService } from 'src/identity/identity.service';
import { MerchantRegisterDto, MerchantSigninDto } from './dto/merchant.dt';
import {
  checkPassword,
  encryptPassword,
  generateJwtToken,
} from 'src/utils/utils';

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    private identityService: IdentityService,
  ) {}

  // Register merchant
  async registerMerchant(merchatRegisterData: MerchantRegisterDto) {
    const { email, password, user_name, phone, first_name, last_name } =
      merchatRegisterData;

    const merchantIdentity =
      await this.identityService.getIdentityByUserName(user_name);

    if (merchantIdentity) {
      throw new ConflictException('Identity already exists. Please Login');
    }

    const hashedPassword = await encryptPassword(password);

    const data = await this.identityService.registerIdentity({
      email,
      password: hashedPassword,
      user_name,
    });

    await this.merchantRepository.save({
      phone,
      first_name,
      last_name,
      identity: data,
    });

    return {
      merchatRegisterData,
      status: HttpStatus.CREATED,
      message: 'Merchant created.',
    };
  }

  // Sign in merchant
  async signInMerchant(merchantSigninData: MerchantSigninDto) {
    const { user_name, password } = merchantSigninData;
    const merchantIdentity =
      await this.identityService.getIdentityByUserName(user_name);

    if (!merchantIdentity) {
      throw new UnauthorizedException('User name or pawword is incorrect');
    }

    const hashedPassword = merchantIdentity.password;

    const isPasswordMatched = checkPassword(
      password,
      merchantIdentity.password,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedException('User name or pawword is incorrect');
    }

    return generateJwtToken({ user_name, hashedPassword });
  }
}
