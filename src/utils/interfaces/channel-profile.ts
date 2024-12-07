export interface ChannelProfile {
  upi: {
    upiId: string;
    mobile: string;
    isBusinessUpi: boolean;
  } | null;
  netbanking: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
    beneficiaryName: string;
  } | null;
  eWallet: { app: string; mobile: string } | null;
}
