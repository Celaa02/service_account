import { IAccountsRepository } from '../../../domain/accounts/accounts.repository';
import { Account } from '../../../domain/accounts/accounts.entity';
import { DomainError } from '../../../common/errors/domain-error';
import { ErrorCodes } from '../../../common/errors/error-codes';

export class CreateAccountUseCase {
  constructor(private readonly accounts: IAccountsRepository) {}

  async execute(input: {
    holderName: string;
    accountNumber: string;
    balance: number;
    ownerId: string;
  }): Promise<Account> {
    const exists = await this.accounts.findByAccountNumber(input.accountNumber);
    if (exists) {
      throw new DomainError(
        ErrorCodes.ACCOUNT_NUMBER_ALREADY_EXISTS,
        'Account number already registered',
      );
    }
    return this.accounts.create(input);
  }
}
