import { Transform } from 'class-transformer';

export function TransformChannelList(type: 'Payin' | 'Payout') {
  return Transform(
    ({ obj }) => {
      const data = [];

      for (const iterator of obj.identity.payinPayoutChannels) {
        if (iterator.type === type) {
          data.push({
            channelId: iterator.channel.id,
            channelName: iterator.channel.name,
          });
        }
      }
      return data;
    },
    {
      toClassOnly: true,
    },
  );
}
