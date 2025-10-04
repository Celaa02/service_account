import { IAccountsRepository } from '../../../domain/accounts/accounts.repository';
import { DomainError } from '../../../common/errors/domain-error';
import { ErrorCodes } from '../../../common/errors/error-codes';

export class GetAccountUseCase {
  constructor(private readonly accounts: IAccountsRepository) {}

  async execute(input: { accountId: string; userId?: string }) {
    const acc = await this.accounts.findById(input.accountId);
    if (!acc) throw new DomainError(ErrorCodes.ACCOUNT_NOT_FOUND);
    return acc;
  }
}
