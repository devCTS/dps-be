import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { AdminResponseDto } from './dto/admin-response.dto';
import { IdentityService } from 'src/identity/identity.service';
import {
  ExportDto,
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { getSuperAdminData } from './data/admin.data';
import { jsonToExcel } from 'src/utils/utils';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private readonly identityService: IdentityService,
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<any> {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
      enabled,
      permissionAdjustBalance,
      permissionAdmins,
      permissionHandleWithdrawals,
      permissionUsers,
      permissionVerifyOrders,
    } = createAdminDto;

    const identity = await this.identityService.create(email, password, role);

    // Create and save the Admin
    const admin = this.adminRepository.create({
      identity,
      firstName,
      lastName,
      phone,
      role,
      enabled,
      permissionAdjustBalance,
      permissionAdmins,
      permissionHandleWithdrawals,
      permissionUsers,
      permissionVerifyOrders,
    });

    const created = await this.adminRepository.save(admin);

    return plainToInstance(AdminResponseDto, created);
  }

  async findAll(): Promise<AdminResponseDto[]> {
    const results = await this.adminRepository.find({
      relations: ['identity'],
    });

    return plainToInstance(AdminResponseDto, results);
  }

  async findOne(id: number): Promise<AdminResponseDto> {
    const results = await this.adminRepository.findOne({
      where: { id: id },
      relations: ['identity'],
    });

    return plainToInstance(AdminResponseDto, results);
  }

  async update(
    id: number,
    updateAdminDto: UpdateAdminDto,
  ): Promise<HttpStatus> {
    const result = await this.adminRepository.update(
      { id: id },
      updateAdminDto,
    );
    return HttpStatus.OK;
  }

  async remove(id: number) {
    const admin = await this.adminRepository.findOne({
      where: { id: id },
      relations: ['identity'], // Ensure you load the identity relation
    });

    if (!admin) throw new NotFoundException();

    this.adminRepository.delete(id);
    this.identityService.remove(admin.identity?.id);

    return HttpStatus.OK;
  }

  async paginate(paginateDto: PaginateRequestDto) {
    const query = this.adminRepository.createQueryBuilder('admin');

    const search = paginateDto.search;
    const pageSize = paginateDto.pageSize;
    const pageNumber = paginateDto.pageNumber;
    // Handle search by first_name + " " + last_name
    if (search) {
      query.andWhere(
        `CONCAT(admin.first_name, ' ', admin.last_name) ILIKE :search`,
        { search: `%${search}%` },
      );
    }

    // Handle filtering by created_at between startDate and endDate
    if (paginateDto.startDate && paginateDto.endDate) {
      const startDate = parseStartDate(paginateDto.startDate);
      const endDate = parseEndDate(paginateDto.endDate);

      query.andWhere('admin.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Handle pagination
    const skip = (pageNumber - 1) * pageSize;
    if (!paginateDto.all) {
      query.skip(skip).take(pageSize);
    }

    // Execute query
    const [admins, total] = await query.getManyAndCount();

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    // Return paginated result
    return {
      data: admins,
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      startRecord,
      endRecord,
    };
  }

  async loadSuperAdmin() {
    await this.create(getSuperAdminData());
  }

  async exportExcelData(exportDto: ExportDto) {
    const query = this.adminRepository.createQueryBuilder('admin');
    const startDate = parseStartDate(exportDto.startDate);
    const endDate = parseEndDate(exportDto.endDate);

    query.andWhere('admin.created_at BETWEEN :startDate AND :endDate', {
      startDate,
      endDate,
    });

    const [data, total] = await query.getManyAndCount();

    return data;
  }
}
