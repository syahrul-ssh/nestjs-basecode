import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, In, Repository } from 'typeorm';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Permission } from '../../entities/permission.entity';

@Injectable()
export class PermissionsRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly repository: Repository<Permission>,
  ) {}

  create(data: Partial<Permission>): Permission {
    return this.repository.create(data);
  }

  save(permission: Permission): Promise<Permission> {
    return this.repository.save(permission);
  }

  findById(id: string): Promise<Permission | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByName(name: string): Promise<Permission | null> {
    return this.repository.findOne({ where: { name } });
  }

  findByIds(ids: string[]): Promise<Permission[]> {
    return this.repository.findBy({ id: In(ids) });
  }

  findAndCount(query: PaginationQueryDto): Promise<[Permission[], number]> {
    const order = {
      [query.sortBy]: query.sortOrder,
    } as FindOptionsOrder<Permission>;

    return this.repository.findAndCount({
      order,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
