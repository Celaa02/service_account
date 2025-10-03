import { Injectable } from '@nestjs/common';
import { DataSource, Repository, DeepPartial } from 'typeorm';
import { IAccountsRepository } from '../../../../domain/accounts/accounts.repository';
import { AccountOrmEntity } from '../entities/account.orm-entity';

@Injectable()
export class AccountsTypeormRepository implements IAccountsRepository {
  private repo: Repository<AccountOrmEntity>;
  constructor(private readonly ds: DataSource) {
    this.repo = ds.getRepository(AccountOrmEntity);
  }

  async create(input: {
    holderName: string;
    accountNumber: string;
    balance: number;
    ownerId: string;
  }) {
    const entity = this.repo.create({
      holderName: input.holderName,
      accountNumber: input.accountNumber,
      balance: input.balance, // ✅ number (transformer hace el resto)
      ownerId: input.ownerId,
    } as DeepPartial<AccountOrmEntity>);

    const saved = await this.repo.save(entity);
    return saved; // ✅ balance ya es number por el transformer
  }

  async findById(id: string) {
    const e = await this.repo.findOne({ where: { id } });
    return e ?? null; // ✅ no hace falta Number(...)
  }

  async findByAccountNumber(accountNumber: string) {
    const e = await this.repo.findOne({ where: { accountNumber } });
    return e ?? null;
  }

  async list() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }
}
