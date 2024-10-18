export const adminPayinOrders = [
  {
    id: 101,
    systemOrderId: 'QWEFC1234565432',
    merchantOrderId: 'MER3o49u3u9433u4',
    amount: 200,
    status: 'complete',
    channel: 'Netbanking',
    createdAt: new Date(),
    updatedAt: new Date(),
    callbackStatus: 'success',
    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },
    merchant: {
      id: 1,
      name: 'Ravi Dubey',
    },
    payinMadeOn: 'member',
    member: {
      id: 2,
      name: 'Kanishk Priyadarshi',
    },
    gatewayName: null,
    transactionDetails: {
      transactionId: '848484575775784',
      receipt:
        'https://unsplash.com/photos/black-flat-screen-computer-monitor-cFFEeHNZEqw',
      member: {
        'Upi Id': '9149965887@2912',
        'Mobile Number': '9149965887',
      },
      gateway: null,
    },

    balancesAndProfit: [
      {
        role: 'merchant',
        name: 'Ravi Dubey',
        serviceRate: 2,
        serviceFee: 23,
        balanceEarned: 192,
        balanceBefore: 20000,
        balanceAfter: 20022,
      },

      {
        role: 'member',
        name: 'Kanishk Priyadarshi',
        commissionRate: 2,
        commissionAmount: 23,
        quotaDeducted: 2,
        quotaBefore: 20000,
        quotaAfter: 20022,
      },

      {
        role: 'agent',
        name: 'Rohit BhattaCharya',
        commissionRate: 2,
        commissionAmount: 23,
        balanceBefore: 20000,
        balanceAfter: 20022,
        isMember: false,
        isAgentOf: 'Ravi Dubey',
      },

      {
        role: 'agent',
        name: 'Zakir Hassan',
        commissionRate: 2,
        commissionAmount: 23,
        balanceBefore: 20000,
        balanceAfter: 20022,
        isMember: false,
        isAgentOf: 'Rohit BhattaCharya',
      },

      {
        role: 'agent',
        name: 'Sneha Raina',
        commissionRate: 2,
        commissionAmount: 23,
        balanceBefore: 20000,
        balanceAfter: 20022,
        isMember: true,
        isAgentOf: 'Kanishk Priyadarshi',
      },

      {
        role: 'agent',
        name: 'Ripan Chaudhary',
        commissionRate: 2,
        commissionAmount: 23,
        balanceBefore: 20000,
        balanceAfter: 20022,
        isMember: true,
        isAgentOf: 'Sneha Raina',
      },

      {
        role: 'system',
        profit: 2,
        balanceBefore: 20000,
        balanceAfter: 20022,
      },
    ],
  },

  {
    id: 102,
    systemOrderId: 'QWEFC1234565432',
    merchantOrderId: 'MER3o49u3u9433u4',
    amount: 200,
    status: 'complete',
    channel: 'UPI',
    createdAt: new Date(),
    updatedAt: new Date(),
    callbackStatus: 'pending',
    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },
    merchant: {
      id: 1,
      name: 'Ravi Dubey',
    },
    payinMadeOn: 'gateway',
    member: null,
    gatewayName: 'Razorpay',
    transactionDetails: {
      transactionId: '848484575775784',
      receipt:
        'https://unsplash.com/photos/black-flat-screen-computer-monitor-cFFEeHNZEqw',
      member: null,
      gateway: {
        'Upi Id': '9149965887@2912',
        'Mobile Number': '9149965887',
      },
    },

    balancesAndProfit: [
      {
        role: 'merchant',
        name: 'Ravi Dubey',
        serviceRate: 2,
        serviceFee: 23,
        balanceEarned: 192,
        balanceBefore: 20000,
        balanceAfter: 20022,
      },

      {
        role: 'agent',
        name: 'Rohit BhattaCharya',
        commissionRate: 2,
        commissionAmount: 23,
        balanceBefore: 20000,
        balanceAfter: 20022,
        isMember: false,
        isAgentOf: 'Ravi Dubey',
      },

      {
        role: 'agent',
        name: 'Zakir Hassan',
        commissionRate: 2,
        commissionAmount: 23,
        balanceBefore: 20000,
        balanceAfter: 20022,
        isMember: false,
        isAgentOf: 'Rohit BhattaCharya',
      },

      {
        role: 'gateway',
        name: 'Razorpay',
        upstreamFee: 2,
        upstreamRate: 4,
      },

      {
        role: 'system',
        profit: 2,
        balanceBefore: 20000,
        balanceAfter: 20022,
      },
    ],
  },

  {
    id: 103,
    systemOrderId: 'QWEFC1234565432',
    merchantOrderId: 'MER3o49u3u9433u4',
    amount: 200,
    status: 'failed',
    channel: 'Netbanking',
    createdAt: new Date(),
    updatedAt: new Date(),
    callbackStatus: 'success',
    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },
    merchant: {
      id: 1,
      name: 'Ravi Dubey',
    },
    payinMadeOn: 'member',
    member: {
      id: 2,
      name: 'Kanishk Priyadarshi',
    },
    gatewayName: null,
    transactionDetails: {
      transactionId: '848484575775784',
      receipt:
        'https://unsplash.com/photos/black-flat-screen-computer-monitor-cFFEeHNZEqw',
      member: {
        'Upi Id': '9149965887@2912',
        'Mobile Number': '9149965887',
      },
      gateway: null,
    },

    balancesAndProfit: null,
  },

  {
    id: 104,
    systemOrderId: 'QWEFC1234565432',
    merchantOrderId: 'MER3o49u3u9433u4',
    amount: 200,
    status: 'failed',
    channel: 'UPI',
    createdAt: new Date(),
    updatedAt: new Date(),
    callbackStatus: 'pending',
    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },
    merchant: {
      id: 1,
      name: 'Ravi Dubey',
    },
    payinMadeOn: 'gateway',
    member: null,
    gatewayName: 'Razorpay',
    transactionDetails: {
      transactionId: '848484575775784',
      receipt:
        'https://unsplash.com/photos/black-flat-screen-computer-monitor-cFFEeHNZEqw',
      member: null,
      gateway: {
        'Upi Id': '9149965887@2912',
        'Mobile Number': '9149965887',
      },
    },

    balancesAndProfit: null,
  },

  {
    id: 105,
    systemOrderId: 'QWEFC1234565432',
    merchantOrderId: 'MER3o49u3u9433u4',
    amount: 200,
    status: 'submitted',
    channel: 'Netbanking',
    createdAt: new Date(),
    updatedAt: new Date(),
    callbackStatus: 'success',
    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },
    merchant: {
      id: 1,
      name: 'Ravi Dubey',
    },
    payinMadeOn: 'member',
    member: {
      id: 2,
      name: 'Kanishk Priyadarshi',
    },
    gatewayName: null,
    transactionDetails: {
      transactionId: '848484575775784',
      receipt:
        'https://unsplash.com/photos/black-flat-screen-computer-monitor-cFFEeHNZEqw',
      member: {
        'Upi Id': '9149965887@2912',
        'Mobile Number': '9149965887',
      },
      gateway: null,
    },

    balancesAndProfit: [
      {
        role: 'merchant',
        name: 'Ravi Dubey',
        serviceRate: 2,
        serviceFee: 23,
        balanceEarned: 192,
        balanceBefore: 20000,
        balanceAfter: 20022,
      },

      {
        role: 'member',
        name: 'Kanishk Priyadarshi',
        commissionRate: 2,
        commissionAmount: 23,
        quotaDeducted: 2,
        quotaBefore: 20000,
        quotaAfter: 20022,
      },

      {
        role: 'agent',
        name: 'Rohit BhattaCharya',
        commissionRate: 2,
        commissionAmount: 23,
        balanceBefore: 20000,
        balanceAfter: 20022,
        isMember: false,
        isAgentOf: 'Ravi Dubey',
      },

      {
        role: 'agent',
        name: 'Zakir Hassan',
        commissionRate: 2,
        commissionAmount: 23,
        balanceBefore: 20000,
        balanceAfter: 20022,
        isMember: false,
        isAgentOf: 'Rohit BhattaCharya',
      },

      {
        role: 'agent',
        name: 'Sneha Raina',
        commissionRate: 2,
        commissionAmount: 23,
        balanceBefore: 20000,
        balanceAfter: 20022,
        isMember: true,
        isAgentOf: 'Kanishk Priyadarshi',
      },

      {
        role: 'agent',
        name: 'Ripan Chaudhary',
        commissionRate: 2,
        commissionAmount: 23,
        balanceBefore: 20000,
        balanceAfter: 20022,
        isMember: true,
        isAgentOf: 'Sneha Raina',
      },

      {
        role: 'system',
        profit: 2,
        balanceBefore: 20000,
        balanceAfter: 20022,
      },
    ],
  },

  {
    id: 106,
    systemOrderId: 'QWEFC1234565432',
    merchantOrderId: 'MER3o49u3u9433u4',
    amount: 200,
    status: 'submitted',
    channel: 'UPI',
    createdAt: new Date(),
    updatedAt: new Date(),
    callbackStatus: 'pending',
    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },
    merchant: {
      id: 1,
      name: 'Ravi Dubey',
    },
    payinMadeOn: 'gateway',
    member: null,
    gatewayName: 'Razorpay',
    transactionDetails: {
      transactionId: '848484575775784',
      receipt:
        'https://unsplash.com/photos/black-flat-screen-computer-monitor-cFFEeHNZEqw',
      member: null,
      gateway: {
        'Upi Id': '9149965887@2912',
        'Mobile Number': '9149965887',
      },
    },

    balancesAndProfit: [
      {
        role: 'merchant',
        name: 'Ravi Dubey',
        serviceRate: 2,
        serviceFee: 23,
        balanceEarned: 192,
        balanceBefore: 20000,
        balanceAfter: 20022,
      },

      {
        role: 'agent',
        name: 'Rohit BhattaCharya',
        commissionRate: 2,
        commissionAmount: 23,
        balanceBefore: 20000,
        balanceAfter: 20022,
        isMember: false,
        isAgentOf: 'Ravi Dubey',
      },

      {
        role: 'agent',
        name: 'Zakir Hassan',
        commissionRate: 2,
        commissionAmount: 23,
        balanceBefore: 20000,
        balanceAfter: 20022,
        isMember: false,
        isAgentOf: 'Rohit BhattaCharya',
      },

      {
        role: 'gateway',
        name: 'Razorpay',
        upstreamFee: 2,
        upstreamRate: 4,
      },

      {
        role: 'system',
        profit: 2,
        balanceBefore: 20000,
        balanceAfter: 20022,
      },
    ],
  },

  {
    id: 107,
    systemOrderId: 'QWEFC1234565432',
    merchantOrderId: 'MER3o49u3u9433u4',
    amount: 200,
    status: 'assigned',
    channel: 'Netbanking',
    createdAt: new Date(),
    updatedAt: new Date(),
    callbackStatus: 'pending',
    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },
    merchant: {
      id: 1,
      name: 'Ravi Dubey',
    },
    payinMadeOn: 'member',
    member: {
      id: 2,
      name: 'Kanishk Priyadarshi',
    },
    gatewayName: null,
    transactionDetails: null,

    balancesAndProfit: [
      {
        role: 'merchant',
        name: 'Ravi Dubey',
        serviceRate: 2,
        serviceFee: 23,
        balanceEarned: 192,
        balanceBefore: 20000,
        balanceAfter: 20022,
      },

      {
        role: 'member',
        name: 'Kanishk Priyadarshi',
        commissionRate: 2,
        commissionAmount: 23,
        quotaDeducted: 2,
        quotaBefore: 20000,
        quotaAfter: 20022,
      },

      {
        role: 'agent',
        name: 'Rohit BhattaCharya',
        commissionRate: 2,
        commissionAmount: 23,
        balanceBefore: 20000,
        balanceAfter: 20022,
        isMember: false,
        isAgentOf: 'Ravi Dubey',
      },

      {
        role: 'agent',
        name: 'Zakir Hassan',
        commissionRate: 2,
        commissionAmount: 23,
        balanceBefore: 20000,
        balanceAfter: 20022,
        isMember: false,
        isAgentOf: 'Rohit BhattaCharya',
      },

      {
        role: 'agent',
        name: 'Sneha Raina',
        commissionRate: 2,
        commissionAmount: 23,
        balanceBefore: 20000,
        balanceAfter: 20022,
        isMember: true,
        isAgentOf: 'Kanishk Priyadarshi',
      },

      {
        role: 'agent',
        name: 'Ripan Chaudhary',
        commissionRate: 2,
        commissionAmount: 23,
        balanceBefore: 20000,
        balanceAfter: 20022,
        isMember: true,
        isAgentOf: 'Sneha Raina',
      },

      {
        role: 'system',
        profit: 2,
        balanceBefore: 20000,
        balanceAfter: 20022,
      },
    ],
  },

  {
    id: 108,
    systemOrderId: 'QWEFC1234565432',
    merchantOrderId: 'MER3o49u3u9433u4',
    amount: 200,
    status: 'assigned',
    channel: 'UPI',
    createdAt: new Date(),
    updatedAt: new Date(),
    callbackStatus: 'pending',
    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },
    merchant: {
      id: 1,
      name: 'Ravi Dubey',
    },
    payinMadeOn: 'gateway',
    member: null,
    gatewayName: 'Razorpay',
    transactionDetails: null,
    balancesAndProfit: [
      {
        role: 'merchant',
        name: 'Ravi Dubey',
        serviceRate: 2,
        serviceFee: 23,
        balanceEarned: 192,
        balanceBefore: 20000,
        balanceAfter: 20022,
      },

      {
        role: 'agent',
        name: 'Rohit BhattaCharya',
        commissionRate: 2,
        commissionAmount: 23,
        balanceBefore: 20000,
        balanceAfter: 20022,
        isMember: false,
        isAgentOf: 'Ravi Dubey',
      },

      {
        role: 'agent',
        name: 'Zakir Hassan',
        commissionRate: 2,
        commissionAmount: 23,
        balanceBefore: 20000,
        balanceAfter: 20022,
        isMember: false,
        isAgentOf: 'Rohit BhattaCharya',
      },

      {
        role: 'gateway',
        name: 'Razorpay',
        upstreamFee: 2,
        upstreamRate: 4,
      },

      {
        role: 'system',
        profit: 2,
        balanceBefore: 20000,
        balanceAfter: 20022,
      },
    ],
  },

  {
    id: 109,
    systemOrderId: 'QWEFC1234565432',
    merchantOrderId: 'MER3o49u3u9433u4',
    amount: 200,
    status: 'initiated',
    channel: 'Netbanking',
    createdAt: new Date(),
    updatedAt: new Date(),
    callbackStatus: 'pending',
    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },
    merchant: {
      id: 1,
      name: 'Ravi Dubey',
    },
    payinMadeOn: null,
    member: null,
    gatewayName: null,
    transactionDetails: null,

    balancesAndProfit: [
      {
        role: 'merchant',
        name: 'Ravi Dubey',
        serviceRate: 2,
        serviceFee: 23,
        balanceEarned: 192,
        balanceBefore: 20000,
        balanceAfter: 20022,
      },

      {
        role: 'agent',
        name: 'Rohit BhattaCharya',
        commissionRate: 2,
        commissionAmount: 23,
        balanceBefore: 20000,
        balanceAfter: 20022,
        isMember: false,
        isAgentOf: 'Ravi Dubey',
      },

      {
        role: 'agent',
        name: 'Zakir Hassan',
        commissionRate: 2,
        commissionAmount: 23,
        balanceBefore: 20000,
        balanceAfter: 20022,
        isMember: false,
        isAgentOf: 'Rohit BhattaCharya',
      },

      {
        role: 'system',
        profit: 2,
        balanceBefore: 20000,
        balanceAfter: 20022,
      },
    ],
  },
];

export const memberPayinOrders = [
  {
    id: 3,
    systemOrderId: 'QWEFC1234565432',

    amount: 200,
    status: 'complete',
    channel: 'Netbanking',
    createdAt: new Date(),
    updatedAt: new Date(),

    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },

    transactionDetails: {
      transactionId: '848484575775784',
      receipt:
        'https://unsplash.com/photos/black-flat-screen-computer-monitor-cFFEeHNZEqw',
      member: {
        'Upi Id': '9149965887@2912',
        'Mobile Number': '9149965887',
      },
    },

    quotaDetails: {
      commissionRate: 2,
      commissionAmount: 192,
      quotaDeducted: 230,
      withHeldAmount: 230,
      withHeldRate: 1,
    },
  },

  {
    id: 4,
    systemOrderId: 'QWEFC1234565432',
    amount: 200,
    status: 'failed',
    channel: 'Netbanking',
    createdAt: new Date(),
    updatedAt: new Date(),

    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },

    transactionDetails: {
      transactionId: '848484575775784',
      receipt:
        'https://unsplash.com/photos/black-flat-screen-computer-monitor-cFFEeHNZEqw',
      member: {
        'Upi Id': '9149965887@2912',
        'Mobile Number': '9149965887',
      },
    },

    quotaDetails: {
      commissionRate: 2,
      commissionAmount: 192,
      quotaDeducted: 230,
      withHeldAmount: 230,
      withHeldRate: 1,
    },
  },

  {
    id: 2,
    systemOrderId: 'QWEFC1234565432',
    amount: 200,
    status: 'submitted',
    channel: 'Netbanking',
    createdAt: new Date(),
    updatedAt: new Date(),

    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },

    transactionDetails: {
      transactionId: '848484575775784',
      receipt:
        'https://unsplash.com/photos/black-flat-screen-computer-monitor-cFFEeHNZEqw',
      member: {
        'Upi Id': '9149965887@2912',
        'Mobile Number': '9149965887',
      },
    },

    quotaDetails: {
      commissionRate: 2,
      commissionAmount: 192,
      quotaDeducted: 230,
      withHeldAmount: 230,
      withHeldRate: 1,
    },
  },

  {
    id: 1,
    systemOrderId: 'QWEFC1234565432',
    amount: 200,
    status: 'assigned',
    channel: 'Netbanking',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },

    transactionDetails: null,

    quotaDetails: {
      commissionRate: 2,
      commissionAmount: 192,
      quotaDeducted: 230,
      withHeldAmount: 230,
      withHeldRate: 1,
    },
  },
];

export const merchantPayinOrders = [
  {
    id: 6,
    systemOrderId: 'QWEFC1234565432',
    merchantOrderId: 'MER3o49u3u9433u4',
    amount: 200,
    status: 'complete',
    channel: 'Netbanking',
    createdAt: new Date(),
    updatedAt: new Date(),
    callbackStatus: 'success',
    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },
    merchant: {
      id: 1,
      name: 'Ravi Dubey',
    },
    payinMadeOn: 'member',
    member: {
      id: 2,
      name: 'Kanishk Priyadarshi',
    },
    gatewayName: null,
    transactionDetails: {
      transactionId: '848484575775784',
      receipt:
        'https://unsplash.com/photos/black-flat-screen-computer-monitor-cFFEeHNZEqw',
      member: {
        'Upi Id': '9149965887@2912',
        'Mobile Number': '9149965887',
      },
      gateway: null,
    },

    balanceDetails: {
      serviceRate: 2,
      serviceFee: 23,
      balanceEarned: 192,
    },
  },

  {
    id: 7,
    systemOrderId: 'QWEFC1234565432',
    merchantOrderId: 'MER3o49u3u9433u4',
    amount: 200,
    status: 'complete',
    channel: 'UPI',
    createdAt: new Date(),
    updatedAt: new Date(),
    callbackStatus: 'pending',
    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },
    merchant: {
      id: 1,
      name: 'Ravi Dubey',
    },
    payinMadeOn: 'gateway',
    member: null,
    gatewayName: 'Razorpay',
    transactionDetails: {
      transactionId: '848484575775784',
      receipt:
        'https://unsplash.com/photos/black-flat-screen-computer-monitor-cFFEeHNZEqw',
      member: null,
      gateway: {
        'Upi Id': '9149965887@2912',
        'Mobile Number': '9149965887',
      },
    },

    balanceDetails: {
      serviceRate: 2,
      serviceFee: 23,
      balanceEarned: 192,
    },
  },

  {
    id: 8,
    systemOrderId: 'QWEFC1234565432',
    merchantOrderId: 'MER3o49u3u9433u4',
    amount: 200,
    status: 'failed',
    channel: 'Netbanking',
    createdAt: new Date(),
    updatedAt: new Date(),
    callbackStatus: 'success',
    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },
    merchant: {
      id: 1,
      name: 'Ravi Dubey',
    },
    payinMadeOn: 'member',
    member: {
      id: 2,
      name: 'Kanishk Priyadarshi',
    },
    gatewayName: null,
    transactionDetails: {
      transactionId: '848484575775784',
      receipt:
        'https://unsplash.com/photos/black-flat-screen-computer-monitor-cFFEeHNZEqw',
      member: {
        'Upi Id': '9149965887@2912',
        'Mobile Number': '9149965887',
      },
      gateway: null,
    },

    balanceDetails: {
      serviceRate: 2,
      serviceFee: 23,
      balanceEarned: 192,
    },
  },

  {
    id: 9,
    systemOrderId: 'QWEFC1234565432',
    merchantOrderId: 'MER3o49u3u9433u4',
    amount: 200,
    status: 'failed',
    channel: 'UPI',
    createdAt: new Date(),
    updatedAt: new Date(),
    callbackStatus: 'pending',
    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },
    merchant: {
      id: 1,
      name: 'Ravi Dubey',
    },
    payinMadeOn: 'gateway',
    member: null,
    gatewayName: 'Razorpay',
    transactionDetails: {
      transactionId: '848484575775784',
      receipt:
        'https://unsplash.com/photos/black-flat-screen-computer-monitor-cFFEeHNZEqw',
      member: null,
      gateway: {
        'Upi Id': '9149965887@2912',
        'Mobile Number': '9149965887',
      },
    },

    balanceDetails: {
      serviceRate: 2,
      serviceFee: 23,
      balanceEarned: 192,
    },
  },

  {
    id: 4,
    systemOrderId: 'QWEFC1234565432',
    merchantOrderId: 'MER3o49u3u9433u4',
    amount: 200,
    status: 'submitted',
    channel: 'Netbanking',
    createdAt: new Date(),
    updatedAt: new Date(),
    callbackStatus: 'success',
    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },
    merchant: {
      id: 1,
      name: 'Ravi Dubey',
    },
    payinMadeOn: 'member',
    member: {
      id: 2,
      name: 'Kanishk Priyadarshi',
    },
    gatewayName: null,
    transactionDetails: {
      transactionId: '848484575775784',
      receipt:
        'https://unsplash.com/photos/black-flat-screen-computer-monitor-cFFEeHNZEqw',
      member: {
        'Upi Id': '9149965887@2912',
        'Mobile Number': '9149965887',
      },
      gateway: null,
    },

    balanceDetails: {
      serviceRate: 2,
      serviceFee: 23,
      balanceEarned: 192,
    },
  },

  {
    id: 5,
    systemOrderId: 'QWEFC1234565432',
    merchantOrderId: 'MER3o49u3u9433u4',
    amount: 200,
    status: 'submitted',
    channel: 'UPI',
    createdAt: new Date(),
    updatedAt: new Date(),
    callbackStatus: 'pending',
    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },
    merchant: {
      id: 1,
      name: 'Ravi Dubey',
    },
    payinMadeOn: 'gateway',
    member: null,
    gatewayName: 'Razorpay',
    transactionDetails: {
      transactionId: '848484575775784',
      receipt:
        'https://unsplash.com/photos/black-flat-screen-computer-monitor-cFFEeHNZEqw',
      member: null,
      gateway: {
        'Upi Id': '9149965887@2912',
        'Mobile Number': '9149965887',
      },
    },

    balanceDetails: {
      serviceRate: 2,
      serviceFee: 23,
      balanceEarned: 192,
    },
  },

  {
    id: 2,
    systemOrderId: 'QWEFC1234565432',
    merchantOrderId: 'MER3o49u3u9433u4',
    amount: 200,
    status: 'assigned',
    channel: 'Netbanking',
    createdAt: new Date(),
    updatedAt: new Date(),
    callbackStatus: 'pending',
    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },
    merchant: {
      id: 1,
      name: 'Ravi Dubey',
    },
    payinMadeOn: 'member',
    member: {
      id: 2,
      name: 'Kanishk Priyadarshi',
    },
    gatewayName: null,
    transactionDetails: null,

    balanceDetails: {
      serviceRate: 2,
      serviceFee: 23,
      balanceEarned: 192,
    },
  },

  {
    id: 3,
    systemOrderId: 'QWEFC1234565432',
    merchantOrderId: 'MER3o49u3u9433u4',
    amount: 200,
    status: 'assigned',
    channel: 'UPI',
    createdAt: new Date(),
    updatedAt: new Date(),
    callbackStatus: 'pending',
    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },
    merchant: {
      id: 1,
      name: 'Ravi Dubey',
    },
    payinMadeOn: 'gateway',
    member: null,
    gatewayName: 'Razorpay',
    transactionDetails: null,
    balanceDetails: {
      serviceRate: 2,
      serviceFee: 23,
      balanceEarned: 192,
    },
  },

  {
    id: 1,
    systemOrderId: 'QWEFC1234565432',
    merchantOrderId: 'MER3o49u3u9433u4',
    amount: 200,
    status: 'initiated',
    channel: 'Netbanking',
    createdAt: new Date(),
    updatedAt: new Date(),
    callbackStatus: 'pending',
    user: {
      name: 'Aryan Mahajan',
      mobile: '9149965887',
      email: 'aryan.mahajan893@gmail.com',
    },
    merchant: {
      id: 1,
      name: 'Ravi Dubey',
    },
    payinMadeOn: null,
    member: null,
    gatewayName: null,
    transactionDetails: null,

    balanceDetails: {
      serviceRate: 2,
      serviceFee: 23,
      balanceEarned: 192,
    },
  },
];
