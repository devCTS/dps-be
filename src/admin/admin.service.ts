import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Repository, Between } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { AdminResponseDto } from './dto/admin-response.dto';
import { IdentityService } from 'src/identity/identity.service';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { getSuperAdminData } from './data/admin.data';
import { encryptPassword } from 'src/utils/utils';
import { JwtService } from 'src/services/jwt/jwt.service';
import { ChangePasswordDto } from 'src/identity/dto/changePassword.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private readonly identityService: IdentityService,
    private readonly jwtService: JwtService,
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
      permissionSystemConfig,
      permissionChannelsAndGateways,
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
      permissionSystemConfig,
      permissionChannelsAndGateways,
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
    const email = updateAdminDto.email;
    const password = updateAdminDto.password;
    const updateLoginCredentials = updateAdminDto.updateLoginCredentials;

    delete updateAdminDto.email;
    delete updateAdminDto.password;
    delete updateAdminDto.updateLoginCredentials;

    const result = await this.adminRepository.update(
      { id: id },
      updateAdminDto,
    );

    if (updateLoginCredentials) {
      const hashedPassword = this.jwtService.getHashPassword(password);
      const updatedAdmin = await this.adminRepository.findOne({
        where: { id },
        relations: ['identity'], // Explicitly specify the relations
      });

      await this.identityService.updateLogin(
        updatedAdmin.identity.id,
        email,
        hashedPassword,
      );
    }

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
    // query.orderBy('admin.created_at', 'DESC');
    // Add relation to the identity entity
    query.leftJoinAndSelect('admin.identity', 'identity'); // Join with identity
    // .leftJoinAndSelect('identity.profile', 'profile'); // Join with profile through identity
    // Sort records by created_at from latest to oldest

    const search = paginateDto.search;
    const pageSize = paginateDto.pageSize;
    const pageNumber = paginateDto.pageNumber;
    const sortBy = paginateDto.sortBy;

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

    if (paginateDto.userId) {
      query.andWhere('admin.id != :userId', { userId: paginateDto.userId });
    }

    if (sortBy)
      sortBy === 'latest'
        ? query.orderBy('admin.createdAt', 'DESC')
        : query.orderBy('admin.createdAt', 'ASC');

    // Handle pagination
    const skip = (pageNumber - 1) * pageSize;
    query.skip(skip).take(pageSize);

    // Execute query
    const [rows, total] = await query.getManyAndCount();
    const dtos = plainToInstance(AdminResponseDto, rows);

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

  async loadSuperAdmin() {
    await this.create(getSuperAdminData());
  }

  async exportRecords(startDate: string, endDate: string) {
    startDate = parseStartDate(startDate);
    endDate = parseEndDate(endDate);

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    const [rows, total] = await this.adminRepository.findAndCount({
      relations: ['identity'],
      where: {
        createdAt: Between(parsedStartDate, parsedEndDate),
      },
    });

    const dtos = plainToInstance(AdminResponseDto, rows);

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
    const adminData = await this.adminRepository.findOne({
      where: { id },
      relations: ['identity'],
    });

    if (!adminData) throw new NotFoundException();

    return this.identityService.changePassword(
      changePasswordDto,
      adminData.identity.id,
    );
  }
}
