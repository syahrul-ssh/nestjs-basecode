import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  create(data: Partial<User>): User {
    return this.repository.create(data);
  }

  save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  findAndCount(query: PaginationQueryDto): Promise<[User[], number]> {
    const order = {
      [query.sortBy]: query.sortOrder,
    } as FindOptionsOrder<User>;

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
