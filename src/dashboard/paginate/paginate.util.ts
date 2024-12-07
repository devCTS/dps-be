import { BadRequestException } from '@nestjs/common';
import { AdminDetailsDto } from 'src/users/admin/dto/response/admin-details.dto';
import { AgentDetailsDto } from 'src/users/agent/dto/response/agent-details.dto';
import { MemberDetailsDto } from 'src/users/member/dto/response/member-details.dto';
import { MerchantDetailsDto } from 'src/users/merchant/dto/response/merchant-details.dto';
import { SubMerchantDetailsDto } from 'src/users/sub-merchant/dto/response/sub-merchant-details.dto';
import { Users } from 'src/utils/enums/users';

// Helper function to convert DD/MM/YYYY to a UTC Date object
export const parseStartDate = (dateString: string) => {
  const [day, month, year] = dateString.split('/');
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`); // Start of the day in UTC
  if (isNaN(date.getTime())) {
    throw new BadRequestException(
      'Invalid startDate format. Expected DD/MM/YYYY.',
    );
  }
  return date.toISOString();
};

export const parseEndDate = (dateString: string) => {
  const [day, month, year] = dateString.split('/');
  const date = new Date(`${year}-${month}-${day}T23:59:59Z`); // End of the day in UTC
  if (isNaN(date.getTime())) {
    throw new BadRequestException(
      'Invalid endDate format. Expected DD/MM/YYYY.',
    );
  }
  return date.toISOString();
};

export const getUserTable = (userType: Users) => {
  switch (userType) {
    case Users.ADMIN:
      return 'admin';

    case Users.AGENT:
      return 'agent';

    case Users.MEMBER:
      return 'member';

    case Users.MERCHANT:
      return 'merchant';

    case Users.SUB_MERCHANT:
      return 'sub_merchant';
  }
};

export const getUserResponseDto = (userType: Users) => {
  switch (userType) {
    case Users.ADMIN:
      return AdminDetailsDto;

    case Users.AGENT:
      return AgentDetailsDto;

    case Users.MEMBER:
      return MemberDetailsDto;

    case Users.MERCHANT:
      return MerchantDetailsDto;

    case Users.SUB_MERCHANT:
      return SubMerchantDetailsDto;
  }
};
