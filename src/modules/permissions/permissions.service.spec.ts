import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { PermissionsRepository } from './permissions.repository';

describe('PermissionsService', () => {
  let service: PermissionsService;
  const repository = {
    findByName: jest.fn(),
    create: jest.fn(<T>(data: T): T => data),
    save: jest.fn((data) => Promise.resolve({ id: 'permission-id', ...data })),
    findAndCount: jest.fn(),
    findById: jest.fn(),
    softDelete: jest.fn(),
    findByIds: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: PermissionsRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(PermissionsService);
  });

  it('creates a permission when the name is unique', async () => {
    repository.findByName.mockResolvedValue(null);

    await expect(
      service.create({ name: 'users.create' }),
    ).resolves.toMatchObject({
      id: 'permission-id',
      name: 'users.create',
    });
  });

  it('rejects duplicate permission names', async () => {
    repository.findByName.mockResolvedValue({ id: 'permission-id' });

    await expect(
      service.create({ name: 'users.create' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
