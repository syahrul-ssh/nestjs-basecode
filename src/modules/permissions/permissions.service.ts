import { ConflictException, Injectable } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { buildPaginatedResult } from '../../common/utils/pagination.util';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from '../../entities/permission.entity';
import { PermissionsRepository } from './permissions.repository';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async create(dto: CreatePermissionDto): Promise<Permission> {
    const existing = await this.permissionsRepository.findByName(dto.name);

    if (existing) {
      throw new ConflictException('Permission name already exists');
    }

    return this.permissionsRepository.save(
      this.permissionsRepository.create(dto),
    );
  }

  async findAll(query: PaginationQueryDto) {
    const [items, total] = await this.permissionsRepository.findAndCount(query);
    return buildPaginatedResult(items, total, query.page, query.limit);
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionsRepository.findById(id);

    if (!permission) {
      throw new ResourceNotFoundException('Permission');
    }

    return permission;
  }

  async update(id: string, dto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);
    Object.assign(permission, dto);
    return this.permissionsRepository.save(permission);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.permissionsRepository.softDelete(id);
  }

  findByIds(ids: string[]): Promise<Permission[]> {
    return this.permissionsRepository.findByIds(ids);
  }
}
