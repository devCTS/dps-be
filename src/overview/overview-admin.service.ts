import {
  UserTypeForTransactionUpdates,
  WithdrawalMadeOn,
} from './../utils/enum/enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { Agent } from 'src/agent/entities/agent.entity';
import { Member } from 'src/member/entities/member.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { Payin } from 'src/payin/entities/payin.entity';
import { Payout } from 'src/payout/entities/payout.entity';
import { Topup } from 'src/topup/entities/topup.entity';
import {
  ChannelName,
  GatewayName,
  OrderStatus,
  OrderType,
  PaymentMadeOn,
  WithdrawalOrderStatus,
} from 'src/utils/enum/enum';
import { Withdrawal } from 'src/withdrawal/entities/withdrawal.entity';
import { Between, IsNull, Not, Repository } from 'typeorm';
import { parseEndDate, parseStartDate } from 'src/utils/dtos/paginate.dto';
import { FiltersDto } from './dtos/filters-dto';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { monthNames, roundOffAmount } from 'src/utils/utils';
import * as moment from 'moment';

@Injectable()
export class OverviewAdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,

    @InjectRepository(Payin)
    private readonly payinRepository: Repository<Payin>,
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(Topup)
    private readonly topupRepository: Repository<Topup>,

    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,

    private readonly systemConfigService: SystemConfigService,
  ) {}

  async getGatewayCount(
    order: OrderType,
    gatewayName = null,
    startDate = '01/01/2024',
    endDate = '31/12/2024',
  ) {
    startDate = parseStartDate(startDate);
    endDate = parseEndDate(endDate);

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (order === OrderType.PAYIN)
      if (gatewayName) {
        return await this.payinRepository.count({
          where: {
            gatewayName,
            createdAt: Between(parsedStartDate, parsedEndDate),
          },
        });
      } else {
        return await this.payinRepository.count({
          where: {
            member: { id: Not(IsNull()) },
            createdAt: Between(parsedStartDate, parsedEndDate),
          },
          relations: ['member'],
        });
      }

    if (order === OrderType.PAYOUT)
      if (gatewayName) {
        return await this.payoutRepository.count({
          where: {
            gatewayName,
            createdAt: Between(parsedStartDate, parsedEndDate),
          },
        });
      } else {
        return await this.payoutRepository.count({
          where: {
            member: { id: Not(IsNull()) },
            createdAt: Between(parsedStartDate, parsedEndDate),
          },
          relations: ['member'],
        });
      }
  }

  async getMemberChannelNameCount(
    order: OrderType,
    channelName: ChannelName,
    startDate = '01/01/2024',
    endDate = '31/12/2024',
  ) {
    startDate = parseStartDate(startDate);
    endDate = parseEndDate(endDate);

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (order === OrderType.PAYIN)
      return await this.payinRepository.count({
        where: {
          member: { id: Not(IsNull()) },
          channel: channelName,
          createdAt: Between(parsedStartDate, parsedEndDate),
        },
        relations: ['member'],
      });

    if (order === OrderType.PAYOUT)
      return await this.payoutRepository.count({
        where: {
          member: { id: Not(IsNull()) },
          channel: channelName,
          createdAt: Between(parsedStartDate, parsedEndDate),
        },
        relations: ['member'],
      });
  }

  async getGatewayChannelNameCount(
    order: OrderType,
    gatewayName,
    channelName,
    startDate = '01/01/2024',
    endDate = '31/12/2024',
  ) {
    startDate = parseStartDate(startDate);
    endDate = parseEndDate(endDate);

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (order === OrderType.PAYIN)
      return await this.payinRepository.count({
        where: {
          gatewayName,
          channel: channelName,
          createdAt: Between(parsedStartDate, parsedEndDate),
        },
      });

    if (order === OrderType.PAYOUT)
      return await this.payoutRepository.count({
        where: {
          gatewayName,
          channel: channelName,
          createdAt: Between(parsedStartDate, parsedEndDate),
        },
      });
  }

  async getUserAnalytics() {
    const adminCount = await this.adminRepository.count();
    const merchantCount = await this.merchantRepository.count();
    const memberCount = await this.memberRepository.count();
    const agentCount = await this.agentRepository.count();

    const memberAgentsCount = await this.memberRepository.count({
      where: {
        referredMember: {
          id: Not(IsNull()),
        },
      },
      relations: ['referredMember'],
    });

    const selfRegisteredMembersCount = await this.memberRepository.count({
      where: {
        selfRegistered: true,
      },
    });

    const latestSelfRegisteredMembers = await this.memberRepository.find({
      where: {
        selfRegistered: true,
      },
      order: {
        createdAt: 'DESC',
      },
      take: 10,
      relations: ['identity'],
    });

    return {
      userInfo: {
        admins: adminCount,
        merchants: merchantCount,
        agents: agentCount + memberAgentsCount,
        members: memberCount,
      },
      memberData: {
        self: selfRegisteredMembersCount,
        admin: Math.abs(memberCount - selfRegisteredMembersCount),
      },
      members: latestSelfRegisteredMembers.map((row) => {
        return {
          name: row.firstName + ' ' + row.lastName,
          gmail: row.identity.email,
          onboardingDate: row.createdAt,
        };
      }),
    };
  }

  async getAllGatewayAnalytics(body: FiltersDto) {
    const { startDate, endDate, mode } = body;

    //PAYINS
    const payinsPhonePeCount = await this.getGatewayCount(
      OrderType.PAYIN,
      GatewayName.PHONEPE,
      startDate,
      endDate,
    );
    const payinsRazorPayCount = await this.getGatewayCount(
      OrderType.PAYIN,
      GatewayName.RAZORPAY,
      startDate,
      endDate,
    );
    const payinsMemberChannelCount = await this.getGatewayCount(
      OrderType.PAYIN,
      null,
      startDate,
      endDate,
    );

    const payinsMemberChannelUpiCount = await this.getMemberChannelNameCount(
      OrderType.PAYIN,
      ChannelName.UPI,
      startDate,
      endDate,
    );
    const payinsMemberChannelNetBankingCount =
      await this.getMemberChannelNameCount(
        OrderType.PAYIN,
        ChannelName.BANKING,
        startDate,
        endDate,
      );
    const payinsMemberChannelEWalletCount =
      await this.getMemberChannelNameCount(
        OrderType.PAYIN,
        ChannelName.E_WALLET,
        startDate,
        endDate,
      );

    const payinsRazorpayUpiCount = await this.getGatewayChannelNameCount(
      OrderType.PAYIN,
      GatewayName.RAZORPAY,
      ChannelName.UPI,
      startDate,
      endDate,
    );
    const payinsRazorpayNetBankingCount = await this.getGatewayChannelNameCount(
      OrderType.PAYIN,
      GatewayName.RAZORPAY,
      ChannelName.BANKING,
      startDate,
      endDate,
    );
    const payinsRazorpayEWalletCount = await this.getGatewayChannelNameCount(
      OrderType.PAYIN,
      GatewayName.RAZORPAY,
      ChannelName.E_WALLET,
      startDate,
      endDate,
    );

    const payinsPhonePeUpiCount = await this.getGatewayChannelNameCount(
      OrderType.PAYIN,
      GatewayName.PHONEPE,
      ChannelName.UPI,
      startDate,
      endDate,
    );
    const payinsPhonePeNetBankingCount = await this.getGatewayChannelNameCount(
      OrderType.PAYIN,
      GatewayName.PHONEPE,
      ChannelName.BANKING,
      startDate,
      endDate,
    );
    const payinsPhonePeEWalletCount = await this.getGatewayChannelNameCount(
      OrderType.PAYIN,
      GatewayName.PHONEPE,
      ChannelName.E_WALLET,
      startDate,
      endDate,
    );

    //PAYOUTS
    const payoutsPhonePeCount = await this.getGatewayCount(
      OrderType.PAYOUT,
      GatewayName.PHONEPE,
      startDate,
      endDate,
    );
    const payoutsRazorPayCount = await this.getGatewayCount(
      OrderType.PAYOUT,
      GatewayName.RAZORPAY,
      startDate,
      endDate,
    );
    const payoutsMemberChannelCount = await this.getGatewayCount(
      OrderType.PAYOUT,
      null,
      startDate,
      endDate,
    );

    const payoutsMemberChannelUpiCount = await this.getMemberChannelNameCount(
      OrderType.PAYOUT,
      ChannelName.UPI,
      startDate,
      endDate,
    );
    const payoutsMemberChannelNetBankingCount =
      await this.getMemberChannelNameCount(
        OrderType.PAYOUT,
        ChannelName.BANKING,
        startDate,
        endDate,
      );
    const payoutsMemberChannelEWalletCount =
      await this.getMemberChannelNameCount(
        OrderType.PAYOUT,
        ChannelName.E_WALLET,
        startDate,
        endDate,
      );

    const payoutsRazorpayUpiCount = await this.getGatewayChannelNameCount(
      OrderType.PAYOUT,
      GatewayName.RAZORPAY,
      ChannelName.UPI,
      startDate,
      endDate,
    );
    const payoutsRazorpayNetBankingCount =
      await this.getGatewayChannelNameCount(
        OrderType.PAYOUT,
        GatewayName.RAZORPAY,
        ChannelName.BANKING,
        startDate,
        endDate,
      );
    const payoutsRazorpayEWalletCount = await this.getGatewayChannelNameCount(
      OrderType.PAYOUT,
      GatewayName.RAZORPAY,
      ChannelName.E_WALLET,
      startDate,
      endDate,
    );

    const payoutsPhonePeUpiCount = await this.getGatewayChannelNameCount(
      OrderType.PAYOUT,
      GatewayName.PHONEPE,
      ChannelName.UPI,
      startDate,
      endDate,
    );
    const payoutsPhonePeNetBankingCount = await this.getGatewayChannelNameCount(
      OrderType.PAYOUT,
      GatewayName.PHONEPE,
      ChannelName.BANKING,
      startDate,
      endDate,
    );
    const payoutsPhonePeEWalletCount = await this.getGatewayChannelNameCount(
      OrderType.PAYOUT,
      GatewayName.PHONEPE,
      ChannelName.E_WALLET,
      startDate,
      endDate,
    );

    return {
      payins:
        mode === 'PAYINS' || !mode
          ? {
              orders: {
                memberChannel: payinsMemberChannelCount,
                phonepe: payinsPhonePeCount,
                razorpay: payinsRazorPayCount,
              },
              distribution: {
                memberChannel: {
                  upi: payinsMemberChannelUpiCount,
                  netBanking: payinsMemberChannelNetBankingCount,
                  eWallet: payinsMemberChannelEWalletCount,
                },
                razorpay: {
                  upi: payinsRazorpayUpiCount,
                  netBanking: payinsRazorpayNetBankingCount,
                  eWallet: payinsRazorpayEWalletCount,
                },
                phonepe: {
                  upi: payinsPhonePeUpiCount,
                  netBanking: payinsPhonePeNetBankingCount,
                  eWallet: payinsPhonePeEWalletCount,
                },
              },
            }
          : null,
      payouts:
        mode === 'PAYOUTS' || !mode
          ? {
              orders: {
                memberChannel: payoutsMemberChannelCount,
                phonepe: payoutsPhonePeCount,
                razorpay: payoutsRazorPayCount,
              },
              distribution: {
                memberChannel: {
                  upi: payoutsMemberChannelUpiCount,
                  netBanking: payoutsMemberChannelNetBankingCount,
                  eWallet: payoutsMemberChannelEWalletCount,
                },
                razorpay: {
                  upi: payoutsRazorpayUpiCount,
                  netBanking: payoutsRazorpayNetBankingCount,
                  eWallet: payoutsRazorpayEWalletCount,
                },
                phonepe: {
                  upi: payoutsPhonePeUpiCount,
                  netBanking: payoutsPhonePeNetBankingCount,
                  eWallet: payoutsPhonePeEWalletCount,
                },
              },
            }
          : null,
    };
  }

  async getGatewayMemberChannelAnalytics(body: FiltersDto) {
    const { startDate, endDate, mode } = body;

    const parsedStartDate = new Date(parseStartDate(startDate));
    const parsedEndDate = new Date(parseEndDate(endDate));

    const [payinRows, payinsCount] = await this.payinRepository.findAndCount({
      where: {
        payinMadeOn: PaymentMadeOn.MEMBER,
        createdAt: Between(parsedStartDate, parsedEndDate),
      },
    });

    const [payoutRows, payoutsCount] = await this.payoutRepository.findAndCount(
      {
        where: {
          payoutMadeVia: PaymentMadeOn.MEMBER,
          createdAt: Between(parsedStartDate, parsedEndDate),
        },
      },
    );

    const [withdrawalRows, withdrawalsCount] =
      await this.withdrawalRepository.findAndCount({
        where: {
          withdrawalMadeOn: WithdrawalMadeOn.ADMIN,
          createdAt: Between(parsedStartDate, parsedEndDate),
        },
      });

    const payins = payinRows.reduce(
      (prev, curr) => {
        if (curr.status === OrderStatus.COMPLETE) {
          prev.completedAmount += curr.amount;
          prev.completed++;
        }
        if (curr.status === OrderStatus.FAILED) {
          prev.failedAmount += curr.amount;
          prev.failed++;
        }
        if (curr.status === OrderStatus.ASSIGNED) {
          prev.pendingAmount += curr.amount;
          prev.assigned++;
        }

        if (curr.status === OrderStatus.SUBMITTED) {
          prev.pendingAmount += curr.amount;
          prev.submitted++;
        }

        return prev;
      },
      {
        completedAmount: 0,
        failedAmount: 0,
        pendingAmount: 0,
        assigned: 0,
        submitted: 0,
        completed: 0,
        failed: 0,
      },
    );

    const payouts = payoutRows.reduce(
      (prev, curr) => {
        if (curr.status === OrderStatus.COMPLETE) {
          prev.completedAmount += curr.amount;
          prev.completed++;
        }
        if (curr.status === OrderStatus.FAILED) {
          prev.failedAmount += curr.amount;
          prev.failed++;
        }
        if (curr.status === OrderStatus.ASSIGNED) {
          prev.pendingAmount += curr.amount;
          prev.assigned++;
        }

        if (curr.status === OrderStatus.SUBMITTED) {
          prev.pendingAmount += curr.amount;
          prev.submitted++;
        }

        return prev;
      },
      {
        completedAmount: 0,
        failedAmount: 0,
        pendingAmount: 0,
        assigned: 0,
        submitted: 0,
        completed: 0,
        failed: 0,
      },
    );

    const withdrawals = withdrawalRows.reduce(
      (prev, curr) => {
        if (curr.status === WithdrawalOrderStatus.COMPLETE) {
          prev.completedAmount += curr.amount;
          prev.completed++;
        }
        if (curr.status === WithdrawalOrderStatus.FAILED) {
          prev.failedAmount += curr.amount;
          prev.failed++;
        }
        if (curr.status === WithdrawalOrderStatus.PENDING) {
          prev.pendingAmount += curr.amount;
          prev.pending++;
        }

        return prev;
      },
      {
        completedAmount: 0,
        failedAmount: 0,
        pendingAmount: 0,
        pending: 0,
        completed: 0,
        failed: 0,
      },
    );

    return {
      payins:
        mode === 'PAYINS' || !mode
          ? {
              orders: {
                total: payinsCount,
                totalCompleted: payins.completedAmount,
                totalFailed: payins.failedAmount,
                totalPending: payins.pendingAmount,
              },
              distribution: {
                assigned: payins.assigned,
                submitted: payins.submitted,
                completed: payins.completed,
                failed: payins.failed,
              },
            }
          : null,
      payouts:
        mode === 'PAYOUTS' || !mode
          ? {
              orders: {
                total: payoutsCount,
                totalCompleted: payouts.completedAmount,
                totalFailed: payouts.failedAmount,
                totalPending: payouts.pendingAmount,
              },
              distribution: {
                assigned: payouts.assigned,
                submitted: payouts.submitted,
                completed: payouts.completed,
                failed: payouts.failed,
              },
            }
          : null,
      withdrawals:
        mode === 'WITHDRAWALS' || !mode
          ? {
              orders: {
                total: withdrawalsCount,
                totalCompleted: withdrawals.completedAmount,
                totalFailed: withdrawals.failedAmount,
                totalPending: withdrawals.pendingAmount,
              },
              distribution: {
                pending: withdrawals.pending,
                completed: withdrawals.completed,
                failed: withdrawals.failed,
              },
            }
          : null,
    };
  }

  async getPhonePeAnalytics(body: FiltersDto) {
    const { startDate, endDate, mode } = body;

    const parsedStartDate = new Date(parseStartDate(startDate));
    const parsedEndDate = new Date(parseEndDate(endDate));

    const [payinRows, payinsCount] = await this.payinRepository.findAndCount({
      where: {
        payinMadeOn: PaymentMadeOn.GATEWAY,
        gatewayName: GatewayName.PHONEPE,
        createdAt: Between(parsedStartDate, parsedEndDate),
      },
    });

    const [payoutRows, payoutsCount] = await this.payoutRepository.findAndCount(
      {
        where: {
          gatewayName: GatewayName.PHONEPE,
          payoutMadeVia: PaymentMadeOn.GATEWAY,
          createdAt: Between(parsedStartDate, parsedEndDate),
        },
      },
    );

    const [withdrawalRows, withdrawalsCount] =
      await this.withdrawalRepository.findAndCount({
        where: {
          gatewayName: GatewayName.PHONEPE,
          withdrawalMadeOn: WithdrawalMadeOn.GATEWAY,
          createdAt: Between(parsedStartDate, parsedEndDate),
        },
      });

    const payins = payinRows.reduce(
      (prev, curr) => {
        if (curr.status === OrderStatus.COMPLETE) {
          prev.completedAmount += curr.amount;
          prev.completed++;
        }
        if (curr.status === OrderStatus.FAILED) {
          prev.failedAmount += curr.amount;
          prev.failed++;
        }
        if (curr.status === OrderStatus.ASSIGNED) {
          prev.pendingAmount += curr.amount;
          prev.assigned++;
        }

        if (curr.status === OrderStatus.SUBMITTED) {
          prev.pendingAmount += curr.amount;
          prev.submitted++;
        }

        return prev;
      },
      {
        completedAmount: 0,
        failedAmount: 0,
        pendingAmount: 0,
        assigned: 0,
        submitted: 0,
        completed: 0,
        failed: 0,
      },
    );

    const payouts = payoutRows.reduce(
      (prev, curr) => {
        if (curr.status === OrderStatus.COMPLETE) {
          prev.completedAmount += curr.amount;
          prev.completed++;
        }
        if (curr.status === OrderStatus.FAILED) {
          prev.failedAmount += curr.amount;
          prev.failed++;
        }
        if (curr.status === OrderStatus.ASSIGNED) {
          prev.pendingAmount += curr.amount;
          prev.assigned++;
        }

        if (curr.status === OrderStatus.SUBMITTED) {
          prev.pendingAmount += curr.amount;
          prev.submitted++;
        }

        return prev;
      },
      {
        completedAmount: 0,
        failedAmount: 0,
        pendingAmount: 0,
        assigned: 0,
        submitted: 0,
        completed: 0,
        failed: 0,
      },
    );

    const withdrawals = withdrawalRows.reduce(
      (prev, curr) => {
        if (curr.status === WithdrawalOrderStatus.COMPLETE) {
          prev.completedAmount += curr.amount;
          prev.completed++;
        }
        if (curr.status === WithdrawalOrderStatus.FAILED) {
          prev.failedAmount += curr.amount;
          prev.failed++;
        }
        if (curr.status === WithdrawalOrderStatus.PENDING) {
          prev.pendingAmount += curr.amount;
          prev.pending++;
        }

        return prev;
      },
      {
        completedAmount: 0,
        failedAmount: 0,
        pendingAmount: 0,
        pending: 0,
        completed: 0,
        failed: 0,
      },
    );

    return {
      payins:
        mode === 'PAYINS' || !mode
          ? {
              orders: {
                total: payinsCount,
                totalCompleted: payins.completedAmount,
                totalFailed: payins.failedAmount,
                totalPending: payins.pendingAmount,
              },
              distribution: {
                assigned: payins.assigned,
                submitted: payins.submitted,
                completed: payins.completed,
                failed: payins.failed,
              },
            }
          : null,
      payouts:
        mode === 'PAYOUTS' || !mode
          ? {
              orders: {
                total: payoutsCount,
                totalCompleted: payouts.completedAmount,
                totalFailed: payouts.failedAmount,
                totalPending: payouts.pendingAmount,
              },
              distribution: {
                assigned: payouts.assigned,
                submitted: payouts.submitted,
                completed: payouts.completed,
                failed: payouts.failed,
              },
            }
          : null,
      withdrawals:
        mode === 'WITHDRAWALS' || !mode
          ? {
              orders: {
                total: withdrawalsCount,
                totalCompleted: withdrawals.completedAmount,
                totalFailed: withdrawals.failedAmount,
                totalPending: withdrawals.pendingAmount,
              },
              distribution: {
                pending: withdrawals.pending,
                completed: withdrawals.completed,
                failed: withdrawals.failed,
              },
            }
          : null,
    };
  }

  async getRazorPayAnalytics(body: FiltersDto) {
    const { startDate, endDate, mode } = body;

    const parsedStartDate = new Date(parseStartDate(startDate));
    const parsedEndDate = new Date(parseEndDate(endDate));

    const [payinRows, payinsCount] = await this.payinRepository.findAndCount({
      where: {
        payinMadeOn: PaymentMadeOn.GATEWAY,
        gatewayName: GatewayName.RAZORPAY,
        createdAt: Between(parsedStartDate, parsedEndDate),
      },
    });

    const [payoutRows, payoutsCount] = await this.payoutRepository.findAndCount(
      {
        where: {
          gatewayName: GatewayName.RAZORPAY,
          payoutMadeVia: PaymentMadeOn.GATEWAY,
          createdAt: Between(parsedStartDate, parsedEndDate),
        },
      },
    );

    const [withdrawalRows, withdrawalsCount] =
      await this.withdrawalRepository.findAndCount({
        where: {
          gatewayName: GatewayName.RAZORPAY,
          withdrawalMadeOn: WithdrawalMadeOn.GATEWAY,
          createdAt: Between(parsedStartDate, parsedEndDate),
        },
      });

    const payins = payinRows.reduce(
      (prev, curr) => {
        if (curr.status === OrderStatus.COMPLETE) {
          prev.completedAmount += curr.amount;
          prev.completed++;
        }
        if (curr.status === OrderStatus.FAILED) {
          prev.failedAmount += curr.amount;
          prev.failed++;
        }
        if (curr.status === OrderStatus.ASSIGNED) {
          prev.pendingAmount += curr.amount;
          prev.assigned++;
        }

        if (curr.status === OrderStatus.SUBMITTED) {
          prev.pendingAmount += curr.amount;
          prev.submitted++;
        }

        return prev;
      },
      {
        completedAmount: 0,
        failedAmount: 0,
        pendingAmount: 0,
        assigned: 0,
        submitted: 0,
        completed: 0,
        failed: 0,
      },
    );

    const payouts = payoutRows.reduce(
      (prev, curr) => {
        if (curr.status === OrderStatus.COMPLETE) {
          prev.completedAmount += curr.amount;
          prev.completed++;
        }
        if (curr.status === OrderStatus.FAILED) {
          prev.failedAmount += curr.amount;
          prev.failed++;
        }
        if (curr.status === OrderStatus.ASSIGNED) {
          prev.pendingAmount += curr.amount;
          prev.assigned++;
        }

        if (curr.status === OrderStatus.SUBMITTED) {
          prev.pendingAmount += curr.amount;
          prev.submitted++;
        }

        return prev;
      },
      {
        completedAmount: 0,
        failedAmount: 0,
        pendingAmount: 0,
        assigned: 0,
        submitted: 0,
        completed: 0,
        failed: 0,
      },
    );

    const withdrawals = withdrawalRows.reduce(
      (prev, curr) => {
        if (curr.status === WithdrawalOrderStatus.COMPLETE) {
          prev.completedAmount += curr.amount;
          prev.completed++;
        }
        if (curr.status === WithdrawalOrderStatus.FAILED) {
          prev.failedAmount += curr.amount;
          prev.failed++;
        }
        if (curr.status === WithdrawalOrderStatus.PENDING) {
          prev.pendingAmount += curr.amount;
          prev.pending++;
        }

        return prev;
      },
      {
        completedAmount: 0,
        failedAmount: 0,
        pendingAmount: 0,
        pending: 0,
        completed: 0,
        failed: 0,
      },
    );

    return {
      payins:
        mode === 'PAYINS' || !mode
          ? {
              orders: {
                total: payinsCount,
                totalCompleted: payins.completedAmount,
                totalFailed: payins.failedAmount,
                totalPending: payins.pendingAmount,
              },
              distribution: {
                assigned: payins.assigned,
                submitted: payins.submitted,
                completed: payins.completed,
                failed: payins.failed,
              },
            }
          : null,
      payouts:
        mode === 'PAYOUTS' || !mode
          ? {
              orders: {
                total: payoutsCount,
                totalCompleted: payouts.completedAmount,
                totalFailed: payouts.failedAmount,
                totalPending: payouts.pendingAmount,
              },
              distribution: {
                assigned: payouts.assigned,
                submitted: payouts.submitted,
                completed: payouts.completed,
                failed: payouts.failed,
              },
            }
          : null,
      withdrawals:
        mode === 'WITHDRAWALS' || !mode
          ? {
              orders: {
                total: withdrawalsCount,
                totalCompleted: withdrawals.completedAmount,
                totalFailed: withdrawals.failedAmount,
                totalPending: withdrawals.pendingAmount,
              },
              distribution: {
                pending: withdrawals.pending,
                completed: withdrawals.completed,
                failed: withdrawals.failed,
              },
            }
          : null,
    };
  }

  async getAllChannelAnalytics(body: FiltersDto) {
    const { startDate, endDate, mode } = body;

    const parsedStartDate = new Date(parseStartDate(startDate));
    const parsedEndDate = new Date(parseEndDate(endDate));

    const [payinRows, payinsCount] = await this.payinRepository.findAndCount({
      where: {
        createdAt: Between(parsedStartDate, parsedEndDate),
      },
    });

    const [payoutRows, payoutsCount] = await this.payoutRepository.findAndCount(
      {
        where: {
          createdAt: Between(parsedStartDate, parsedEndDate),
        },
      },
    );

    const payins = payinRows.reduce(
      (prev, curr) => {
        if (curr.channel === ChannelName.UPI) {
          prev.upi++;
          if (curr.payinMadeOn === PaymentMadeOn.MEMBER)
            prev.memberChannelUpi++;
          if (curr.gatewayName === GatewayName.PHONEPE) prev.phonepeUpi++;
          if (curr.gatewayName === GatewayName.RAZORPAY) prev.razorpayUpi++;
        }
        if (curr.channel === ChannelName.BANKING) {
          prev.netBanking++;
          if (curr.payinMadeOn === PaymentMadeOn.MEMBER)
            prev.memberChannelBanking++;
          if (curr.gatewayName === GatewayName.PHONEPE) prev.phonepeBanking++;
          if (curr.gatewayName === GatewayName.RAZORPAY) prev.razorpayBanking++;
        }
        if (curr.channel === ChannelName.BANKING) {
          prev.eWallet++;
          if (curr.payinMadeOn === PaymentMadeOn.MEMBER)
            prev.memberChannelEWallet++;
          if (curr.gatewayName === GatewayName.PHONEPE) prev.phonepeEWallet++;
          if (curr.gatewayName === GatewayName.RAZORPAY) prev.razorpayEWallet++;
        }
        return prev;
      },
      {
        upi: 0,
        netBanking: 0,
        eWallet: 0,
        memberChannelUpi: 0,
        phonepeUpi: 0,
        razorpayUpi: 0,
        memberChannelBanking: 0,
        phonepeBanking: 0,
        razorpayBanking: 0,
        memberChannelEWallet: 0,
        phonepeEWallet: 0,
        razorpayEWallet: 0,
      },
    );

    const payouts = payoutRows.reduce(
      (prev, curr) => {
        if (curr.channel === ChannelName.UPI) {
          prev.upi++;
          if (curr.payoutMadeVia === PaymentMadeOn.MEMBER)
            prev.memberChannelUpi++;
          if (curr.gatewayName === GatewayName.PHONEPE) prev.phonepeUpi++;
          if (curr.gatewayName === GatewayName.RAZORPAY) prev.razorpayUpi++;
        }
        if (curr.channel === ChannelName.BANKING) {
          prev.netBanking++;
          if (curr.payoutMadeVia === PaymentMadeOn.MEMBER)
            prev.memberChannelBanking++;
          if (curr.gatewayName === GatewayName.PHONEPE) prev.phonepeBanking++;
          if (curr.gatewayName === GatewayName.RAZORPAY) prev.razorpayBanking++;
        }
        if (curr.channel === ChannelName.BANKING) {
          prev.eWallet++;
          if (curr.payoutMadeVia === PaymentMadeOn.MEMBER)
            prev.memberChannelEWallet++;
          if (curr.gatewayName === GatewayName.PHONEPE) prev.phonepeEWallet++;
          if (curr.gatewayName === GatewayName.RAZORPAY) prev.razorpayEWallet++;
        }
        return prev;
      },
      {
        upi: 0,
        netBanking: 0,
        eWallet: 0,
        memberChannelUpi: 0,
        phonepeUpi: 0,
        razorpayUpi: 0,
        memberChannelBanking: 0,
        phonepeBanking: 0,
        razorpayBanking: 0,
        memberChannelEWallet: 0,
        phonepeEWallet: 0,
        razorpayEWallet: 0,
      },
    );

    return {
      payins: {
        orders: {
          upi: payins.upi,
          netBanking: payins.netBanking,
          eWallet: payins.eWallet,
        },
        distribution: {
          upi: {
            memberChannel: payins.memberChannelUpi,
            phonepe: payins.phonepeUpi,
            razorpay: payins.razorpayUpi,
          },
          netBanking: {
            memberChannel: payins.memberChannelBanking,
            phonepe: payins.phonepeBanking,
            razorpay: payins.razorpayBanking,
          },
          eWallet: {
            memberChannel: payins.memberChannelEWallet,
            phonepe: payins.phonepeEWallet,
            razorpay: payins.razorpayEWallet,
          },
        },
      },
      payouts: {
        orders: {
          upi: payouts.upi,
          netBanking: payouts.netBanking,
          eWallet: payouts.eWallet,
        },
        distribution: {
          upi: {
            memberChannel: payouts.memberChannelUpi,
            phonepe: payouts.phonepeUpi,
            razorpay: payouts.razorpayUpi,
          },
          netBanking: {
            memberChannel: payouts.memberChannelBanking,
            phonepe: payouts.phonepeBanking,
            razorpay: payouts.razorpayBanking,
          },
          eWallet: {
            memberChannel: payouts.memberChannelEWallet,
            phonepe: payouts.phonepeEWallet,
            razorpay: payouts.razorpayEWallet,
          },
        },
      },
    };
  }

  async getUpiAnalytics(body: FiltersDto) {
    const { startDate, endDate, mode } = body;

    const parsedStartDate = new Date(parseStartDate(startDate));
    const parsedEndDate = new Date(parseEndDate(endDate));

    console.log(parsedStartDate, parsedEndDate);

    const [payinRows, payinsCount] = await this.payinRepository.findAndCount({
      where: {
        channel: ChannelName.UPI,
        createdAt: Between(parsedStartDate, parsedEndDate),
      },
    });

    const [payoutRows, payoutsCount] = await this.payoutRepository.findAndCount(
      {
        where: {
          channel: ChannelName.UPI,
          createdAt: Between(parsedStartDate, parsedEndDate),
        },
      },
    );

    const [withdrawalRows, withdrawalsCount] =
      await this.withdrawalRepository.findAndCount({
        where: {
          channel: ChannelName.UPI,
          createdAt: Between(parsedStartDate, parsedEndDate),
        },
      });

    const payins = payinRows.reduce(
      (prev, curr) => {
        if (curr.status === OrderStatus.COMPLETE) {
          prev.completed++;
          prev.totalCompleted += curr.amount;
        }
        if (curr.status === OrderStatus.FAILED) {
          prev.failed++;
          prev.totalFailed += curr.amount;
        }
        if (curr.status === OrderStatus.ASSIGNED) {
          prev.assigned++;
          prev.totalPending += curr.amount;
        }
        if (curr.status === OrderStatus.SUBMITTED) {
          prev.submitted++;
          prev.totalPending += curr.amount;
        }
        if (curr.status === OrderStatus.INITIATED) {
          prev.initiated++;
          prev.totalPending += curr.amount;
        }
        return prev;
      },
      {
        totalCompleted: 0,
        totalFailed: 0,
        totalPending: 0,
        initiated: 0,
        assigned: 0,
        submitted: 0,
        completed: 0,
        failed: 0,
      },
    );

    const payouts = payoutRows.reduce(
      (prev, curr) => {
        if (curr.status === OrderStatus.COMPLETE) {
          prev.completed++;
          prev.totalCompleted += curr.amount;
        }
        if (curr.status === OrderStatus.FAILED) {
          prev.failed++;
          prev.totalFailed += curr.amount;
        }
        if (curr.status === OrderStatus.ASSIGNED) {
          prev.assigned++;
          prev.totalPending += curr.amount;
        }
        if (curr.status === OrderStatus.SUBMITTED) {
          prev.submitted++;
          prev.totalPending += curr.amount;
        }
        if (curr.status === OrderStatus.INITIATED) {
          prev.initiated++;
          prev.totalPending += curr.amount;
        }
        return prev;
      },
      {
        totalCompleted: 0,
        totalFailed: 0,
        totalPending: 0,
        initiated: 0,
        assigned: 0,
        submitted: 0,
        completed: 0,
        failed: 0,
      },
    );

    const withdrawals = withdrawalRows.reduce(
      (prev, curr) => {
        if (curr.status === WithdrawalOrderStatus.COMPLETE) {
          prev.completed++;
          prev.totalCompleted += curr.amount;
        }
        if (curr.status === WithdrawalOrderStatus.FAILED) {
          prev.failed++;
          prev.totalFailed += curr.amount;
        }
        if (curr.status === WithdrawalOrderStatus.REJECTED) {
          prev.rejected++;
        }
        if (curr.status === WithdrawalOrderStatus.PENDING) {
          prev.pending++;
          prev.totalPending += curr.amount;
        }

        return prev;
      },
      {
        totalCompleted: 0,
        totalFailed: 0,
        totalPending: 0,
        pending: 0,
        rejected: 0,
        completed: 0,
        failed: 0,
      },
    );

    return {
      payins: {
        orders: {
          total: payinsCount,
          totalCompleted: payins.totalCompleted,
          totalFailed: payins.totalFailed,
          totalPending: payins.totalPending,
        },
        distribution: {
          initiated: payins.initiated,
          assigned: payins.assigned,
          submitted: payins.submitted,
          completed: payins.completed,
          failed: payins.failed,
        },
      },
      payouts: {
        orders: {
          total: payoutsCount,
          totalCompleted: payouts.totalCompleted,
          totalFailed: payouts.totalFailed,
          totalPending: payouts.totalPending,
        },
        distribution: {
          initiated: payouts.initiated,
          assigned: payouts.assigned,
          submitted: payouts.assigned,
          completed: payouts.completed,
          failed: payouts.failed,
        },
      },
      withdrawals: {
        orders: {
          total: withdrawalsCount,
          totalCompleted: withdrawals.totalCompleted,
          totalFailed: withdrawals.totalFailed,
          totalPending: withdrawals.totalPending,
        },
        distribution: {
          pending: withdrawals.pending,
          rejected: withdrawals.rejected,
          completed: withdrawals.completed,
          failed: withdrawals.failed,
        },
      },
    };
  }

  async getNetBankingAnalytics(body: FiltersDto) {
    const { startDate, endDate, mode } = body;

    const parsedStartDate = new Date(parseStartDate(startDate));
    const parsedEndDate = new Date(parseEndDate(endDate));

    const [payinRows, payinsCount] = await this.payinRepository.findAndCount({
      where: {
        channel: ChannelName.BANKING,
        createdAt: Between(parsedStartDate, parsedEndDate),
      },
    });

    const [payoutRows, payoutsCount] = await this.payoutRepository.findAndCount(
      {
        where: {
          channel: ChannelName.BANKING,
          createdAt: Between(parsedStartDate, parsedEndDate),
        },
      },
    );

    const [withdrawalRows, withdrawalsCount] =
      await this.withdrawalRepository.findAndCount({
        where: {
          channel: ChannelName.BANKING,
          createdAt: Between(parsedStartDate, parsedEndDate),
        },
      });

    const payins = payinRows.reduce(
      (prev, curr) => {
        if (curr.status === OrderStatus.COMPLETE) {
          prev.completed++;
          prev.totalCompleted += curr.amount;
        }
        if (curr.status === OrderStatus.FAILED) {
          prev.failed++;
          prev.totalFailed += curr.amount;
        }
        if (curr.status === OrderStatus.ASSIGNED) {
          prev.assigned++;
          prev.totalPending += curr.amount;
        }
        if (curr.status === OrderStatus.SUBMITTED) {
          prev.submitted++;
          prev.totalPending += curr.amount;
        }
        if (curr.status === OrderStatus.INITIATED) {
          prev.initiated++;
          prev.totalPending += curr.amount;
        }
        return prev;
      },
      {
        totalCompleted: 0,
        totalFailed: 0,
        totalPending: 0,
        initiated: 0,
        assigned: 0,
        submitted: 0,
        completed: 0,
        failed: 0,
      },
    );

    const payouts = payoutRows.reduce(
      (prev, curr) => {
        if (curr.status === OrderStatus.COMPLETE) {
          prev.completed++;
          prev.totalCompleted += curr.amount;
        }
        if (curr.status === OrderStatus.FAILED) {
          prev.failed++;
          prev.totalFailed += curr.amount;
        }
        if (curr.status === OrderStatus.ASSIGNED) {
          prev.assigned++;
          prev.totalPending += curr.amount;
        }
        if (curr.status === OrderStatus.SUBMITTED) {
          prev.submitted++;
          prev.totalPending += curr.amount;
        }
        if (curr.status === OrderStatus.INITIATED) {
          prev.initiated++;
          prev.totalPending += curr.amount;
        }
        return prev;
      },
      {
        totalCompleted: 0,
        totalFailed: 0,
        totalPending: 0,
        initiated: 0,
        assigned: 0,
        submitted: 0,
        completed: 0,
        failed: 0,
      },
    );

    const withdrawals = withdrawalRows.reduce(
      (prev, curr) => {
        if (curr.status === WithdrawalOrderStatus.COMPLETE) {
          prev.completed++;
          prev.totalCompleted += curr.amount;
        }
        if (curr.status === WithdrawalOrderStatus.FAILED) {
          prev.failed++;
          prev.totalFailed += curr.amount;
        }
        if (curr.status === WithdrawalOrderStatus.REJECTED) {
          prev.rejected++;
        }
        if (curr.status === WithdrawalOrderStatus.PENDING) {
          prev.pending++;
          prev.totalPending += curr.amount;
        }

        return prev;
      },
      {
        totalCompleted: 0,
        totalFailed: 0,
        totalPending: 0,
        pending: 0,
        rejected: 0,
        completed: 0,
        failed: 0,
      },
    );

    return {
      payins: {
        orders: {
          total: payinsCount,
          totalCompleted: payins.totalCompleted,
          totalFailed: payins.totalFailed,
          totalPending: payins.totalPending,
        },
        distribution: {
          initiated: payins.initiated,
          assigned: payins.assigned,
          submitted: payins.submitted,
          completed: payins.completed,
          failed: payins.failed,
        },
      },
      payouts: {
        orders: {
          total: payoutsCount,
          totalCompleted: payouts.totalCompleted,
          totalFailed: payouts.totalFailed,
          totalPending: payouts.totalPending,
        },
        distribution: {
          initiated: payouts.initiated,
          assigned: payouts.assigned,
          submitted: payouts.assigned,
          completed: payouts.completed,
          failed: payouts.failed,
        },
      },
      withdrawals: {
        orders: {
          total: withdrawalsCount,
          totalCompleted: withdrawals.totalCompleted,
          totalFailed: withdrawals.totalFailed,
          totalPending: withdrawals.totalPending,
        },
        distribution: {
          pending: withdrawals.pending,
          rejected: withdrawals.rejected,
          completed: withdrawals.completed,
          failed: withdrawals.failed,
        },
      },
    };
  }

  async getEWalletAnalytics(body: FiltersDto) {
    const { startDate, endDate, mode } = body;

    const parsedStartDate = new Date(parseStartDate(startDate));
    const parsedEndDate = new Date(parseEndDate(endDate));

    const [payinRows, payinsCount] = await this.payinRepository.findAndCount({
      where: {
        channel: ChannelName.E_WALLET,
        createdAt: Between(parsedStartDate, parsedEndDate),
      },
    });

    const [payoutRows, payoutsCount] = await this.payoutRepository.findAndCount(
      {
        where: {
          channel: ChannelName.E_WALLET,
          createdAt: Between(parsedStartDate, parsedEndDate),
        },
      },
    );

    const [withdrawalRows, withdrawalsCount] =
      await this.withdrawalRepository.findAndCount({
        where: {
          channel: ChannelName.E_WALLET,
          createdAt: Between(parsedStartDate, parsedEndDate),
        },
      });

    const payins = payinRows.reduce(
      (prev, curr) => {
        if (curr.status === OrderStatus.COMPLETE) {
          prev.completed++;
          prev.totalCompleted += curr.amount;
        }
        if (curr.status === OrderStatus.FAILED) {
          prev.failed++;
          prev.totalFailed += curr.amount;
        }
        if (curr.status === OrderStatus.ASSIGNED) {
          prev.assigned++;
          prev.totalPending += curr.amount;
        }
        if (curr.status === OrderStatus.SUBMITTED) {
          prev.submitted++;
          prev.totalPending += curr.amount;
        }
        if (curr.status === OrderStatus.INITIATED) {
          prev.initiated++;
          prev.totalPending += curr.amount;
        }
        return prev;
      },
      {
        totalCompleted: 0,
        totalFailed: 0,
        totalPending: 0,
        initiated: 0,
        assigned: 0,
        submitted: 0,
        completed: 0,
        failed: 0,
      },
    );

    const payouts = payoutRows.reduce(
      (prev, curr) => {
        if (curr.status === OrderStatus.COMPLETE) {
          prev.completed++;
          prev.totalCompleted += curr.amount;
        }
        if (curr.status === OrderStatus.FAILED) {
          prev.failed++;
          prev.totalFailed += curr.amount;
        }
        if (curr.status === OrderStatus.ASSIGNED) {
          prev.assigned++;
          prev.totalPending += curr.amount;
        }
        if (curr.status === OrderStatus.SUBMITTED) {
          prev.submitted++;
          prev.totalPending += curr.amount;
        }
        if (curr.status === OrderStatus.INITIATED) {
          prev.initiated++;
          prev.totalPending += curr.amount;
        }
        return prev;
      },
      {
        totalCompleted: 0,
        totalFailed: 0,
        totalPending: 0,
        initiated: 0,
        assigned: 0,
        submitted: 0,
        completed: 0,
        failed: 0,
      },
    );

    const withdrawals = withdrawalRows.reduce(
      (prev, curr) => {
        if (curr.status === WithdrawalOrderStatus.COMPLETE) {
          prev.completed++;
          prev.totalCompleted += curr.amount;
        }
        if (curr.status === WithdrawalOrderStatus.FAILED) {
          prev.failed++;
          prev.totalFailed += curr.amount;
        }
        if (curr.status === WithdrawalOrderStatus.REJECTED) {
          prev.rejected++;
        }
        if (curr.status === WithdrawalOrderStatus.PENDING) {
          prev.pending++;
          prev.totalPending += curr.amount;
        }

        return prev;
      },
      {
        totalCompleted: 0,
        totalFailed: 0,
        totalPending: 0,
        pending: 0,
        rejected: 0,
        completed: 0,
        failed: 0,
      },
    );

    return {
      payins: {
        orders: {
          total: payinsCount,
          totalCompleted: payins.totalCompleted,
          totalFailed: payins.totalFailed,
          totalPending: payins.totalPending,
        },
        distribution: {
          initiated: payins.initiated,
          assigned: payins.assigned,
          submitted: payins.submitted,
          completed: payins.completed,
          failed: payins.failed,
        },
      },
      payouts: {
        orders: {
          total: payoutsCount,
          totalCompleted: payouts.totalCompleted,
          totalFailed: payouts.totalFailed,
          totalPending: payouts.totalPending,
        },
        distribution: {
          initiated: payouts.initiated,
          assigned: payouts.assigned,
          submitted: payouts.assigned,
          completed: payouts.completed,
          failed: payouts.failed,
        },
      },
      withdrawals: {
        orders: {
          total: withdrawalsCount,
          totalCompleted: withdrawals.totalCompleted,
          totalFailed: withdrawals.totalFailed,
          totalPending: withdrawals.totalPending,
        },
        distribution: {
          pending: withdrawals.pending,
          rejected: withdrawals.rejected,
          completed: withdrawals.completed,
          failed: withdrawals.failed,
        },
      },
    };
  }

  async getBalancesCommissionsAndProfit(body: FiltersDto) {
    const { startDate, endDate, mode } = body;

    const parsedStartDate = new Date(parseStartDate(startDate));
    const parsedEndDate = new Date(parseEndDate(endDate));

    const merchant = await this.merchantRepository.find();
    const merchantBalance = merchant.reduce((prev, curr) => {
      return (prev += curr.balance);
    }, 0);

    const member = await this.memberRepository.find();
    const memberData = member.reduce(
      (prev, curr) => {
        prev.quota += curr.quota;
        prev.balance += curr.balance;
        return prev;
      },
      { balance: 0, quota: 0 },
    );

    const agent = await this.agentRepository.find();
    const agentBalance = agent.reduce((prev, curr) => {
      return (prev += curr.balance);
    }, 0);

    const { systemProfit } = await this.systemConfigService.findLatest();

    const transactionUpdates = await this.transactionUpdateRepository
      .createQueryBuilder('transactionUpdate')
      .where('transactionUpdate.before != transactionUpdate.after')
      .andWhere('transactionUpdate.pending = false')
      .andWhere('transactionUpdate.createdAt BETWEEN :startDate AND :endDate', {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      })
      .getMany();

    const transactions = transactionUpdates.reduce(
      (prev, curr) => {
        if (
          curr.userType === UserTypeForTransactionUpdates.MERCHANT_BALANCE &&
          curr.orderType === OrderType.PAYIN
        )
          prev.merchantIncome += curr.after - curr.before;

        if (curr.userType === UserTypeForTransactionUpdates.MERCHANT_BALANCE)
          prev.merchantFees += curr.amount;

        if (curr.userType === UserTypeForTransactionUpdates.MEMBER_QUOTA)
          prev.memberCommissions += curr.amount;

        if (
          curr.userType === UserTypeForTransactionUpdates.MEMBER_BALANCE ||
          curr.userType === UserTypeForTransactionUpdates.AGENT_BALANCE
        )
          prev.agentCommissions += curr.amount;

        if (curr.userType === UserTypeForTransactionUpdates.GATEWAY_FEE)
          prev.gatewayCharge += curr.amount;

        if (curr.userType === UserTypeForTransactionUpdates.SYSTEM_PROFIT)
          prev.systemIncome += curr.amount;

        return prev;
      },
      {
        merchantIncome: 0,
        merchantFees: 0,
        memberCommissions: 0,
        agentCommissions: 0,
        gatewayCharge: 0,
        systemIncome: 0,
      },
    );

    const transactionUpdatesDistinct = await this.transactionUpdateRepository
      .createQueryBuilder('transactionUpdate')
      .leftJoinAndSelect('transactionUpdate.payinOrder', 'payinOrder')
      .leftJoinAndSelect('transactionUpdate.payoutOrder', 'payoutOrder')
      .leftJoinAndSelect('transactionUpdate.withdrawalOrder', 'withdrawalOrder')
      .leftJoinAndSelect('transactionUpdate.topupOrder', 'topupOrder')
      .where('transactionUpdate.before != transactionUpdate.after')
      .andWhere('transactionUpdate.pending = false')
      .andWhere('transactionUpdate.createdAt BETWEEN :startDate AND :endDate', {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      })
      .distinctOn(['transactionUpdate.systemOrderId'])
      .getMany();

    const graphData = transactionUpdatesDistinct.reduce(
      (prev, curr) => {
        if (curr.orderType === OrderType.PAYIN) {
          if (curr.payinOrder.payinMadeOn === PaymentMadeOn.MEMBER) {
            switch (curr.payinOrder.channel) {
              case ChannelName.UPI:
                prev.memberChannelUpi++;
                break;
              case ChannelName.BANKING:
                prev.memberChannelBanking++;
                break;
              case ChannelName.E_WALLET:
                prev.memberChannelEWallet++;
                break;
            }
          } else {
            if (curr.payinOrder.gatewayName === GatewayName.RAZORPAY) {
              switch (curr.payinOrder.channel) {
                case ChannelName.UPI:
                  prev.razorpayUpi++;
                  break;
                case ChannelName.BANKING:
                  prev.razorpayBanking++;
                  break;
                case ChannelName.E_WALLET:
                  prev.razorpayEwallet++;
                  break;
              }
            } else {
              switch (curr.payinOrder.channel) {
                case ChannelName.UPI:
                  prev.phonepeUpi++;
                  break;
                case ChannelName.BANKING:
                  prev.phonepeBanking++;
                  break;
                case ChannelName.E_WALLET:
                  prev.phonepeEwallet++;
                  break;
              }
            }
          }
        }

        if (curr.orderType === OrderType.PAYOUT) {
          if (curr.payoutOrder.payoutMadeVia === PaymentMadeOn.MEMBER) {
            switch (curr.payoutOrder.channel) {
              case ChannelName.UPI:
                prev.memberChannelUpi++;
                break;
              case ChannelName.BANKING:
                prev.memberChannelBanking++;
                break;
              case ChannelName.E_WALLET:
                prev.memberChannelEWallet++;
                break;
            }
          } else {
            if (curr.payoutOrder.gatewayName === GatewayName.RAZORPAY) {
              switch (curr.payoutOrder.channel) {
                case ChannelName.UPI:
                  prev.razorpayUpi++;
                  break;
                case ChannelName.BANKING:
                  prev.razorpayBanking++;
                  break;
                case ChannelName.E_WALLET:
                  prev.razorpayEwallet++;
                  break;
              }
            } else {
              switch (curr.payoutOrder.channel) {
                case ChannelName.UPI:
                  prev.phonepeUpi++;
                  break;
                case ChannelName.BANKING:
                  prev.phonepeBanking++;
                  break;
                case ChannelName.E_WALLET:
                  prev.phonepeEwallet++;
                  break;
              }
            }
          }
        }

        if (curr.orderType === OrderType.WITHDRAWAL) {
          if (
            curr.withdrawalOrder.withdrawalMadeOn === WithdrawalMadeOn.ADMIN
          ) {
            switch (curr.withdrawalOrder.channel) {
              case ChannelName.UPI:
                prev.memberChannelUpi++;
                break;
              case ChannelName.BANKING:
                prev.memberChannelBanking++;
                break;
              case ChannelName.E_WALLET:
                prev.memberChannelEWallet++;
                break;
            }
          } else {
            if (curr.withdrawalOrder.gatewayName === GatewayName.RAZORPAY) {
              switch (curr.withdrawalOrder.channel) {
                case ChannelName.UPI:
                  prev.razorpayUpi++;
                  break;
                case ChannelName.BANKING:
                  prev.razorpayBanking++;
                  break;
                case ChannelName.E_WALLET:
                  prev.razorpayEwallet++;
                  break;
              }
            } else {
              switch (curr.withdrawalOrder.channel) {
                case ChannelName.UPI:
                  prev.phonepeUpi++;
                  break;
                case ChannelName.BANKING:
                  prev.phonepeBanking++;
                  break;
                case ChannelName.E_WALLET:
                  prev.phonepeEwallet++;
                  break;
              }
            }
          }
        }

        if (curr.orderType === OrderType.TOPUP) {
          switch (curr.topupOrder.channel) {
            case ChannelName.UPI:
              prev.razorpayUpi++;
              break;
            case ChannelName.BANKING:
              prev.razorpayBanking++;
              break;
            case ChannelName.E_WALLET:
              prev.razorpayEwallet++;
              break;
          }
        }

        return prev;
      },
      {
        memberChannelUpi: 0,
        memberChannelBanking: 0,
        memberChannelEWallet: 0,
        razorpayUpi: 0,
        razorpayBanking: 0,
        razorpayEwallet: 0,
        phonepeUpi: 0,
        phonepeBanking: 0,
        phonepeEwallet: 0,
      },
    );

    return {
      balances: {
        merchantBalance: roundOffAmount(merchantBalance),
        memberQuota: roundOffAmount(memberData.quota),
        agentBalance: roundOffAmount(agentBalance + memberData.balance),
        systemBalance: roundOffAmount(systemProfit),
      },
      commissions: {
        merchantIncome: roundOffAmount(transactions.merchantIncome),
        merchantFees: roundOffAmount(transactions.merchantFees),
        memberCommissions: roundOffAmount(transactions.memberCommissions),
        agentCommissions: roundOffAmount(transactions.agentCommissions),
        gatewayCharge: roundOffAmount(transactions.gatewayCharge),
        systemIncome: roundOffAmount(transactions.systemIncome),
      },
      graphData: {
        memberChannel: {
          upi: graphData.memberChannelUpi,
          netBanking: graphData.memberChannelBanking,
          eWallet: graphData.memberChannelEWallet,
        },
        razorpay: {
          upi: graphData.razorpayUpi,
          netBanking: graphData.razorpayBanking,
          eWallet: graphData.razorpayEwallet,
        },
        phonepe: {
          upi: graphData.phonepeUpi,
          netBanking: graphData.phonepeBanking,
          eWallet: graphData.phonepeEwallet,
        },
      },
    };
  }

  async getPayinAnalytics(body: FiltersDto) {
    const { startDate, endDate, mode, merchantId } = body;

    const parsedStartDate = new Date(parseStartDate(startDate));
    const parsedEndDate = new Date(parseEndDate(endDate));

    const whereConditions: any = {};

    if (parsedStartDate && parsedEndDate)
      whereConditions.createdAt = Between(parsedStartDate, parsedEndDate);

    if (merchantId) whereConditions.merchant = { id: merchantId };

    const [payinRows, payinsCount] = await this.payinRepository.findAndCount({
      where: whereConditions,
      relations: ['merchant', 'transactionUpdate'],
    });

    const payins = payinRows.reduce(
      (prev, curr) => {
        if (curr.status === OrderStatus.COMPLETE) {
          prev.completed++;
          prev.totalCompleted += curr.amount;

          curr.transactionUpdate
            .filter(
              (el) =>
                el.userType === UserTypeForTransactionUpdates.MERCHANT_BALANCE,
            )
            .forEach((row) => {
              prev.serviceFee += row.amount;
            });
        }
        if (curr.status === OrderStatus.FAILED) {
          prev.failed++;
          prev.totalFailed += curr.amount;
        }
        if (curr.status === OrderStatus.ASSIGNED) {
          prev.assigned++;
          prev.totalPending += curr.amount;
        }
        if (curr.status === OrderStatus.SUBMITTED) {
          prev.submitted++;
          prev.totalPending += curr.amount;
        }
        if (curr.status === OrderStatus.INITIATED) {
          prev.initiated++;
          prev.totalPending += curr.amount;
        }
        return prev;
      },
      {
        totalCompleted: 0,
        totalFailed: 0,
        totalPending: 0,
        initiated: 0,
        assigned: 0,
        submitted: 0,
        completed: 0,
        failed: 0,
        serviceFee: 0,
      },
    );

    const currentMonthIndex = moment().month();
    const monthsOfYear = monthNames();
    const monthlyCommissions = [];

    // Initialize the monthly commissions for the last 5 months including the current month
    for (let i = 0; i < 5; i++) {
      const monthIndex = (currentMonthIndex - i + 12) % 12;
      monthlyCommissions.push({
        date: monthsOfYear[monthIndex],
        Orders: 0,
      });
    }

    payinRows.forEach((transaction) => {
      const month = moment(transaction.createdAt).month();

      if (
        month >= (currentMonthIndex - 4 + 12) % 12 &&
        month <= currentMonthIndex
      ) {
        const indexInCommissions = (currentMonthIndex - month + 12) % 12;

        if (
          indexInCommissions >= 0 &&
          indexInCommissions < monthlyCommissions.length
        ) {
          monthlyCommissions[indexInCommissions].Orders += 1;
        }
      }
    });

    return {
      orders: {
        total: payinsCount,
        totalFailed: payins.totalFailed,
        totalPending: payins.totalPending,
        totalCompleted: payins.totalCompleted,
        totalServiceFee: roundOffAmount(payins.serviceFee),
        successRate: roundOffAmount((payins.completed / payinsCount) * 100),
      },
      pieChartData: {
        initiated: payins.initiated,
        assigned: payins.assigned,
        submitted: payins.submitted,
        completed: payins.completed,
        failed: payins.failed,
      },
      lineChartData: monthlyCommissions.reverse(),
    };
  }

  async getPayoutAnalytics(body: FiltersDto) {
    const { startDate, endDate, mode, merchantId } = body;

    const parsedStartDate = new Date(parseStartDate(startDate));
    const parsedEndDate = new Date(parseEndDate(endDate));

    const whereConditions: any = {};

    if (parsedStartDate && parsedEndDate)
      whereConditions.createdAt = Between(parsedStartDate, parsedEndDate);

    if (merchantId) whereConditions.merchant = { id: merchantId };

    const [payoutRows, payoutsCount] = await this.payoutRepository.findAndCount(
      {
        where: whereConditions,
        relations: ['merchant', 'transactionUpdate'],
      },
    );

    const payouts = payoutRows.reduce(
      (prev, curr) => {
        if (curr.status === OrderStatus.COMPLETE) {
          prev.completed++;
          prev.totalCompleted += curr.amount;

          curr.transactionUpdate
            .filter(
              (el) =>
                el.userType === UserTypeForTransactionUpdates.MERCHANT_BALANCE,
            )
            .forEach((row) => {
              prev.serviceFee += row.amount;
            });
        }
        if (curr.status === OrderStatus.FAILED) {
          prev.failed++;
          prev.totalFailed += curr.amount;
        }
        if (curr.status === OrderStatus.ASSIGNED) {
          prev.assigned++;
          prev.totalPending += curr.amount;
        }
        if (curr.status === OrderStatus.SUBMITTED) {
          prev.submitted++;
          prev.totalPending += curr.amount;
        }
        if (curr.status === OrderStatus.INITIATED) {
          prev.initiated++;
          prev.totalPending += curr.amount;
        }

        return prev;
      },
      {
        totalCompleted: 0,
        totalFailed: 0,
        totalPending: 0,
        initiated: 0,
        assigned: 0,
        submitted: 0,
        completed: 0,
        failed: 0,
        serviceFee: 0,
      },
    );

    const currentMonthIndex = moment().month();
    const monthsOfYear = monthNames();
    const monthlyCommissions = [];

    // Initialize the monthly commissions for the last 5 months including the current month
    for (let i = 0; i < 5; i++) {
      const monthIndex = (currentMonthIndex - i + 12) % 12;
      monthlyCommissions.push({
        date: monthsOfYear[monthIndex],
        Orders: 0,
      });
    }

    payoutRows.forEach((transaction) => {
      const month = moment(transaction.createdAt).month();

      if (
        month >= (currentMonthIndex - 4 + 12) % 12 &&
        month <= currentMonthIndex
      ) {
        const indexInCommissions = (currentMonthIndex - month + 12) % 12;

        if (
          indexInCommissions >= 0 &&
          indexInCommissions < monthlyCommissions.length
        ) {
          monthlyCommissions[indexInCommissions].Orders += 1;
        }
      }
    });

    return {
      orders: {
        total: payoutsCount,
        totalFailed: payouts.totalFailed,
        totalPending: payouts.totalPending,
        totalCompleted: payouts.totalCompleted,
        totalServiceFee: roundOffAmount(payouts.serviceFee),
        successRate: roundOffAmount((payouts.completed / payoutsCount) * 100),
      },
      pieChartData: {
        initiated: payouts.initiated,
        assigned: payouts.assigned,
        submitted: payouts.submitted,
        completed: payouts.completed,
        failed: payouts.failed,
      },
      lineChartData: monthlyCommissions.reverse(),
    };
  }

  async getWithdrawalAnalytics(body: FiltersDto) {
    const { startDate, endDate, mode } = body;

    const parsedStartDate = new Date(parseStartDate(startDate));
    const parsedEndDate = new Date(parseEndDate(endDate));

    const [withdrawalRows, withdrawalsCount] =
      await this.withdrawalRepository.findAndCount({
        where: {
          createdAt: Between(parsedStartDate, parsedEndDate),
        },
      });

    const withdrawals = withdrawalRows.reduce(
      (prev, curr) => {
        if (curr.status === WithdrawalOrderStatus.COMPLETE) {
          prev.completed++;
          prev.totalCompleted += curr.amount;
        }
        if (curr.status === WithdrawalOrderStatus.FAILED) {
          prev.failed++;
          prev.totalFailed += curr.amount;
        }
        if (curr.status === WithdrawalOrderStatus.REJECTED) prev.rejected++;

        if (curr.status === WithdrawalOrderStatus.PENDING) {
          prev.pending++;
          prev.totalPending += curr.amount;
        }
        return prev;
      },
      {
        totalCompleted: 0,
        totalFailed: 0,
        totalPending: 0,
        pending: 0,
        rejected: 0,
        completed: 0,
        failed: 0,
      },
    );

    const currentMonthIndex = moment().month();
    const monthsOfYear = monthNames();
    const monthlyCommissions = [];

    // Initialize the monthly commissions for the last 5 months including the current month
    for (let i = 0; i < 5; i++) {
      const monthIndex = (currentMonthIndex - i + 12) % 12;
      monthlyCommissions.push({
        date: monthsOfYear[monthIndex],
        Orders: 0,
      });
    }

    withdrawalRows.forEach((transaction) => {
      const month = moment(transaction.createdAt).month();

      if (
        month >= (currentMonthIndex - 4 + 12) % 12 &&
        month <= currentMonthIndex
      ) {
        const indexInCommissions = (currentMonthIndex - month + 12) % 12;

        if (
          indexInCommissions >= 0 &&
          indexInCommissions < monthlyCommissions.length
        ) {
          monthlyCommissions[indexInCommissions].Orders += 1;
        }
      }
    });

    return {
      orders: {
        total: withdrawalsCount,
        totalFailed: withdrawals.totalFailed,
        totalPending: withdrawals.totalPending,
        totalCompleted: withdrawals.totalCompleted,
      },
      pieChartData: {
        pending: withdrawals.pending,
        rejected: withdrawals.rejected,
        completed: withdrawals.completed,
        failed: withdrawals.failed,
      },
      lineChartData: monthlyCommissions.reverse(),
    };
  }

  async getTopupAnalytics(body: FiltersDto) {
    const { startDate, endDate, mode } = body;

    const parsedStartDate = new Date(parseStartDate(startDate));
    const parsedEndDate = new Date(parseEndDate(endDate));

    const [topupRows, topupsCount] = await this.topupRepository.findAndCount({
      where: {
        createdAt: Between(parsedStartDate, parsedEndDate),
      },
    });

    const topups = topupRows.reduce(
      (prev, curr) => {
        if (curr.status === OrderStatus.COMPLETE) {
          prev.totalCompleted += curr.amount;
          ++prev.total;
        }

        if (curr.status === OrderStatus.FAILED) prev.totalFailed += curr.amount;

        if (
          curr.status !== OrderStatus.COMPLETE &&
          curr.status !== OrderStatus.FAILED
        )
          prev.totalPending += curr.amount;

        return prev;
      },
      {
        total: 0,
        totalCompleted: 0,
        totalFailed: 0,
        totalPending: 0,
      },
    );

    const currentMonthIndex = moment().month();
    const monthsOfYear = monthNames();
    const monthlyCommissions = [];

    // Initialize the monthly commissions for the last 5 months including the current month
    for (let i = 0; i < 5; i++) {
      const monthIndex = (currentMonthIndex - i + 12) % 12;
      monthlyCommissions.push({
        date: monthsOfYear[monthIndex],
        Orders: 0,
      });
    }

    topupRows.forEach((transaction) => {
      const month = moment(transaction.createdAt).month();

      if (
        month >= (currentMonthIndex - 4 + 12) % 12 &&
        month <= currentMonthIndex
      ) {
        const indexInCommissions = (currentMonthIndex - month + 12) % 12;

        if (
          indexInCommissions >= 0 &&
          indexInCommissions < monthlyCommissions.length
        ) {
          monthlyCommissions[indexInCommissions].Orders += 1;
        }
      }
    });

    return {
      orders: {
        total: topups.total,
        totalFailed: topups.totalFailed,
        totalPending: topups.totalPending,
        totalCompleted: topups.totalCompleted,
      },

      lineChartData: monthlyCommissions.reverse(),
    };
  }
}
