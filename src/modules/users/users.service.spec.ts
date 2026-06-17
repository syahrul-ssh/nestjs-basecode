import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from '../roles/roles.service';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const repository = {
    findByEmail: jest.fn(),
    create: jest.fn(<T>(data: T): T => data),
    save: jest.fn((data) => Promise.resolve({ id: 'user-id', ...data })),
    findAndCount: jest.fn(),
    findById: jest.fn(),
    softDelete: jest.fn(),
  };
  const rolesService = {
    findByIds: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: repository },
        { provide: RolesService, useValue: rolesService },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('hashes passwords when creating users', async () => {
    repository.findByEmail.mockResolvedValue(null);
    rolesService.findByIds.mockResolvedValue([]);

    const user = await service.create({
      name: 'Jane Admin',
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(user.passwordHash).toBeDefined();
    expect(user.passwordHash).not.toBe('password123');
  });

  it('rejects duplicate email addresses', async () => {
    repository.findByEmail.mockResolvedValue({ id: 'user-id' });

    await expect(
      service.create({
        name: 'Jane Admin',
        email: 'jane@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
