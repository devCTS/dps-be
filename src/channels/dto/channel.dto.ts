import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString, Matches } from 'class-validator';

export class ChannelDetailsDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'Tag can only contain letters, numbers, and hyphens',
  })
  tag: string;

  @IsBoolean({ message: 'Value must be boolean' })
  incoming_status: boolean;

  @IsBoolean({ message: 'Value must be boolean' })
  outgoing_status: boolean;
}
