import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { buildPaginatedResult } from '../../common/utils/pagination.util';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../../entities/user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesService: RolesService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findByEmail(dto.email);

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const roles = dto.roleIds?.length
      ? await this.rolesService.findByIds(dto.roleIds)
      : [];

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.usersRepository.save(
      this.usersRepository.create({
        name: dto.name,
        email: dto.email,
        passwordHash,
        isActive: dto.isActive ?? true,
        roles,
      }),
    );
  }

  async findAll(query: PaginationQueryDto) {
    const [items, total] = await this.usersRepository.findAndCount(query);
    return buildPaginatedResult(items, total, query.page, query.limit);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new ResourceNotFoundException('User');
    }

    return user;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (dto.roleIds) {
      user.roles = dto.roleIds.length
        ? await this.rolesService.findByIds(dto.roleIds)
        : [];
    }

    Object.assign(user, {
      name: dto.name ?? user.name,
      email: dto.email ?? user.email,
      isActive: dto.isActive ?? user.isActive,
    });

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.usersRepository.softDelete(id);
  }
}
