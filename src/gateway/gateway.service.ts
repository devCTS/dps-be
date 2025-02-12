import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateRazorpayDto } from './dto/create-razorpay.dto';
import { JwtService } from 'src/services/jwt/jwt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Razorpay } from './entities/razorpay.entity';
import { Repository } from 'typeorm';
import { UpdatePhonepDto } from './dto/create-phonepe.dto';
import { Phonepe } from './entities/phonepe.entity';
import { UpdateChannelSettingsDto } from './dto/create-channel-settings.dto';
import { ChannelSettings } from './entities/channel-settings.entity';
import { plainToInstance } from 'class-transformer';
import { GatewayResponseDto } from './dto/gateway-response.dto';
import { loadChannelData } from './data/channel.data';
import { GetChannelSettingsDto } from './dto/get-channel-settings.dto';
import {
  loadPayuData,
  loadPhonepeData,
  loadRazorpayData,
  loadUniqpayData,
} from './data/gateway.data';
import { Uniqpay } from './entities/uniqpay.entity';
import { UpdateUniqpayDto } from './dto/create-uniqpay.dto';
import { Payu } from './entities/payu.entity';
import { UpdatePayuDto } from './dto/create-payu.dto';

@Injectable()
export class GatewayService {
  constructor(
    @InjectRepository(ChannelSettings)
    private readonly channelSettingsRepository: Repository<ChannelSettings>,
    @InjectRepository(Razorpay)
    private readonly razorpayRepository: Repository<Razorpay>,
    @InjectRepository(Phonepe)
    private readonly phonepeRepository: Repository<Phonepe>,
    @InjectRepository(Uniqpay)
    private readonly uniqpayRepository: Repository<Uniqpay>,
    @InjectRepository(Payu)
    private readonly payuRepository: Repository<Payu>,

    private jwtService: JwtService,
  ) {}

  secretTextKeysRazorpay = [
    'key_secret',
    'key_id',
    'sandbox_key_id',
    'sandbox_key_secret',
    'account_number',
    'sandbox_account_number',
  ];

  secretTextKeysUniqpay = ['uniqpay_id', 'client_id', 'client_secret'];

  secretTextKeysPhonepe = [
    'merchant_id',
    'sandbox_salt_index',
    'sandbox_salt_key',
    'sandbox_merchant_id',
    'salt_index',
    'salt_key',
  ];

  secretTextKeysPayu = [
    'client_id',
    'client_secret',
    'merchant_id',
    'sandbox_client_id',
    'sandbox_client_secret',
    'sandbox_merchant_id',
  ];

  async createRazorPay() {
    const isGatewayExists = await this.razorpayRepository.find();

    const createRazorPayDto = loadRazorpayData();

    if (isGatewayExists?.length > 0) throw new ConflictException();

    const secretTextKeys = this.secretTextKeysRazorpay;

    secretTextKeys.forEach((key) => {
      secretTextKeys.forEach((key) => {
        createRazorPayDto[key] = this.jwtService.encryptValue(
          createRazorPayDto[key],
        );
      });
    });

    await this.razorpayRepository.save(createRazorPayDto);
  }

  async getRazorpay() {
    const razorpayData = await this.razorpayRepository.find();
    if (!razorpayData) throw new NotFoundException();
    const result = plainToInstance(GatewayResponseDto, razorpayData[0]);
    return result;
  }

  async updateRazorpay(updateRazorpayDto: UpdateRazorpayDto) {
    const secretTextKeys = this.secretTextKeysRazorpay;

    const existingData = await this.razorpayRepository.find();
    if (!existingData) throw new NotFoundException();

    const updatedData = Object.assign({}, existingData[0], updateRazorpayDto);

    secretTextKeys.forEach((key) => {
      if (updateRazorpayDto[key]) {
        updatedData[key] = this.jwtService.encryptValue(updatedData[key]);
      }
    });

    await this.razorpayRepository.update(existingData[0].id, updatedData);
    return HttpStatus.OK;
  }

  async createPhonepe() {
    const isGatewayExists = await this.phonepeRepository.find();
    const createPhonepeDto = loadPhonepeData();

    if (isGatewayExists?.length > 0) throw new ConflictException();

    const phonepeSecretKeys = this.secretTextKeysPhonepe;

    phonepeSecretKeys.forEach((key) => {
      createPhonepeDto[key] = this.jwtService.encryptValue(
        createPhonepeDto[key],
      );
    });

    await this.phonepeRepository.save(createPhonepeDto);
  }

  async getPhonepe() {
    const phonepeData = await this.phonepeRepository.find();
    if (!phonepeData) throw new NotFoundException();
    const result = plainToInstance(GatewayResponseDto, phonepeData[0]);
    return result;
  }

  async updatePhonepe(updatePhonepeDto: UpdatePhonepDto) {
    const secretKeysPhonepe = this.secretTextKeysPhonepe;

    const existingData = await this.phonepeRepository.find();
    if (!existingData) throw new NotFoundException();

    const updatedData = Object.assign({}, existingData[0], updatePhonepeDto);

    secretKeysPhonepe.forEach((key) => {
      if (updatePhonepeDto[key]) {
        updatedData[key] = this.jwtService.encryptValue(updatePhonepeDto[key]);
      }
    });

    await this.phonepeRepository.update(existingData[0].id, updatedData);
    return HttpStatus.OK;
  }

  async createUniqpay() {
    const isGatewayExists = await this.uniqpayRepository.find();

    const createUniqpayDto = loadUniqpayData();

    if (isGatewayExists?.length > 0) throw new ConflictException();

    const secretTextKeys = this.secretTextKeysUniqpay;

    secretTextKeys.forEach((key) => {
      createUniqpayDto[key] = this.jwtService.encryptValue(
        createUniqpayDto[key],
      );
    });

    await this.uniqpayRepository.save(createUniqpayDto);
  }

  async getUniqpay() {
    const uniqpayData = await this.uniqpayRepository.find();
    if (!uniqpayData) throw new NotFoundException();
    const result = plainToInstance(GatewayResponseDto, uniqpayData[0]);
    return result;
  }

  async updateUniqpay(updateUniqpayDto: UpdateUniqpayDto) {
    const secretTextKeys = this.secretTextKeysUniqpay;

    const existingData = await this.uniqpayRepository.find();
    if (!existingData) throw new NotFoundException();

    const updatedData = Object.assign({}, existingData[0], updateUniqpayDto);

    secretTextKeys.forEach((key) => {
      if (updateUniqpayDto[key])
        updatedData[key] = this.jwtService.encryptValue(updatedData[key]);
    });

    await this.uniqpayRepository.update(existingData[0]?.id, updatedData);
    return HttpStatus.OK;
  }

  async createPayu() {
    const isGatewayExists = await this.payuRepository.find();

    const createPayuDto = loadPayuData();

    if (isGatewayExists?.length > 0) throw new ConflictException();

    const secretTextKeys = this.secretTextKeysPayu;

    secretTextKeys.forEach((key) => {
      createPayuDto[key] = this.jwtService.encryptValue(createPayuDto[key]);
    });

    await this.payuRepository.save(createPayuDto);
  }

  async getPayu() {
    const payuData = await this.payuRepository.find();
    if (!payuData) throw new NotFoundException();

    const result = plainToInstance(GatewayResponseDto, payuData[0]);
    return result;
  }

  async updatePayu(updatePayuDto: UpdatePayuDto) {
    const secretTextKeys = this.secretTextKeysPayu;

    const existingData = await this.payuRepository.find();
    if (!existingData) throw new NotFoundException();

    const updatedData = Object.assign({}, existingData[0], updatePayuDto);

    secretTextKeys.forEach((key) => {
      if (updatePayuDto[key])
        updatedData[key] = this.jwtService.encryptValue(updatedData[key]);
    });

    await this.payuRepository.update(existingData[0]?.id, updatedData);
    return HttpStatus.OK;
  }

  async getAllChannelsSetting() {
    const channelSettingsExists = await this.channelSettingsRepository.find();

    if (!channelSettingsExists)
      throw new NotFoundException('Channels not found.');

    return channelSettingsExists;
  }

  async getChannelSettings(getChannelSettingsDto: GetChannelSettingsDto) {
    const { channelName, type, gatewayName } = getChannelSettingsDto;

    if (!channelName || !type || !gatewayName) throw new BadRequestException();

    const channelSetting = await this.channelSettingsRepository.findOne({
      where: {
        channelName,
        type,
        gatewayName,
      },
    });

    if (!channelSetting)
      throw new NotFoundException('Channel setting not found.');

    return channelSetting;
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
  }

  async updateChannelSettings(
    updateChannelSettingsDto: UpdateChannelSettingsDto,
  ) {
    const { channelName, type, gatewayName } = updateChannelSettingsDto;

    if (!channelName || !type || !gatewayName) throw new BadRequestException();

    const channelsetting = await this.getChannelSettings({
      type,
      channelName,
      gatewayName,
    });

    if (!channelsetting)
      throw new NotFoundException('Channel settings not found.');

    await this.channelSettingsRepository.update(
      channelsetting.id,
      updateChannelSettingsDto,
    );

    return HttpStatus.OK;
  }
}
