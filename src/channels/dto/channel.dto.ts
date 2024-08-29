import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { BooleanTransform } from 'src/custom-decorator/implicitConversion.decorator';

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

  @IsOptional()
  @IsBoolean({ message: 'Value must be boolean' })
  @BooleanTransform
  incoming_status: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Value must be boolean' })
  @BooleanTransform
  outgoing_status: boolean;
}

export class UpdateChannelDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'Tag can only contain letters, numbers, and hyphens',
  })
  tag: string;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean({ message: 'Value must be boolean' })
  @BooleanTransform
  incoming_status: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Value must be boolean' })
  @BooleanTransform
  outgoing_status: boolean;
}
