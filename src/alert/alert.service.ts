import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { AlertCreateDto } from './dto/alert-create.dto';
import { AlertReadStatus, Users } from 'src/utils/enum/enum';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { Agent } from 'src/agent/entities/agent.entity';
import { Member } from 'src/member/entities/member.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { Alert } from './entities/alert.entity';
import { SocketGateway } from 'src/socket/socket.gateway';

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
  ) {}

  async create(alertCreateDto: AlertCreateDto) {
    const { for: userId, userType } = alertCreateDto;

    let user;

    if (userType === Users.MEMBER) {
      user = await this.memberRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Member not found.');
      }
    } else if (userType === Users.ADMIN) {
      user = await this.adminRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Admin not found.');
      }
    } else if (userType === Users.MERCHANT) {
      user = await this.merchantRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Merchant not found.');
      }
    } else if (userType === Users.AGENT) {
      user = await this.agentRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Agent not found.');
      }
    }

    await this.alertRepository.save(alertCreateDto);

    this.socketGateway.handleSendAlert({
      for: userId,
      userType,
      text: 'abc',
      type: 'Alert',
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

    if (!myAlerts || myAlerts.length === 0) {
      throw new NotFoundException('No ALerts found');
    }

    return myAlerts;
  }

  async markAlertRead(id: number) {
    const alertDetails = await this.alertRepository.findOneBy({ id });

    if (!alertDetails) throw new NotFoundException('Alert details not found.');

    this.alertRepository.update(id, { status: AlertReadStatus.READ });

    return HttpStatus.OK;
  }
}
