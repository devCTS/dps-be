import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
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
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { encryptPassword } from 'src/utils/utils';
import { JwtService } from 'src/services/jwt/jwt.service';
import { ChangePasswordDto } from 'src/identity/dto/changePassword.dto';

@Injectable()
export class SubMerchantService {
  constructor(
    @InjectRepository(Submerchant)
    private subMerchantRepository: Repository<Submerchant>,
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    private readonly identityService: IdentityService,
    private readonly jwtService: JwtService,
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
      relations: ['identity'],
    });

    return plainToInstance(SubMerchantResponseDto, results);
  }

  async findOne(id: number): Promise<SubMerchantResponseDto> {
    let result = await this.subMerchantRepository.findOne({
      where: { id },
      relations: ['identity', 'merchant'],
    });
    const businessName = result.merchant.businessName;
    const merchantName = `${result.merchant.firstName} ${result.merchant.lastName}`;

    const resultDto = {
      ...result,
      businessName,
      merchantName,
    };

    return plainToInstance(SubMerchantResponseDto, resultDto);
  }

  async update(
    id: number,
    updateSubMerchantDto: UpdateSubMerchantDto,
  ): Promise<HttpStatus> {
    const email = updateSubMerchantDto.email;
    const password = updateSubMerchantDto.password;
    const updateLoginCredentials = updateSubMerchantDto.updateLoginCredentials;

    delete updateSubMerchantDto.email;
    delete updateSubMerchantDto.password;
    delete updateSubMerchantDto.updateLoginCredentials;

    const result = await this.subMerchantRepository.update(
      { id: id },
      updateSubMerchantDto,
    );

    if (updateLoginCredentials) {
      const updatedAdmin = await this.subMerchantRepository.findOne({
        where: { id },
        relations: ['identity'], // Explicitly specify the relations
      });

      await this.identityService.updateLogin(
        updatedAdmin.identity.id,
        email,
        password,
      );
    }

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

  async paginate(merchantId, paginateDto: PaginateRequestDto) {
    const query = this.subMerchantRepository.createQueryBuilder('submerchant');
    // query.orderBy('admin.created_at', 'DESC');
    // Add relation to the identity entity
    query.leftJoinAndSelect('submerchant.identity', 'identity'); // Join with identity
    // .leftJoinAndSelect('identity.profile', 'profile'); // Join with profile through identity
    // Sort records by created_at from latest to oldest

    const search = paginateDto.search;
    const pageSize = paginateDto.pageSize;
    const pageNumber = paginateDto.pageNumber;
    const sortBy = paginateDto.sortBy;

    // Handle search by first_name + " " + last_name
    if (search) {
      query.andWhere(
        `CONCAT(submerchant.first_name, ' ', submerchant.last_name) ILIKE :search`,
        { search: `%${search}%` },
      );
    }

    query.andWhere(`submerchant.merchant_id = ${merchantId}`);

    // Handle filtering by created_at between startDate and endDate
    if (paginateDto.startDate && paginateDto.endDate) {
      const startDate = parseStartDate(paginateDto.startDate);
      const endDate = parseEndDate(paginateDto.endDate);

      query.andWhere('submerchant.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (sortBy)
      sortBy === 'latest'
        ? query.orderBy('submerchant.createdAt', 'DESC')
        : query.orderBy('submerchant.createdAt', 'ASC');

    // Handle pagination
    const skip = (pageNumber - 1) * pageSize;
    query.skip(skip).take(pageSize);

    // Execute query
    const [rows, total] = await query.getManyAndCount();
    const dtos = plainToInstance(SubMerchantResponseDto, rows);

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    // Return paginated result
    return {
      data: dtos,
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      startRecord,
      endRecord,
    };
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

  async getProfile(id: number) {
    const profile = await this.findOne(id);
    if (!profile.enabled) {
      throw new UnauthorizedException('Unauthorized.');
    }

    return profile;
  }

  async changePassword(changePasswordDto: ChangePasswordDto, id: number) {
    const subMerchantData = await this.subMerchantRepository.findOne({
      where: { id },
      relations: ['identity'],
    });

    if (!subMerchantData) throw new NotFoundException();

    return this.identityService.changePassword(
      changePasswordDto,
      subMerchantData.identity.id,
    );
  }
}
