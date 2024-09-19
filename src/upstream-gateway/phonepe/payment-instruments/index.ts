export const paymentInstruments = (paymentMethod) => {
  switch (paymentMethod) {
    case 'PAY_PAGE':
      return {
        type: 'PAY_PAGE',
      };

    case 'UPI_QR':
      return {
        type: 'UPI_QR',
      };

    case 'UPI_COLLECT':
      return {
        type: 'UPI_COLLECT',
        vpa: 'test-vpa@ybl',
      };

    case 'UPI_INTENT_PHONEPAY':
      return {
        type: 'UPI_INTENT',
        targetApp: 'com.phonepe.app',
      };

    case 'UPI_INTENT_GOOGLEPAY':
      return {
        type: 'UPI_INTENT',
        targetApp: 'com.googlepay.app',
      };

    case 'NET_BANKING':
      return {
        type: paymentMethod,
        bankId: 'HDFC',
      };

    case 'CARD':
      return {
        type: 'CARD',
        authMode: '3DS',
        saveCard: false,
        cardDetails: {
          encryptedCardNumber: '<encrypted_card_number>',
          encryptionKeyId: 10,
          cardHolderName: 'Carlos Sainz',
          expiry: {
            month: '06',
            year: '2025',
          },
          encryptedCvv: '<encrypted_cvv_number>',
          billingAddress: {
            line1: 'Unit No.001, Ground Floor, Boston House',
            line2: 'Suren Road, Andheri(East)',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400093',
            country: 'India',
          },
        },
      };
  }
};
