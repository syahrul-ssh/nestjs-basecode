import dataSource from "../data-source";
import { seedIdentity } from "./indentity.seeder";


async function bootstrap() {
  try {
    await dataSource.initialize();

    console.log('🌱 Running seeders...');

    await seedIdentity(dataSource);

    console.log('✅ Seeding completed');

    await dataSource.destroy();

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

bootstrap();