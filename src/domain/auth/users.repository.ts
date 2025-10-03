import { User } from './user.entity';
export interface IUsersRepository {
  findByEmail(email: string): Promise<User | null>;
  create(input: { email: string; passwordHash: string }): Promise<User>;
}
