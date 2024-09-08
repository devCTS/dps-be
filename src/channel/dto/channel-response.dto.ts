import { Exclude, Expose } from 'class-transformer';
import { DateFormat } from 'src/utils/decorators/dateformat.decorator';
import { Rename } from 'src/utils/decorators/rename.decorator';
import { ChannelProfileFieldDto } from './channelProfileField.dto';

@Exclude()
export class ChannelResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  tag: string;

  @Expose()
  @Rename('incoming_status')
  incomingStatus: boolean;

  @Expose()
  @Rename('outgoing_status')
  outgoingStatus: boolean;

  @Expose()
  logo: string;

  @Expose()
  @Rename('created_at')
  @DateFormat()
  createdAt: Date;

  @Expose()
  @Rename('updated_at')
  @DateFormat()
  updatedAt: Date;

  @Expose()
  profileFields: ChannelProfileFieldDto[];
}
