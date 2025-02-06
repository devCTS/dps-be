import { HttpStatus } from '@nestjs/common';
import bycrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  AlertType,
  GatewayName,
  NotificationType,
  ServiceRateType,
} from './enum/enum';

// Encrypt password or match password
export const encryptPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const salt = await bycrypt.genSalt(saltRounds);
  return bycrypt.hash(password, salt);
};

export const checkPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bycrypt.compare(password, hashedPassword);
};

// Generate web token and check web token
export const generateJwtToken = (payload: any) => {
  const secretKey = process.env.JWT_SECRET;
  const token = jwt.sign(payload, secretKey, { expiresIn: '2h' });
  return token;
};

export const verifyToken = async (
  token: string,
): Promise<string | jwt.JwtPayload> => {
  const secretKey = process.env.JWT_SECRET;
  try {
    const details = await jwt.verify(token, secretKey);
    return details;
  } catch (error) {
    return { status: HttpStatus.FORBIDDEN, message: 'invalid token' };
  }
};

export const generateRandomOTP = () => {
  let sixDigitRandomNumber;

  do {
    const randomDecimal = Math.random();
    sixDigitRandomNumber = Math.floor(randomDecimal * 900000) + 100000;
  } while (String(sixDigitRandomNumber).startsWith('0'));

  return sixDigitRandomNumber;
};

export const extractToken = (token: string) => {
  return token.split(' ')[1];
};

export const roundOffAmount = (amount, makeAbsolute = false) => {
  if (!amount) return 0;

  const [decimalAmount, floatingAmount] = amount.toString().split('.');
  if (!floatingAmount)
    return makeAbsolute
      ? Math.abs(Number(decimalAmount))
      : Number(decimalAmount);

  const truncatedFloatingAmount = floatingAmount.substring(0, 2);
  const finalAmount = Number(decimalAmount + '.' + truncatedFloatingAmount);

  return makeAbsolute ? Math.abs(finalAmount) : finalAmount;
};

export const getTextForNotification = (type: NotificationType, data: any) => {
  let text;

  switch (type) {
    case NotificationType.GRAB_PAYOUT:
      text = `A new payout order of amount ${data.amount} is up for grab on for channel - ${data.channel}`;
      break;
    case NotificationType.GRAB_TOPUP:
      text = `A new topup order of amount ${data.amount} is up for grab on for channel - ${data.channel}`;
      break;
    case NotificationType.PAYOUT_REJECTED:
      text = `Your payment submission for payout order #${data.orderId} for amount ${data.amount} has been rejected.`;
      break;
    case NotificationType.PAYOUT_VERIFIED:
      text = `Your payment submission for payout order #${data.orderId} for amount ${data.amount} has been verified.`;
      break;
    case NotificationType.TOPUP_REJETCED:
      text = `Your payment submission for topup order #${data.orderId} for amount ${data.amount} has been rejected.`;
      break;
    case NotificationType.TOPUP_VERIFIED:
      text = `Your payment submission for topup order #${data.orderId} for amount ${data.amount} has been verified.`;
      break;
    case NotificationType.PAYIN_FOR_VERIFY:
      text = `You have a new payin order to be verified for amount ${data.amount}.`;
      break;
    default:
      break;
  }

  return text;
};

export const getTextForAlert = (type: AlertType, data: any) => {
  let text;

  switch (type) {
    case AlertType.PAYOUT_FAILED:
      text = `Your payout order (#${data?.orderId}) of amount ${data?.amount} has been failed.`;
      break;
    case AlertType.PAYOUT_SUCCESS:
      text = `Your payout order (#${data?.orderId}) of amount ${data?.amount} has been completed.`;
      break;
    case AlertType.WITHDRAWAL_COMPLETE:
      text = `Your withdrawal order (#${data?.orderId}) of amount ${data?.amount} has been completed.`;
      break;
    case AlertType.WITHDRAWAL_FAILED:
      text = `Your withdrawal order (#${data?.orderId}) of amount ${data?.amount} has been failed.`;
      break;
    case AlertType.WITHDRAWAL_REJECTED:
      text = `Your withdrawal order (#${data?.orderId}) of amount ${data?.amount} has been rejected.`;
      break;
    default:
      break;
  }

  return text;
};

export const monthNames = () => {
  return [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
};

export const calculateServiceAmountForMerchant = (
  orderAmount: number,
  serviceRate: ServiceRateType,
) => {
  if (!orderAmount || !serviceRate) return 0;

  if (serviceRate.mode === 'ABSOLUTE') return serviceRate.absoluteAmount;

  if (serviceRate.mode === 'PERCENTAGE')
    return (orderAmount / 100) * serviceRate.percentageAmount;

  if (serviceRate.mode === 'COMBINATION') {
    const percentageAmount = (orderAmount / 100) * serviceRate.percentageAmount;

    return percentageAmount + serviceRate.absoluteAmount;
  }
};

export const getServicerRateForMerchant = (absoluteAmount, rate) => {
  if (!absoluteAmount && !rate) return 0;

  if (absoluteAmount && rate) return `₹${absoluteAmount} + ${rate}%`;
  if (absoluteAmount) return `₹${absoluteAmount}`;
  if (rate) return `${rate}%`;
};

export const mapAndGetGatewayPayoutStatus = (
  gateway: GatewayName,
  status: string,
): 'FAILED' | 'SUCCESS' | 'PENDING' => {
  switch (gateway) {
    case GatewayName.RAZORPAY:
      if (status === 'processed') return 'SUCCESS';
      if (
        status === 'failed' ||
        status === 'rejected' ||
        status === 'cancelled'
      )
        return 'FAILED';

      return 'PENDING';

    case GatewayName.UNIQPAY:
      if (status === 'Transaction Successful') return 'SUCCESS';

      if (
        status === 'Transaction Failed' ||
        status === 'FAILED' ||
        status === 'FORBIDDEN' ||
        status === 'Internal processing error' ||
        status === 'Duplicate Transaction'
      )
        return 'FAILED';

      return 'PENDING';

    default:
      return 'PENDING';
  }
};

export const sanitizeRazorpayDetails = (response) => {
  return {
    Bank: response.bank || undefined,
    Contact: response.contact || undefined,
    Currency: response.currency || undefined,
    Description: response.description || undefined,
    Fee: response.fee ?? undefined,
    'Payment Method': response.method || undefined,
    'Payment Status': response.status || undefined,
    Tax: response.tax ?? undefined,
    UPI: response.vpa || undefined,
    Wallet: response.wallet || undefined,
  };
};

export const sanitizePhonepeDetails = (response) => {
  return {
    Description: response.message || undefined,
    Fee: response.data?.feesContext?.amount ?? undefined,
    'Payment Method': response.data?.paymentInstrument?.type || undefined,
    'Payment Status': response.data?.responseCode || undefined,
  };
};

export const sanitizeUniqpayDetails = (response) => {
  return {
    Contact:
      response.transactionDetails?.beneficiaryInformation?.phone || undefined,
    Bank:
      response.transactionDetails?.beneficiaryAccountInformation
        ?.accountNumber || undefined,
    Fee: response.data?.charges?.totalCharges ?? undefined,
    'Payment Method': response.transactionDetails?.transferMode || undefined,
    Tax: response.data?.charges?.gstCharges ?? undefined,
  };
};

export const sanitizeTransactionDetails = (
  gatewayName: GatewayName,
  response: any,
) => {
  if (!response || !gatewayName) return null;

  if (gatewayName === GatewayName.RAZORPAY)
    return sanitizeRazorpayDetails(response);

  if (gatewayName === GatewayName.PHONEPE)
    return sanitizePhonepeDetails(response);

  if (gatewayName === GatewayName.UNIQPAY)
    return sanitizeUniqpayDetails(response);
};
