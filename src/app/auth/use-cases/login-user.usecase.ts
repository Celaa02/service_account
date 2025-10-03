import * as bcrypt from 'bcrypt';
import { IUsersRepository } from '../../../domain/auth/users.repository';
import { User } from '../../../domain/auth/user.entity';
import { DomainError } from '../../../common/errors/domain-error';
import { ErrorCodes } from '../../../common/errors/error-codes';

export class LoginUserUseCase {
  constructor(private readonly users: IUsersRepository) {}

  async execute(input: { email: string; password: string }): Promise<User> {
    const user = await this.users.findByEmail(input.email);
    if (!user) throw new DomainError(ErrorCodes.INVALID_CREDENTIALS);
    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw new DomainError(ErrorCodes.INVALID_CREDENTIALS);
    return user;
  }
}
