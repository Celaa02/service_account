import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionOrmEntity } from '../../infra/db/typeorm/entities/transaction.orm-entity';
import { AccountOrmEntity } from '../../infra/db/typeorm/entities/account.orm-entity';
import { TransactionsTypeormRepository } from '../../infra/db/typeorm/repositories/transactions.typeorm-repository';
import { CreateTransactionUseCase } from '../../app/transactions/use-cases/create-transaction.usecase';
import { AccountsTypeormRepository } from '../../infra/db/typeorm/repositories/accounts.typeorm-repository';
import { AuthModule } from '../auth/auth.module';
import { CreateTransferUseCase } from '../../app/transactions/use-cases/create-transfer.usecase';
import { ListUserTransactionsUseCase } from '../../app/transactions/use-cases/list-user-transactions.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionOrmEntity, AccountOrmEntity]), AuthModule],
  controllers: [TransactionsController],
  providers: [
    TransactionsTypeormRepository,
    AccountsTypeormRepository,
    {
      provide: CreateTransactionUseCase,
      useFactory: (a: AccountsTypeormRepository, t: TransactionsTypeormRepository) =>
        new CreateTransactionUseCase(a, t),
      inject: [AccountsTypeormRepository, TransactionsTypeormRepository],
    },
    {
      provide: CreateTransferUseCase,
      useFactory: (accRepo: AccountsTypeormRepository, txRepo: TransactionsTypeormRepository) =>
        new CreateTransferUseCase(accRepo, txRepo),
      inject: [AccountsTypeormRepository, TransactionsTypeormRepository],
    },
    {
      provide: ListUserTransactionsUseCase,
      useFactory: (txRepo: TransactionsTypeormRepository) =>
        new ListUserTransactionsUseCase(txRepo),
      inject: [TransactionsTypeormRepository],
    },
  ],
})
export class TransactionsModule {}
