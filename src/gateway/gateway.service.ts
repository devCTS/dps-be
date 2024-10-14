import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { UpdateChannelSettingsDto } from './dto/create-channel-settings.dto';
import { ChannelSettings } from './entities/channel-settings.entity';
import { plainToInstance } from 'class-transformer';
import { RazorpayResponseDto } from './dto/razorpay-response.dto';
import { PhonepeResponseDto } from './dto/phonepe-response.dto';
import { loadChannelData } from './data/channel.data';

@Injectable()
export class GatewayService {
  constructor(
    @InjectRepository(Razorpay)
    private readonly razorpayRepository: Repository<Razorpay>,
    @InjectRepository(ChannelSettings)
    private readonly channelSettingsRepository: Repository<ChannelSettings>,
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
    const isGatewayExists = await this.razorpayRepository.find();

    if (isGatewayExists?.length > 0) throw new ConflictException();

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

  async getRazorpay() {
    const razorpayData = await this.razorpayRepository.find();
    if (!razorpayData) throw new NotFoundException();
    const result = plainToInstance(RazorpayResponseDto, razorpayData[0]);
    return result;
  }

  async updateRazorpay(updateRazorpayDto: UpdateRazorpayDto) {
    const secretTextKeys = this.secretTextKeysRazorpay;

    const existingData = await this.razorpayRepository.find();
    if (!existingData) throw new NotFoundException();

    const updatedData = Object.assign({}, existingData[0], updateRazorpayDto);

    secretTextKeys.forEach((key) => {
      if (updateRazorpayDto[key]) {
        updatedData[key] = this.jwtService.getHashPassword(updatedData[key]);
      }
    });

    await this.razorpayRepository.update(existingData[0].id, updatedData);
    return HttpStatus.OK;
  }

  async createPhonepe(createPhonepeDto: CreatePhonepeDto) {
    const isGatewayExists = await this.phonepeRepository.find();

    if (isGatewayExists?.length > 0) throw new ConflictException();

    const phonepeSecretKeys = this.secretTextKeysPhonepe;

    phonepeSecretKeys.forEach((key) => {
      createPhonepeDto[key] = this.jwtService.getHashPassword(
        createPhonepeDto[key],
      );
    });

    await this.phonepeRepository.save(createPhonepeDto);
    return HttpStatus.OK;
  }

  async getPhonepe() {
    const phonepeData = await this.phonepeRepository.find();
    if (!phonepeData) throw new NotFoundException();
    const result = plainToInstance(PhonepeResponseDto, phonepeData[0]);
    return result;
  }

  async updatePhonepe(updatePhonepeDto: UpdatePhonepDto) {
    const secretKeysPhonepe = this.secretTextKeysPhonepe;

    const existingData = await this.phonepeRepository.find();
    if (!existingData) throw new NotFoundException();

    const updatedData = Object.assign({}, existingData[0], updatePhonepeDto);

    secretKeysPhonepe.forEach((key) => {
      if (updatePhonepeDto[key]) {
        updatedData[key] = this.jwtService.getHashPassword(
          updatePhonepeDto[key],
        );
      }
    });

    await this.phonepeRepository.update(existingData[0].id, updatedData);
    return HttpStatus.OK;
  }

  async createChannelSettings() {
    const isDataExists = await this.channelSettingsRepository.find();

    if (isDataExists?.length > 0)
      throw new ConflictException('Data already exists');

    const channelSettings = loadChannelData();

    const channelData = channelSettings.map((channelsetting) =>
      this.channelSettingsRepository.create(channelsetting),
    );

    await this.channelSettingsRepository.save(channelData);

    return HttpStatus.OK;
  }

  async updateChannelSettings(
    id: number,
    updateChannelSettingsDto: UpdateChannelSettingsDto,
  ) {
    const existingSettings = await this.channelSettingsRepository.findOneBy({
      id,
    });

    if (!existingSettings) throw new NotFoundException();

    const updatedSettings = Object.assign(
      {},
      existingSettings,
      updateChannelSettingsDto,
    );

    if (updatedSettings.maxAmount < updatedSettings.minAmount)
      throw new BadRequestException(
        'Max amount should be greater than min amount.',
      );

    await this.channelSettingsRepository.update(id, updatedSettings);

    return HttpStatus.OK;
  }
}
