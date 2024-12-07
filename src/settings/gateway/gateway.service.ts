import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GatewaySettings } from './entities/gateway.entity';
import { Repository } from 'typeorm';
import { Gateway } from 'src/utils/enums/gateways';
import { loadGatewayData } from './data/gateway.data';
import { JwtService } from 'src/integrations/jwt/jwt.service';

@Injectable()
export class GatewaySettingsService {
  constructor(
    @InjectRepository(GatewaySettings)
    private readonly repository: Repository<GatewaySettings>,
    private readonly jwtService: JwtService,
  ) {}

  async loadGateways() {
    const gatewaysAlreadyIn = await this.repository.find();

    if (gatewaysAlreadyIn?.length > 1)
      throw new ConflictException('Gateways already loaded');

    const gateways = loadGatewayData();

    for (const iterator of gateways) {
      const created = this.repository.create(iterator);
      await this.repository.save(created);
    }
  }

  async getAllGateways() {
    return await this.repository.find();
  }

  async getRazorPayChannelSettings() {
    return await this.repository.findOneBy({ name: Gateway.RAZORPAY });
  }

  async getPhonePeChannelSettings() {
    return await this.repository.findOneBy({ name: Gateway.PHONEPE });
  }

  async updateRazorPay(data: any) {
    await this.repository.update({ name: Gateway.RAZORPAY }, data);
  }

  async updatePhonePe(data: any) {
    await this.repository.update({ name: Gateway.PHONEPE }, data);
  }
}
