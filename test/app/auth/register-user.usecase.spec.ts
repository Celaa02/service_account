import { RegisterUserUseCase } from '../../../src/app/auth/use-cases/register-user.usecase';
import { IUsersRepository } from '../../../src/domain/auth/users.repository';
import { DomainError } from '../../../src/common/errors/domain-error';
import { ErrorCodes } from '../../../src/common/errors/error-codes';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed:secret'),
}));

import * as bcrypt from 'bcrypt';

describe('RegisterUserUseCase', () => {
  let usersRepo: jest.Mocked<IUsersRepository>;
  let usecase: RegisterUserUseCase;

  beforeEach(() => {
    usersRepo = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<IUsersRepository>;

    usecase = new RegisterUserUseCase(usersRepo);
  });

  it('lanza EMAIL_ALREADY_REGISTERED si el email ya existe', async () => {
    usersRepo.findByEmail.mockResolvedValueOnce({
      id: 'u-1',
      email: 'a@a.com',
      passwordHash: '***',
    } as any);

    await expect(usecase.execute({ email: 'a@a.com', password: 'secret' })).rejects.toMatchObject<
      Partial<DomainError>
    >({
      code: ErrorCodes.EMAIL_ALREADY_REGISTERED,
    } as any);

    expect(usersRepo.findByEmail).toHaveBeenCalledWith('a@a.com');
    expect(usersRepo.create).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  it('hashea la contraseña y crea el usuario cuando no existe', async () => {
    usersRepo.findByEmail.mockResolvedValueOnce(null);

    usersRepo.create.mockImplementation(async (input: any) => ({
      id: 'u-2',
      email: input.email,
      passwordHash: input.passwordHash,
    }));

    const out = await usecase.execute({ email: 'b@b.com', password: 'secret' });

    expect(usersRepo.findByEmail).toHaveBeenCalledWith('b@b.com');
    expect(bcrypt.hash).toHaveBeenCalledWith('secret', 10);
    expect(usersRepo.create).toHaveBeenCalledWith({
      email: 'b@b.com',
      passwordHash: 'hashed:secret',
    });
    expect(out).toEqual({
      id: 'u-2',
      email: 'b@b.com',
      passwordHash: 'hashed:secret',
    });
  });
});
