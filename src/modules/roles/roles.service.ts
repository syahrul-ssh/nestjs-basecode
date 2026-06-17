import { ConflictException, Injectable } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { buildPaginatedResult } from '../../common/utils/pagination.util';
import { PermissionsService } from '../permissions/permissions.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from '../../entities/role.entity';
import { RolesRepository } from './roles.repository';

@Injectable()
export class RolesService {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly permissionsService: PermissionsService,
  ) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.rolesRepository.findByName(dto.name);

    if (existing) {
      throw new ConflictException('Role name already exists');
    }

    const permissions = dto.permissionIds?.length
      ? await this.permissionsService.findByIds(dto.permissionIds)
      : [];

    return this.rolesRepository.save(
      this.rolesRepository.create({
        name: dto.name,
        description: dto.description,
        permissions,
      }),
    );
  }

  async findAll(query: PaginationQueryDto) {
    const [items, total] = await this.rolesRepository.findAndCount(query);
    return buildPaginatedResult(items, total, query.page, query.limit);
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepository.findById(id);

    if (!role) {
      throw new ResourceNotFoundException('Role');
    }

    return role;
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (dto.permissionIds) {
      role.permissions = dto.permissionIds.length
        ? await this.permissionsService.findByIds(dto.permissionIds)
        : [];
    }

    Object.assign(role, {
      name: dto.name ?? role.name,
      description: dto.description ?? role.description,
    });

    return this.rolesRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.rolesRepository.softDelete(id);
  }

  findByIds(ids: string[]): Promise<Role[]> {
    return this.rolesRepository.findByIds(ids);
  }
}
