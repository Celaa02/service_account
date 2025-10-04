import { CreateAccountUseCase } from '../../../src/app/accounts/use-cases/create-account.usecase';
import { IAccountsRepository } from '../../../src/domain/accounts/accounts.repository';

// Un fake repo para test
class FakeAccountsRepo implements IAccountsRepository {
  accounts: any[] = [];
  async create(input: any) {
    const acc = { ...input, id: 'fake-id', balance: input.balance ?? 0 };
    this.accounts.push(acc);
    return acc;
  }
  async findById() {
    return null;
  }
  async findByAccountNumber() {
    return null;
  }
  async list() {
    return [];
  }
  async updateBalance() {}
}

describe('CreateAccountUseCase', () => {
  it('crea una cuenta nueva con balance inicial', async () => {
    const repo = new FakeAccountsRepo();
    const useCase = new CreateAccountUseCase(repo);

    const result = await useCase.execute({
      holderName: 'Juan Perez',
      accountNumber: '123456',
      balance: 1000,
      ownerId: '123Secret',
    });

    expect(result.id).toBeDefined();
    expect(result.holderName).toBe('Juan Perez');
    expect(result.balance).toBe(1000);
  });
});
