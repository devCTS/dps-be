import { Injectable } from '@nestjs/common';
import { CreateSubMerchantDto } from './dto/create-sub-merchant.dto';
import { UpdateSubMerchantDto } from './dto/update-sub-merchant.dto';

@Injectable()
export class SubMerchantService {
  create(createSubMerchantDto: CreateSubMerchantDto) {
    return 'This action adds a new subMerchant';
  }

  findAll() {
    return `This action returns all subMerchant`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subMerchant`;
  }

  update(id: number, updateSubMerchantDto: UpdateSubMerchantDto) {
    return `This action updates a #${id} subMerchant`;
  }

  remove(id: number) {
    return `This action removes a #${id} subMerchant`;
  }
}
