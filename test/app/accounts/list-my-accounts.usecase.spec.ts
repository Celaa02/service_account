import { ListMyAccountsUseCase } from '../../../src/app/accounts/use-cases/list-my-accounts.usecase';
import { IAccountsRepository } from '../../../src/domain/accounts/accounts.repository';

describe('ListMyAccountsUseCase', () => {
  let repo: jest.Mocked<IAccountsRepository>;
  let usecase: ListMyAccountsUseCase;

  beforeEach(() => {
    repo = {
      list: jest.fn(),
      findById: jest.fn(),
      findByAccountNumber: jest.fn(),
      create: jest.fn(),
      updateBalance: jest.fn(),
    } as unknown as jest.Mocked<IAccountsRepository>;

    usecase = new ListMyAccountsUseCase(repo);
  });

  it('devuelve solo las cuentas del usuario', async () => {
    repo.list.mockResolvedValueOnce([
      { id: '1', accountNumber: 'ACC-1', ownerId: 'u-1', balance: 100 },
      { id: '2', accountNumber: 'ACC-2', ownerId: 'u-2', balance: 200 },
      { id: '3', accountNumber: 'ACC-3', ownerId: 'u-1', balance: 300 },
    ] as any);

    const result = await usecase.execute({ userId: 'u-1' });

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(['1', '3']);
  });

  it('devuelve todas las cuentas si no tienen ownerId', async () => {
    repo.list.mockResolvedValueOnce([
      { id: '1', accountNumber: 'ACC-1', balance: 100 },
      { id: '2', accountNumber: 'ACC-2', balance: 200 },
    ] as any);

    const result = await usecase.execute({ userId: 'u-1' });

    expect(result).toHaveLength(2);
  });

  it('devuelve vacío si no hay cuentas asociadas al usuario', async () => {
    repo.list.mockResolvedValueOnce([
      { id: '1', accountNumber: 'ACC-1', ownerId: 'u-2', balance: 100 },
    ] as any);

    const result = await usecase.execute({ userId: 'u-1' });

    expect(result).toHaveLength(0);
  });

  it('mezcla: devuelve cuentas sin ownerId y del usuario', async () => {
    repo.list.mockResolvedValueOnce([
      { id: '1', accountNumber: 'ACC-1', ownerId: 'u-1', balance: 100 },
      { id: '2', accountNumber: 'ACC-2', balance: 200 },
      { id: '3', accountNumber: 'ACC-3', ownerId: 'u-2', balance: 300 },
    ] as any);

    const result = await usecase.execute({ userId: 'u-1' });

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(['1', '2']);
  });
});
