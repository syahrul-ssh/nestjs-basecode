import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, In, Repository } from 'typeorm';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Role } from '../../entities/role.entity';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>,
  ) {}

  create(data: Partial<Role>): Role {
    return this.repository.create(data);
  }

  save(role: Role): Promise<Role> {
    return this.repository.save(role);
  }

  findById(id: string): Promise<Role | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByName(name: string): Promise<Role | null> {
    return this.repository.findOne({ where: { name } });
  }

  findByIds(ids: string[]): Promise<Role[]> {
    return this.repository.findBy({ id: In(ids) });
  }

  findAndCount(query: PaginationQueryDto): Promise<[Role[], number]> {
    const order = {
      [query.sortBy]: query.sortOrder,
    } as FindOptionsOrder<Role>;

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
