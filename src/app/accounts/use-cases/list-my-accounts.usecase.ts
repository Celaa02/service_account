import { IAccountsRepository } from '../../../domain/accounts/accounts.repository';

export class ListMyAccountsUseCase {
  constructor(private readonly accounts: IAccountsRepository) {}

  async execute(input: { userId: string }) {
    const all = await this.accounts.list();
    return all.filter((a) => !('ownerId' in a) || a.ownerId === input.userId);
  }
}
