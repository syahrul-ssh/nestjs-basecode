interface RequiredEnv {
  APP_NAME: string;
  PORT: string;
  DATABASE_HOST: string;
  DATABASE_PORT: string;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  REDIS_HOST: string;
  REDIS_PORT: string;
  REDIS_PASSWORD?: string;
}

const requiredKeys: Array<keyof RequiredEnv> = [
  'APP_NAME',
  'PORT',
  'DATABASE_HOST',
  'DATABASE_PORT',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'DATABASE_NAME',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_PASSWORD',
];

export function validateEnv(
  config: Record<string, string | undefined>,
): Record<string, string> {
  const missing = requiredKeys.filter((key) => !config[key]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  const port = Number(config.PORT);
  const databasePort = Number(config.DATABASE_PORT);
  const redisPort = Number(config.REDIS_PORT);

  if (!Number.isInteger(port) || port < 1) {
    throw new Error('PORT must be a valid port number');
  }

  if (!Number.isInteger(databasePort) || databasePort < 1) {
    throw new Error('DATABASE_PORT must be a valid port number');
  }

  if (!Number.isInteger(redisPort) || redisPort < 1) {
    throw new Error('REDIS_PORT must be a valid port number');
  }

  return config as Record<string, string>;
}
