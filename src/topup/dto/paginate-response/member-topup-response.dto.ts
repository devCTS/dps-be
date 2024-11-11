import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class MemberAllTopupResponseDto {
  @Expose()
  id: number;

  @Expose()
  systemOrderId: string;

  @Expose()
  amount: string;

  @Expose()
  @Transform(({ value }) => value.toLowerCase())
  status: string;

  @Expose()
  channel: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
