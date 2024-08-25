import { forwardRef, Module } from '@nestjs/common';
import { Identity } from 'src/identity/identity.entity';

@Module({
  imports: [forwardRef(() => Identity)],
})
export class AuthModule {}
