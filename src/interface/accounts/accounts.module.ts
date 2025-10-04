import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountsController } from './accounts.controller';
import { AccountsTypeormRepository } from '../../infra/db/typeorm/repositories/accounts.typeorm-repository';
import { AccountOrmEntity } from '../../infra/db/typeorm/entities/account.orm-entity';

import { CreateAccountUseCase } from '../../app/accounts/use-cases/create-account.usecase';
import { ListMyAccountsUseCase } from '../../app/accounts/use-cases/list-my-accounts.usecase';
import { GetAccountUseCase } from '../../app/accounts/use-cases/get-account.usecase';
import { ListAccountTransactionsUseCase } from '../../app/accounts/use-cases/list-account-transactions.usecase';
import { TransactionsTypeormRepository } from '../../infra/db/typeorm/repositories/transactions.typeorm-repository';

@Module({
  imports: [TypeOrmModule.forFeature([AccountOrmEntity])],
  controllers: [AccountsController],
  providers: [
    TransactionsTypeormRepository,
    AccountsTypeormRepository,
    {
      provide: CreateAccountUseCase,
      useFactory: (repo: AccountsTypeormRepository) => new CreateAccountUseCase(repo),
      inject: [AccountsTypeormRepository],
    },
    {
      provide: ListMyAccountsUseCase,
      useFactory: (accountsRepo: AccountsTypeormRepository) =>
        new ListMyAccountsUseCase(accountsRepo),
      inject: [AccountsTypeormRepository],
    },

    {
      provide: GetAccountUseCase,
      useFactory: (accountsRepo: AccountsTypeormRepository) => new GetAccountUseCase(accountsRepo),
      inject: [AccountsTypeormRepository],
    },

    {
      provide: ListAccountTransactionsUseCase,
      useFactory: (
        accountsRepo: AccountsTypeormRepository,
        txRepo: TransactionsTypeormRepository,
      ) => new ListAccountTransactionsUseCase(accountsRepo, txRepo),
      inject: [AccountsTypeormRepository, TransactionsTypeormRepository],
    },
  ],
  exports: [AccountsTypeormRepository],
})
export class AccountsModule {}
