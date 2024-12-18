import { Module } from '@nestjs/common';
import { JwtModule } from './jwt/jwt.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [JwtModule, EmailModule]
})
export class ServicesModule {}
