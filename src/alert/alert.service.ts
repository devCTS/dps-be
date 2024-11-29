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

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Admin)
    private merchantRepository: Repository<Merchant>,
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,

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
    else if (userType === Users.ADMIN)
      user = await this.adminRepository.findOneBy({ id: userId });

    if (!user) throw new NotFoundException(`${userType} not found.`);

    const createdAlert = await this.alertRepository.save(alertCreateDto);

    this.socketGateway.handleSendAlert({
      for: userId,
      userType,
      type: alertCreateDto.type,
      data: alertCreateDto.data,
      id: createdAlert.id,
    });

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
}
