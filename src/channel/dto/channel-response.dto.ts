import { Exclude, Expose } from 'class-transformer';
import { DateFormat } from 'src/utils/decorators/dateformat.decorator';
import { Rename } from 'src/utils/decorators/rename.decorator';
import {
  ChannelProfileFieldDto,
  ChannelProfileFieldResponseDto,
} from './channelProfileField.dto';

@Exclude()
export class ChannelResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  tag: string;

  @Expose()
  incomingStatus: boolean;

  @Expose()
  outgoingStatus: boolean;

  @Expose()
  logo: string;

  @Expose()
  @DateFormat()
  createdAt: Date;

  @Expose()
  @DateFormat()
  updatedAt: Date;

  @Expose()
  profileFields: ChannelProfileFieldResponseDto[];
}
