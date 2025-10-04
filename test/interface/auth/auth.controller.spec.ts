import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from '../../../src/interface/auth/auth.controller';

import { JwtService } from '@nestjs/jwt';
import { RegisterUserUseCase } from '../../../src/app/auth/use-cases/register-user.usecase';
import { LoginUserUseCase } from '../../../src/app/auth/use-cases/login-user.usecase';

describe('AuthController (unit)', () => {
  let controller: AuthController;

  const jwtMock = {
    signAsync: jest.fn(),
  };

  const registerMock = {
    execute: jest.fn(),
  };

  const loginMock = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: JwtService, useValue: jwtMock },
        { provide: RegisterUserUseCase, useValue: registerMock },
        { provide: LoginUserUseCase, useValue: loginMock },
      ],
    }).compile();

    controller = module.get(AuthController);
  });

  describe('POST /auth/register', () => {
    it('registra un usuario y retorna { user, token }', async () => {
      const dto = { email: 'demo@bank.com', password: 'secret' };
      const user = { id: 'u-1', email: dto.email, passwordHash: '***' };

      registerMock.execute.mockResolvedValueOnce(user);
      jwtMock.signAsync.mockResolvedValueOnce('signed-token');

      const res = await controller.register(dto as any);

      expect(registerMock.execute).toHaveBeenCalledWith({
        email: dto.email,
        password: dto.password,
      });
      expect(jwtMock.signAsync).toHaveBeenCalledWith({ sub: user.id, email: user.email });
      expect(res).toEqual({ user, token: 'signed-token' });
    });
  });

  describe('POST /auth/login', () => {
    it('valida credenciales y retorna { user, token }', async () => {
      const dto = { email: 'demo@bank.com', password: 'secret' };
      const user = { id: 'u-1', email: dto.email, passwordHash: '***' };

      loginMock.execute.mockResolvedValueOnce(user);
      jwtMock.signAsync.mockResolvedValueOnce('signed-token-2');

      const res = await controller.login(dto as any);

      expect(loginMock.execute).toHaveBeenCalledWith({ email: dto.email, password: dto.password });
      expect(jwtMock.signAsync).toHaveBeenCalledWith({ sub: user.id, email: user.email });
      expect(res).toEqual({ user, token: 'signed-token-2' });
    });

    it('lanza UnauthorizedException si las credenciales son inválidas', async () => {
      const dto = { email: 'demo@bank.com', password: 'bad' };

      loginMock.execute.mockResolvedValueOnce(null);

      await expect(controller.login(dto as any)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(loginMock.execute).toHaveBeenCalledWith({ email: dto.email, password: dto.password });
      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });
  });
});
