import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubMerchantDto } from './dto/create-sub-merchant.dto';
import { UpdateSubMerchantDto } from './dto/update-sub-merchant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Submerchant } from './entities/sub-merchant.entity';
import { Repository, Between } from 'typeorm';
import { IdentityService } from 'src/identity/identity.service';
import { plainToInstance } from 'class-transformer';
import { SubMerchantResponseDto } from './dto/sub-merchant-response.dto';
import { MerchantService } from 'src/merchant/merchant.service';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { parseStartDate, parseEndDate } from 'src/utils/dtos/paginate.dto';

@Injectable()
export class SubMerchantService {
  constructor(
    @InjectRepository(Submerchant)
    private subMerchantRepository: Repository<Submerchant>,
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    private readonly identityService: IdentityService,
  ) {}

  async create(
    merchantId: number,
    createSubMerchantDto: CreateSubMerchantDto,
  ): Promise<any> {
    const { email, password } = createSubMerchantDto;

    const identity = await this.identityService.create(
      email,
      password,
      'SUB_MERCHANT',
    );

    const merchant = await this.merchantRepository.findOne({
      where: { id: merchantId },
    });

    const subMerchant = this.subMerchantRepository.create({
      identity,
      merchant,
      ...createSubMerchantDto,
    });

    const createSubMerchant =
      await this.subMerchantRepository.save(subMerchant);

    return plainToInstance(SubMerchantResponseDto, createSubMerchant);
  }

  async findAll(): Promise<SubMerchantResponseDto[]> {
    const results = await this.subMerchantRepository.find({
      relations: ['identity', 'merchant'],
    });

    return plainToInstance(SubMerchantResponseDto, results);
  }

  async findOne(id: number): Promise<SubMerchantResponseDto> {
    const result = await this.subMerchantRepository.findOne({
      where: { id },
      relations: ['identity', 'merchant'],
    });

    if (!result) throw new NotFoundException();

    return plainToInstance(SubMerchantResponseDto, result);
  }

  async update(
    id: number,
    updateSubMerchantDto: UpdateSubMerchantDto,
  ): Promise<HttpStatus> {
    const subMerchant = await this.subMerchantRepository.findOne({
      where: { id },
      relations: ['identity', 'merchant'],
    });

    if (!subMerchant) throw new NotFoundException();

    const updateSubMerchant = await this.subMerchantRepository.update(
      id,
      updateSubMerchantDto,
    );

    if (!updateSubMerchant) throw new InternalServerErrorException();

    return HttpStatus.OK;
  }

  async remove(id: number): Promise<HttpStatus> {
    const subMerchant = await this.subMerchantRepository.findOne({
      where: { id },
      relations: ['identity', 'merchant'],
    });

    if (!subMerchant) throw new NotFoundException();

    const deleteSubMerchant =
      await this.subMerchantRepository.remove(subMerchant);

    await this.identityService.remove(subMerchant.identity?.id);

    if (!deleteSubMerchant) throw new InternalServerErrorException();

    return HttpStatus.OK;
  }

  async exportRecords(startDate: string, endDate: string) {
    startDate = parseStartDate(startDate);
    endDate = parseEndDate(endDate);

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    const [rows, total] = await this.subMerchantRepository.findAndCount({
      relations: ['identity', 'merchant'],
      where: {
        createdAt: Between(parsedStartDate, parsedEndDate),
      },
    });

    const dtos = plainToInstance(SubMerchantResponseDto, rows);

    return {
      data: dtos,
      total,
    };
  }
}
