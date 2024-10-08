import { Transform } from 'class-transformer';

export function TransformChannelProfileFields() {
  return Transform(
    ({ obj }) => {
      if (!obj.identity || !obj.identity.channelProfileFilledFields) {
        return [];
      }

      return obj.identity.channelProfileFilledFields.reduce((acc, item) => {
        const channel = item.field.channel;
        const field = {
          label: item.field.label,
          fieldId: item.field.id,
          value: item.fieldValue,
        };

        // Find the channel in the accumulator
        let channelEntry = acc.find(
          (entry) => entry.channelName === channel.name,
        );

        if (!channelEntry) {
          // If channel does not exist in the accumulator, create a new entry
          channelEntry = {
            channelName: channel.name,
            fields: [],
          };
          acc.push(channelEntry);
        }

        // Add the field to the channel entry
        channelEntry.fields.push(field);

        return acc;
      }, []);
    },
    { toClassOnly: true },
  );
}
