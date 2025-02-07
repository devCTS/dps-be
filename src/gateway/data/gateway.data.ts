export const loadPhonepeData = () => {
  return {
    incoming: true,
    outgoing: true,
    merchant_id: 'dummy_secret_key',
    salt_key: 'dummy_secret_key',
    salt_index: 'dummy_secret_key',
    sandbox_merchant_id: 'dummy_secret_key',
    sandbox_salt_key: 'dummy_secret_key',
    sandbox_salt_index: 'dummy_secret_key',
  };
};

export const loadRazorpayData = () => {
  return {
    incoming: true,
    outgoing: true,
    key_secret: 'dummy_secret_key',
    key_id: 'dummy_secret_key',
    sandbox_key_id: 'dummy_secret_key',
    sandbox_key_secret: 'dummy_secret_key',
    account_number: '1234 1234 1234 1234',
    sandbox_account_number: '1234 1234 1234',
  };
};

export const loadUniqpayData = () => {
  return {
    incoming: false,
    outgoing: true,
    uniqpay_id: 'dummy_secret_key',
    client_id: 'dummy_secret_key',
    client_secret: 'dummy_secret_key',
  };
};
