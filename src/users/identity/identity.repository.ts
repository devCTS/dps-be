import { DataSource, EntityRepository, Repository } from 'typeorm';
import { Identity } from './entities/identity.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class IdentityRepository {
  constructor(
    @InjectRepository(Identity)
    private readonly repository: Repository<Identity>,
  ) {}

  async findByEmail(email: string): Promise<Identity | null> {
    return await this.repository.findOne({ where: { email } });
  }

  async createNewUser(data: Partial<Identity>): Promise<Identity> {
    const identity = this.repository.create(data);
    return await this.repository.save(identity);
  }

  async updateUser(id: string, data: Partial<Identity>) {
    await this.repository.update({ id }, data);

    const identity = await this.repository.findOne({
      where: { id },
    });
    return identity;
  }

  async getUser(id: string) {
    return await this.repository.findOne({
      where: { id },
      relations: ['admin'],
    });
  }
}
