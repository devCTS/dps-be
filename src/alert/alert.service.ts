import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AlertCreateDto } from './dto/alert-create.dto';
import {
  AlertReadStatus,
  AlertType,
  OrderType,
  Users,
} from 'src/utils/enum/enum';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { Agent } from 'src/agent/entities/agent.entity';
import { Member } from 'src/member/entities/member.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { Alert } from './entities/alert.entity';
import { SocketGateway } from 'src/socket/socket.gateway';
import { getTextForAlert } from 'src/utils/utils';
import { WithdrawalService } from 'src/withdrawal/withdrawal.service';
import { PayoutService } from 'src/payout/payout.service';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { EndUser } from 'src/end-user/entities/end-user.entity';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(EndUser)
    private endUserRepository: Repository<EndUser>,

    private socketGateway: SocketGateway,
    private withdrawalService: WithdrawalService,
    @Inject(forwardRef(() => PayoutService))
    private payoutService: PayoutService,
  ) {}

  async create(alertCreateDto: AlertCreateDto) {
    const { for: userId, userType } = alertCreateDto;

    let user;

    if (userType === Users.MEMBER)
      user = await this.memberRepository.findOneBy({ id: userId });
    else if (userType === Users.MERCHANT)
      user = await this.merchantRepository.findOneBy({ id: userId });
    else if (userType === Users.AGENT)
      user = await this.agentRepository.findOneBy({ id: userId });

    if (!user && userId) throw new NotFoundException(`${userType} not found.`);

    const createdAlert = await this.alertRepository.save(alertCreateDto);

    if (AlertType.USER_PAYIN_LIMIT === alertCreateDto.type) {
      this.socketGateway.handleSendAlertsToAllAdmins({
        data: alertCreateDto.data,
        type: alertCreateDto.type,
        id: createdAlert.id,
      });
    } else {
      this.socketGateway.handleSendAlert({
        for: userId,
        userType,
        type: alertCreateDto.type,
        data: alertCreateDto.data,
        id: createdAlert.id,
      });
    }

    return HttpStatus.CREATED;
  }

  async getMyAlerts({ id, userType }: { id: number; userType: Users }) {
    const myAlerts = await this.alertRepository.find({
      where: {
        for: id,
        userType,
        status: AlertReadStatus.UNREAD,
      },
    });

    if (!myAlerts || myAlerts.length === 0) return [];

    return myAlerts.map((item) => ({
      id: item.id,
      type: item.type,
      text: getTextForAlert(item.type, item.data),
      date: item.createdAt,
      userType: item.userType,
      data: item.data,
    }));
  }

  async markAlertRead(id: number) {
    const alertDetails = await this.alertRepository.findOneBy({ id });

    if (!alertDetails) throw new NotFoundException('Alert details not found.');

    await this.alertRepository.update(alertDetails.id, {
      status: AlertReadStatus.READ,
    });

    const orderId = alertDetails.data?.orderId;
    const orderType = alertDetails.type;

    if (
      orderType === AlertType.PAYOUT_FAILED ||
      orderType === AlertType.PAYOUT_SUCCESS
    ) {
      await this.payoutService.handleNotificationStatusSuccess(orderId);
    } else {
      await this.withdrawalService.handleNotificationStatusSuccess(orderId);
    }

    return HttpStatus.OK;
  }

  async paginate(paginateDto: PaginateRequestDto) {
    const query = this.alertRepository
      .createQueryBuilder('alert')
      .andWhere('alert.userType = :userType', { userType: Users.ADMIN });

    if (paginateDto.startDate && paginateDto.endDate) {
      const startDate = parseStartDate(paginateDto.startDate);
      const endDate = parseEndDate(paginateDto.endDate);

      query.andWhere('alert.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 9);

      query.andWhere('alert.created_at BETWEEN :startDate AND :endDate', {
        startDate: startDate,
        endDate: today,
      });
    }

    query.orderBy('alert.created_at', 'DESC');

    const rows = await query.getMany();

    const dtos = await Promise.all(
      rows.map(async (row) => {
        return {
          id: row?.data?.id,
          userId: row?.data?.userId,
          userName: row?.data?.name,
          userEmail: row?.data?.email,
          userMobile: row?.data?.mobile,
          payinAmount: row?.data?.totalPayinAmount,
          payoutAmount: row?.data?.totalPayoutAmount,
          merchant: row?.data?.merchant,
          date: row?.data?.createdAt,
          payinAmountUsingGateways: row?.data?.payinAmountUsingGateways,
          currentPayinOrderAmount: row?.data?.currentPayinOrderAmount,
        };
      }),
    );

    const groupedByDate = dtos.reduce((acc, dto) => {
      const dateKey = dto?.date?.split('T')[0];

      if (!acc[dateKey]) acc[dateKey] = [];

      acc[dateKey].push(dto);

      return acc;
    }, {});

    return {
      data: groupedByDate,
    };
  }
}
