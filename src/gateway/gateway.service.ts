import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Between, ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';

import { Gateway } from './entities/gateway.entity';
import { Channel } from 'src/channel/entities/channel.entity';
import { MerchantKey } from './entities/MerchantKey.entity';
import { GatewayToChannel } from './entities/gatewayToChannel.entity';
import { plainToClass, plainToInstance } from 'class-transformer';
import { GatewayResponseDto } from './dto/gateway-response.dto';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';

@Injectable()
export class GatewayService {
  constructor(
    @InjectRepository(Gateway)
    private readonly gatewayRepository: Repository<Gateway>,
    @InjectRepository(GatewayToChannel)
    private readonly gatewayToChannelRepository: Repository<GatewayToChannel>,
    @InjectRepository(MerchantKey)
    private readonly merchantKeyRepository: Repository<MerchantKey>,
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
  ) {}

  async create(createGatewayDto: CreateGatewayDto) {
    const {
      name,
      logo,
      incomingStatus,
      outgoingStatus,
      merchantKeys,
      channels,
    } = createGatewayDto;

    // Save Gateway
    const gateway = await this.gatewayRepository.save({
      name,
      logo,
      incomingStatus,
      outgoingStatus,
    });

    // Save MerchantKey
    for (const key of merchantKeys)
      await this.merchantKeyRepository.save({
        label: key.label,
        value: key.value,
        type: key.type,
        gateway,
      });

    for (const channelData of channels) {
      const {
        id,
        payinsEnabled,
        payoutsEnabled,
        payinFees,
        payoutFees,
        lowerLimitForPayins,
        upperLimitForPayins,
        lowerLimitForPayouts,
        upperLimitForPayouts,
      } = channelData;

      const channel = await this.channelRepository.findOne({
        where: { id },
      });

      if (!channel)
        throw new NotFoundException(`Channel with ID ${id} not found`);

      // Create GatewayToChannel
      await this.gatewayToChannelRepository.save({
        gateway,
        channel,
        payinsEnabled,
        payoutsEnabled,
        payinFees,
        payoutFees,
        lowerLimitForPayins,
        upperLimitForPayins,
        lowerLimitForPayouts,
        upperLimitForPayouts,
      });
    }

    return HttpStatus.CREATED;
  }

  async findAll() {
    const gateways = await this.gatewayRepository.find({
      relations: [
        'gatewayToChannel',
        'merchantKey',
        'gatewayToChannel.channel',
      ],
    });

    return {
      total: gateways.length,
      data: plainToInstance(GatewayResponseDto, gateways),
    };
  }

  async findOne(id: number) {
    const gateway = await this.gatewayRepository.findOne({
      where: {
        id,
      },
      relations: [
        'gatewayToChannel',
        'merchantKey',
        'gatewayToChannel.channel',
      ],
    });

    if (!gateway) throw new NotFoundException();

    return plainToInstance(GatewayResponseDto, gateway);
  }

  async update(id: number, updateGatewayDto: UpdateGatewayDto) {
    const {
      name,
      logo,
      incomingStatus,
      outgoingStatus,
      merchantKeys,
      channels,
    } = updateGatewayDto;

    const gateway = await this.gatewayRepository.findOne({
      where: { id },
      relations: ['gatewayToChannel', 'merchantKey'],
    });

    if (!gateway) throw new NotFoundException();

    // Update Gateway
    await this.gatewayRepository.update(id, {
      name,
      logo,
      incomingStatus,
      outgoingStatus,
    });

    // Delete merchantKey entries related to current gateway and save new
    await this.merchantKeyRepository.delete({ gateway });
    for (const key of merchantKeys) {
      await this.merchantKeyRepository.save({
        label: key.label,
        value: key.value,
        type: key.type,
        gateway,
      });
    }

    // Delete gatewayToChannel entries related to current gateway and save new
    await this.gatewayToChannelRepository.delete({ gateway });
    for (const channelData of channels) {
      const {
        id,
        payinsEnabled,
        payoutsEnabled,
        payinFees,
        payoutFees,
        lowerLimitForPayins,
        upperLimitForPayins,
        lowerLimitForPayouts,
        upperLimitForPayouts,
      } = channelData;

      const channel = await this.channelRepository.findOne({
        where: { id },
      });

      if (!channel)
        throw new NotFoundException(`Channel with ID ${id} not found`);

      await this.gatewayToChannelRepository.save({
        gateway,
        channel,
        payinsEnabled,
        payoutsEnabled,
        payinFees,
        payoutFees,
        lowerLimitForPayins,
        upperLimitForPayins,
        lowerLimitForPayouts,
        upperLimitForPayouts,
      });
    }

    return HttpStatus.OK;
  }

  async remove(id: number) {
    const gateway = await this.gatewayRepository.findOne({
      where: {
        id,
      },
      relations: ['gatewayToChannel', 'merchantKey'],
    });

    if (!gateway) throw new NotFoundException();

    await this.merchantKeyRepository.delete({ gateway });
    await this.gatewayToChannelRepository.delete({ gateway });
    await this.gatewayRepository.remove(gateway);

    return HttpStatus.OK;
  }

  async paginate(paginateDto: PaginateRequestDto) {
    const { search, pageSize, pageNumber, startDate, endDate } = paginateDto;

    const whereClause: any = {};

    if (search) whereClause.name = ILike(`%${search}%`);

    if (startDate && endDate) {
      whereClause.createdAt = Between(
        parseStartDate(startDate),
        parseEndDate(endDate),
      );
    }

    const skip = (pageNumber - 1) * pageSize;

    const [rows, total] = await this.gatewayRepository.findAndCount({
      where: whereClause,
      relations: [
        'merchantKey',
        'gatewayToChannel',
        'gatewayToChannel.channel',
      ],
      skip,
      take: pageSize,
    });

    const dtos = plainToInstance(GatewayResponseDto, rows);

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    return {
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      startRecord,
      endRecord,
      data: dtos,
    };
  }

  async exportRecords(startDate: string, endDate: string) {
    startDate = parseStartDate(startDate);
    endDate = parseEndDate(endDate);

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    const [rows, total] = await this.gatewayRepository.findAndCount({
      relations: [
        'gatewayToChannel',
        'merchantKey',
        'gatewayToChannel.channel',
      ],
      where: {
        createdAt: Between(parsedStartDate, parsedEndDate),
      },
    });

    const dtos = plainToInstance(GatewayResponseDto, rows);

    return {
      total,
      data: dtos,
    };
  }
}
