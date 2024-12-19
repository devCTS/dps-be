import { OrderType, UserTypeForTransactionUpdates } from 'src/utils/enum/enum';

interface argType {
  type: OrderType;
  userType: UserTypeForTransactionUpdates;
  userAmount: number;
  orderAmount: number;
  isAgentMember?: boolean;
  isSendingMember?: boolean;
}

const getUserFromUserType = (userType: UserTypeForTransactionUpdates) => {
  if (userType === UserTypeForTransactionUpdates.MERCHANT_BALANCE)
    return 'Merchant';

  if (userType === UserTypeForTransactionUpdates.MEMBER_QUOTA) return 'Member';

  if (userType === UserTypeForTransactionUpdates.AGENT_BALANCE) return 'Agent';

  if (userType === UserTypeForTransactionUpdates.SYSTEM_PROFIT) return 'System';
};

export function getDescription({
  type,
  userType,
  userAmount,
  orderAmount,
  isAgentMember,
  isSendingMember,
}: argType) {
  let text = '';

  switch (type) {
    case OrderType.PAYIN:
      if (userType === UserTypeForTransactionUpdates.MERCHANT_BALANCE)
        text = `Order Amount - ${orderAmount} | Income - ${orderAmount - userAmount}`;

      if (userType === UserTypeForTransactionUpdates.MEMBER_QUOTA)
        text = isAgentMember
          ? `Order Amount - ${orderAmount} | Agent Commission - ${userAmount} | Quota Credit - ${userAmount} `
          : `Order Amount - ${orderAmount} | Member Commission - ${userAmount} | Quota Debit - ${orderAmount - userAmount}`;

      if (userType === UserTypeForTransactionUpdates.AGENT_BALANCE)
        text = `Order Amount - ${orderAmount} | Agent Commission - ${userAmount}`;

      if (userType === UserTypeForTransactionUpdates.SYSTEM_PROFIT)
        text = `Net Profit - ${userAmount}`;
      break;

    case OrderType.PAYOUT:
      if (userType === UserTypeForTransactionUpdates.MERCHANT_BALANCE)
        text = `Order Amount - ${orderAmount} | Balance Debit - ${orderAmount + userAmount}`;

      if (userType === UserTypeForTransactionUpdates.MEMBER_QUOTA)
        text = isAgentMember
          ? `Order Amount - ${orderAmount} | Agent Commission - ${userAmount} | Quota Credit - ${userAmount}`
          : `Order Amount - ${orderAmount} | Member Commission - ${userAmount} | Quota Credit - ${orderAmount + userAmount}`;

      if (userType === UserTypeForTransactionUpdates.AGENT_BALANCE)
        text = `Order Amount - ${orderAmount} | Agent Commission - ${userAmount}`;

      if (userType === UserTypeForTransactionUpdates.SYSTEM_PROFIT)
        text = `Net Profit - ${userAmount}`;
      break;

    case OrderType.WITHDRAWAL:
      text = `Order Amount - ${orderAmount} | Service Charge - ${userAmount} | Balance Debit - ${orderAmount + userAmount}`;
      break;

    case OrderType.TOPUP:
      if (userType === UserTypeForTransactionUpdates.MEMBER_QUOTA)
        text = isAgentMember
          ? `Order Amount - ${orderAmount} | Agent Commission - ${userAmount} | Quota Credit - ${userAmount}`
          : `Order Amount - ${orderAmount} | Member Commission - ${userAmount} | Quota Credit - ${orderAmount + userAmount}`;

      if (userType === UserTypeForTransactionUpdates.SYSTEM_PROFIT)
        text = `Net Profit - ${userAmount}`;

      break;

    case OrderType.ADMIN_ADJUSTMENT:
      const user = getUserFromUserType(userType);

      const amount =
        userAmount > 0
          ? `Credit - ${userAmount}`
          : `Debit - ${Math.abs(userAmount)}`;

      if (user === 'Merchant') text = `Balance ${amount}`;

      if (user === 'Agent') text = `Balance ${amount}`;

      if (user === 'Member') text = `Quota ${amount}`;

      break;

    case OrderType.MEMBER_adjustment:
      text = !isSendingMember
        ? `Quota Credit - ${userAmount}`
        : `Quota Debit - ${userAmount}`;

      break;

    default:
      break;
  }

  return text;
}
