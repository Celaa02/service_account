import { Injectable } from '@nestjs/common';
import { DataSource, Repository, DeepPartial } from 'typeorm';
import { TransactionOrmEntity } from '../entities/transaction.orm-entity';
import { AccountOrmEntity } from '../entities/account.orm-entity';
import { mapDbError } from '../../../../common/errors/db-error.mapper';
import { Transaction, TransactionType } from '../../../../domain/transactions/transaction.entity';
import { ITransactionsRepository } from '../../../../domain/transactions/transactions.repository';
import { DomainError } from '../../../../common/errors/domain-error';
import { ErrorCodes } from '../../../../common/errors/error-codes';

@Injectable()
export class TransactionsTypeormRepository implements ITransactionsRepository {
  private txRepo: Repository<TransactionOrmEntity>;
  private accRepo: Repository<AccountOrmEntity>;

  constructor(private readonly ds: DataSource) {
    this.txRepo = ds.getRepository(TransactionOrmEntity);
    this.accRepo = ds.getRepository(AccountOrmEntity);
  }

  private toDomain(row: TransactionOrmEntity): Transaction {
    const map = {
      DEPOSIT: TransactionType.DEPOSIT,
      WITHDRAWAL: TransactionType.WITHDRAWAL,
    } as const;
    return new Transaction(row.id, row.accountId, map[row.type], row.amount, row.createdAt);
  }
  private toDomainList(rows: TransactionOrmEntity[]) {
    return rows.map((r) => this.toDomain(r));
  }

  async create(input: {
    accountId: string;
    type: TransactionType;
    amount: number;
  }): Promise<Transaction> {
    try {
      return await this.ds.transaction(async (manager) => {
        const accRepo = manager.getRepository(AccountOrmEntity);
        const txRepo = manager.getRepository(TransactionOrmEntity);

        const account = await accRepo
          .createQueryBuilder('a')
          .where('a.id = :id', { id: input.accountId })
          .setLock('pessimistic_write')
          .getOne();

        if (!account) throw new DomainError(ErrorCodes.ACCOUNT_NOT_FOUND);

        if (!(input.amount > 0)) {
          throw new DomainError(ErrorCodes.INVALID_AMOUNT, 'Amount must be > 0');
        }

        const current = Number(account.balance);
        const delta = input.type === TransactionType.DEPOSIT ? input.amount : -input.amount;
        const next = current + delta;

        if (input.type === TransactionType.WITHDRAWAL && next < 0) {
          throw new DomainError(ErrorCodes.INSUFFICIENT_FUNDS);
        }

        account.balance = next;
        await accRepo.save(account);

        const ormType: 'DEPOSIT' | 'WITHDRAWAL' =
          input.type === TransactionType.DEPOSIT ? 'DEPOSIT' : 'WITHDRAWAL';

        const tx = txRepo.create({
          accountId: input.accountId,
          type: ormType,
          amount: input.amount,
        } as DeepPartial<TransactionOrmEntity>);

        const saved = await txRepo.save(tx);
        return this.toDomain(saved);
      });
    } catch (e) {
      return mapDbError(e);
    }
  }

  async findById(id: string) {
    const row = await this.txRepo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async listByAccount(accountId: string): Promise<Transaction[]> {
    const rows = await this.txRepo.find({ where: { accountId }, order: { createdAt: 'DESC' } });
    return this.toDomainList(rows);
  }

  async transfer(input: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
  }): Promise<{ debit: Transaction; credit: Transaction }> {
    try {
      return await this.ds.transaction(async (manager) => {
        const accRepo = manager.getRepository(AccountOrmEntity);
        const txRepo = manager.getRepository(TransactionOrmEntity);

        const [firstId, secondId] =
          input.fromAccountId < input.toAccountId
            ? [input.fromAccountId, input.toAccountId]
            : [input.toAccountId, input.fromAccountId];

        const first = await accRepo
          .createQueryBuilder('a')
          .where('a.id = :id', { id: firstId })
          .setLock('pessimistic_write')
          .getOne();
        const second = await accRepo
          .createQueryBuilder('a')
          .where('a.id = :id', { id: secondId })
          .setLock('pessimistic_write')
          .getOne();

        const from = first?.id === input.fromAccountId ? first : second!;
        const to = first?.id === input.toAccountId ? first : second!;

        if (!from || !to) throw new DomainError(ErrorCodes.ACCOUNT_NOT_FOUND);

        const amount = input.amount;
        const fromNext = Number(from.balance) - amount;
        if (fromNext < 0) {
          throw new DomainError(ErrorCodes.INSUFFICIENT_FUNDS, 'Insufficient funds', {
            balance: Number(from.balance),
            amount,
          });
        }
        const toNext = Number(to.balance) + amount;

        from.balance = fromNext;
        to.balance = toNext;
        await accRepo.save(from);
        await accRepo.save(to);

        const debitEnt = txRepo.create({
          accountId: input.fromAccountId,
          type: 'WITHDRAWAL',
          amount,
        } as DeepPartial<TransactionOrmEntity>);
        const creditEnt = txRepo.create({
          accountId: input.toAccountId,
          type: 'DEPOSIT',
          amount,
        } as DeepPartial<TransactionOrmEntity>);

        const savedDebit = await txRepo.save(debitEnt);
        const savedCredit = await txRepo.save(creditEnt);

        return {
          debit: this.toDomain(savedDebit),
          credit: this.toDomain(savedCredit),
        };
      });
    } catch (e) {
      return mapDbError(e);
    }
  }

  async listByUser(
    userId: string,
    opts?: { limit?: number; offset?: number },
  ): Promise<Transaction[]> {
    const limit = Math.min(Math.max(opts?.limit ?? 20, 1), 100);
    const offset = Math.max(opts?.offset ?? 0, 0);

    const rows = await this.txRepo
      .createQueryBuilder('t')
      .innerJoin(AccountOrmEntity, 'a', 'a.id = t.account_id')
      .where('a.user_id = :userId', { userId })
      .orderBy('t.created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    return this.toDomainList(rows);
  }
}
