import { Channels } from 'src/utils/enums/channels';
import { CreateChannelSettingsDto } from '../dto/create-channel.dto';

export const getChannelData = (): CreateChannelSettingsDto[] => {
  return [
    {
      name: Channels.UPI,
      tagName: 'upi',
      incoming: true,
      outgoing: true,
    },
    {
      name: Channels.EWALLET,
      tagName: 'e_wallet',
      incoming: true,
      outgoing: true,
    },
    {
      name: Channels.NETBANKING,
      tagName: 'netbanking',
      incoming: true,
      outgoing: true,
    },
  ];
};
