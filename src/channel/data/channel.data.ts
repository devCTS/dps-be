import { ChannelName } from 'src/utils/enum/enum';
import { CreateChannelConfigDto } from '../dto/create-channel-config.dto';

export const getChannelData = (): CreateChannelConfigDto[] => {
  return [
    {
      name: ChannelName.UPI,
      tag_name: 'upi',
      incoming: true,
      outgoing: true,
    },
    {
      name: ChannelName.E_WALLET,
      tag_name: 'e_wallet',
      incoming: true,
      outgoing: true,
    },
    {
      name: ChannelName.BANKING,
      tag_name: 'net_banking',
      incoming: true,
      outgoing: true,
    },
  ];
};
