import { GetAccountUseCase } from '../../../src/app/accounts/use-cases/get-account.usecase';
import { IAccountsRepository } from '../../../src/domain/accounts/accounts.repository';
import { DomainError } from '../../../src/common/errors/domain-error';
import { ErrorCodes } from '../../../src/common/errors/error-codes';

describe('GetAccountUseCase', () => {
  let repo: jest.Mocked<IAccountsRepository>;
  let usecase: GetAccountUseCase;

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByAccountNumber: jest.fn(),
      list: jest.fn(),
      updateBalance: jest.fn(),
    } as unknown as jest.Mocked<IAccountsRepository>;

    usecase = new GetAccountUseCase(repo);
  });

  it('lanza ACCOUNT_NOT_FOUND si la cuenta no existe', async () => {
    repo.findById.mockResolvedValueOnce(null);

    await expect(
      usecase.execute({ accountId: 'no-such-id', userId: 'user-1' }),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCodes.ACCOUNT_NOT_FOUND,
    });

    expect(repo.findById).toHaveBeenCalledWith('no-such-id');
  });

  it('retorna la cuenta cuando existe', async () => {
    const account = {
      id: 'acc-1',
      holderName: 'Jane Doe',
      accountNumber: 'AC-001',
      balance: 500,
      ownerId: 'user-1',
      createdAt: new Date(),
    };

    repo.findById.mockResolvedValueOnce(account as any);

    const result = await usecase.execute({ accountId: 'acc-1', userId: 'user-1' });

    expect(repo.findById).toHaveBeenCalledWith('acc-1');
    expect(result).toEqual(account);
  });
});
