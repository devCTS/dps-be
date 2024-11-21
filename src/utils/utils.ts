import { HttpStatus } from '@nestjs/common';
import * as bycrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AlertType, NotificationType } from './enum/enum';

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
  const truncatedAmount = Math.round(amount * 100) / 100;
  return makeAbsolute ? Math.abs(truncatedAmount) : truncatedAmount;
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

export const getTextForAlert = (type: AlertType) => {
  return `dummy text ${type}`;
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
