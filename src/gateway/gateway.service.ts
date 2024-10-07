import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateRazorpayDto,
  UpdateRazorpayDto,
} from './dto/create-razorpay.dto';
import { JwtService } from 'src/services/jwt/jwt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Razorpay } from './entities/razorpay.entity';
import { Repository } from 'typeorm';
import { CreatePhonepeDto, UpdatePhonepDto } from './dto/create-phonepe.dto';
import { Phonepe } from './entities/phonepe.entity';

@Injectable()
export class GatewayService {
  constructor(
    @InjectRepository(Razorpay)
    private readonly razorpayRepository: Repository<Razorpay>,
    @InjectRepository(Phonepe)
    private readonly phonepeRepository: Repository<Phonepe>,
    private jwtService: JwtService,
  ) {}

  secretTextKeysRazorpay = [
    'key_secret',
    'key_id',
    'sandbox_key_id',
    'sandbox_key_secret',
  ];

  secretTextKeysPhonepe = [
    'merchant_id',
    'sandbox_salt_index',
    'sandbox_salt_key',
    'sandbox_merchant_id',
    'salt_index',
    'salt_key',
  ];

  async createRazorPay(createRazorPayDto: CreateRazorpayDto) {
    const secretTextKeys = this.secretTextKeysRazorpay;

    secretTextKeys.forEach((key) => {
      secretTextKeys.forEach((key) => {
        createRazorPayDto[key] = this.jwtService.getHashPassword(
          createRazorPayDto[key],
        );
      });
    });

    await this.razorpayRepository.save(createRazorPayDto);
    return HttpStatus.OK;
  }

  async updateRazorpay(id: number, updateRazorpayDto: UpdateRazorpayDto) {
    const secretTextKeys = this.secretTextKeysRazorpay;

    const existingData = await this.razorpayRepository.findOneBy({ id });
    if (!existingData) throw new NotFoundException();

    const updatedData = Object.assign({}, existingData, updateRazorpayDto);

    secretTextKeys.forEach((key) => {
      if (updateRazorpayDto[key]) {
        updatedData[key] = this.jwtService.getHashPassword(updatedData[key]);
      }
    });

    await this.razorpayRepository.update(id, updatedData);
    return HttpStatus.OK;
  }

  async createPhonepe(createPhonepeDto: CreatePhonepeDto) {
    const phonepeSecretKeys = this.secretTextKeysPhonepe;

    phonepeSecretKeys.forEach((key) => {
      createPhonepeDto[key] = this.jwtService.getHashPassword(
        createPhonepeDto[key],
      );
    });

    await this.phonepeRepository.save(createPhonepeDto);
    return HttpStatus.OK;
  }

  async updatePhonepe(id: number, updatePhonepeDto: UpdatePhonepDto) {
    const secretKeysPhonepe = this.secretTextKeysPhonepe;

    const existingData = await this.phonepeRepository.findOneBy({ id });
    if (!existingData) throw new NotFoundException();

    const updatedData = Object.assign({}, existingData, updatePhonepeDto);

    secretKeysPhonepe.forEach((key) => {
      if (updatePhonepeDto[key]) {
        updatedData[key] = this.jwtService.getHashPassword(
          updatePhonepeDto[key],
        );
      }
    });

    await this.phonepeRepository.update(id, updatedData);
    return HttpStatus.OK;
  }
}
