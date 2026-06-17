// src/database/seeders/identity.seeder.ts

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

export async function seedIdentity(dataSource: DataSource) {
  const passwordHash = await bcrypt.hash('Admin123!', 10);

  await dataSource.query(`
    INSERT INTO permissions (name, description)
    VALUES
      ('users.create', 'Create users'),
      ('users.read', 'Read users'),
      ('users.update', 'Update users'),
      ('users.delete', 'Delete users'),
      ('roles.create', 'Create roles'),
      ('roles.read', 'Read roles'),
      ('roles.update', 'Update roles'),
      ('roles.delete', 'Delete roles'),
      ('permissions.create', 'Create permissions'),
      ('permissions.read', 'Read permissions'),
      ('permissions.update', 'Update permissions'),
      ('permissions.delete', 'Delete permissions')
    ON CONFLICT (name) DO NOTHING
  `);

  await dataSource.query(`
    INSERT INTO roles (name, description)
    VALUES
      ('super-admin', 'System administrator')
    ON CONFLICT (name) DO NOTHING
  `);

  await dataSource.query(
    `
    INSERT INTO users (
      name,
      email,
      password_hash,
      "isActive"
    )
    VALUES ($1, $2, $3, true)
    ON CONFLICT (email) DO NOTHING
    `,
    ['Super Admin', 'admin@example.com', passwordHash],
  );
}