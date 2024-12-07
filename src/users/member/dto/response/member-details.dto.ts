import { Expose } from 'class-transformer';
import { IdentityBaseDto } from 'src/users/identity/dto/response/identity-base.dto';
import { AdminRoles } from 'src/utils/enums/users';

export class MemberDetailsDto extends IdentityBaseDto {}
