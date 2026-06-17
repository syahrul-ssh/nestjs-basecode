import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from '../permissions/permissions.service';
import { RolesRepository } from './roles.repository';
import { RolesService } from './roles.service';

describe('RolesService', () => {
  let service: RolesService;
  const repository = {
    findByName: jest.fn(),
    create: jest.fn(<T>(data: T): T => data),
    save: jest.fn((data) => Promise.resolve({ id: 'role-id', ...data })),
    findAndCount: jest.fn(),
    findById: jest.fn(),
    softDelete: jest.fn(),
    findByIds: jest.fn(),
  };
  const permissionsService = {
    findByIds: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: RolesRepository, useValue: repository },
        { provide: PermissionsService, useValue: permissionsService },
      ],
    }).compile();

    service = module.get(RolesService);
  });

  it('attaches permissions when creating a role', async () => {
    const permission = { id: 'permission-id', name: 'users.read' };
    repository.findByName.mockResolvedValue(null);
    permissionsService.findByIds.mockResolvedValue([permission]);

    await expect(
      service.create({ name: 'admin', permissionIds: ['permission-id'] }),
    ).resolves.toMatchObject({
      id: 'role-id',
      name: 'admin',
      permissions: [permission],
    });
  });
});
