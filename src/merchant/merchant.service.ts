import { HttpStatus, Injectable } from '@nestjs/common';
import { encryptPassword, generateJwtToken } from 'src/utils/utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdentityService } from 'src/identity/identity.service';
import { Merchant } from './merchant.entity';
import { MerchantRegistrationDto } from './dto/merchant.dto';

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    private identityService: IdentityService,
  ) {}

  async registerMerchant(registrationDetails: MerchantRegistrationDto) {
    const { email, password, phone, first_name, last_name } =
      registrationDetails;

    const isUserExists = await this.merchantRepository.findOneBy({ email });
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

    // insert data to merchant table
    await this.merchantRepository.save({
      email,
      phone,
      first_name,
      last_name,
      identity: identityInserted,
    });

    return jwtToken;
  }
}
