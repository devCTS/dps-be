import { Exclude, Expose, Transform } from 'class-transformer';
import {
  ChannelName,
  GatewayName,
  NotificationStatus,
  UserTypeForTransactionUpdates,
  WithdrawalMadeOn,
  WithdrawalOrderStatus,
} from 'src/utils/enum/enum';

@Exclude()
export class WithdrawalUserResponseDto {
  @Expose()
  id: number;

  @Expose()
  systemOrderId: string;

  @Expose()
  amount: number;

  @Expose()
  netAmount: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  status: string;

  @Expose()
  channel: ChannelName;

  @Expose()
  serviceCharge: number;

  @Expose()
  balanceAfter: number;

  @Expose()
  balanceBefore: number;

  @Expose()
  date: string;
}

@Exclude()
export class WithdrawalDetailsUserResDto {
  @Expose()
  id: number;

  @Expose()
  systemOrderId: string;

  @Expose()
  amount: number;

  @Expose()
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  status: WithdrawalOrderStatus;

  @Expose()
  channel: ChannelName;

  @Expose()
  @TransformChannelDetails()
  userChannel: JSON;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Transform(({ value }) => (value ? value.toLowerCase() : null), {
    toClassOnly: true,
  })
  withdrawalMadeOn: WithdrawalMadeOn | null;

  @Expose()
  transactionDetails: {};

  @Expose()
  serviceCharge: number;

  @Expose()
  balanceDeducted: number;
}

export function TransformChannelDetails() {
  return Transform(
    ({ value }) => {
      const formatChannelDetails = (value) => {
        if (value.upiId)
          return {
            'UPI ID': value.upiId,
            Mobile: value.mobile,
            qrCode: value?.qrCode,
          };

        if (value.app)
          return {
            App: value.app,
            Mobile: value.mobile,
          };

        if (value.bankName) {
          return {
            'Bank Name': value.bankName,
            'IFSC Code': value.ifsc,
            'Account Number': value.accountNumber,
            'Beneficiary Name': value.beneficiaryName,
          };
        }
      };

      return formatChannelDetails(value);
    },
    { toClassOnly: true },
  );
}
