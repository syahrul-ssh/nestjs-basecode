import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Index({ unique: true })
  @Column()
  name: string;

  @Column({ nullable: true, type: 'varchar' })
  description?: string | null;
}
