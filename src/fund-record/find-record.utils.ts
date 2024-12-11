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

  // TODO: Change texts, order amounts are fine
  switch (type) {
    case OrderType.PAYIN:
      if (userType === UserTypeForTransactionUpdates.MERCHANT_BALANCE)
        text = `Payin order - ${orderAmount} | Income - ${orderAmount - userAmount}`;

      if (userType === UserTypeForTransactionUpdates.MEMBER_QUOTA)
        text = isAgentMember
          ? `Payin order - ${orderAmount} | Quota increase - ${userAmount} | Agent commission`
          : `Payin order - ${orderAmount} | Quota deduct - ${orderAmount - userAmount} | Member commission - ${userAmount}`;

      if (userType === UserTypeForTransactionUpdates.AGENT_BALANCE)
        text = `Payin order - ${orderAmount} | Agent commission - ${userAmount}`;
      break;

    case OrderType.PAYOUT:
      if (userType === UserTypeForTransactionUpdates.MERCHANT_BALANCE)
        text = `Payout order - ${orderAmount} | Balance deduct - ${orderAmount + userAmount}`;

      if (userType === UserTypeForTransactionUpdates.MEMBER_QUOTA)
        text = isAgentMember
          ? `Payout order - ${orderAmount} | Quota increase - ${userAmount} | Agent commission`
          : `Payout order - ${orderAmount} | Quota increase - ${orderAmount + userAmount} | Member commission - ${userAmount}`;

      if (userType === UserTypeForTransactionUpdates.AGENT_BALANCE)
        text = `Payout order - ${orderAmount} | Balance - ${userAmount}`;
      break;

    case OrderType.WITHDRAWAL:
      if (userType === UserTypeForTransactionUpdates.MERCHANT_BALANCE)
        text = `Withdrawal order - ${orderAmount}`;

      if (userType === UserTypeForTransactionUpdates.AGENT_BALANCE)
        text = `Withdrawal order - ${orderAmount}`;
      break;

    case OrderType.TOPUP:
      if (userType === UserTypeForTransactionUpdates.MEMBER_QUOTA)
        text = isAgentMember
          ? `Topup order - ${orderAmount} | Quota increase - ${userAmount} | Agent commission`
          : `Topup order - ${orderAmount} | Quota increase - ${orderAmount + userAmount} | Member commission - ${userAmount}`;

      break;

    case OrderType.ADMIN_ADJUSTMENT:
      const user = getUserFromUserType(userType);

      const amount =
        userAmount > 0
          ? `increase ${userAmount}`
          : `decrease ${Math.abs(userAmount)}`;

      if (user === 'Merchant') text = `Merchant balance adjustment - ${amount}`;

      if (user === 'Agent') text = `Agent balance adjustment - ${amount}`;

      if (user === 'Member') text = `Member quota adjustment - ${amount}`;

      break;

    case OrderType.MEMBER_adjustment:
      const quota = !isSendingMember
        ? `increase ${userAmount}`
        : `decrease ${userAmount}`;

      if (isSendingMember) text = `Quota transfer - ${quota}`;
      else text = `Quota transfer - ${quota}`;

      break;

    default:
      break;
  }

  return text;
}
