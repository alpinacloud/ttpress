import { createConnection } from 'typeorm';

import * as entities from '../entities';

export default async () => {
  const { POSTGRES_SERVICE_HOST, POSTGRES_SERVICE_PORT, POSTGRES_SERVICE_USERNAME, POSTGRES_SERVICE_PASSWORD, POSTGRES_SERVICE_DATABASE } = process.env;

  const connection = createConnection({
    type: 'postgres',
    host: POSTGRES_SERVICE_HOST as string,
    port: parseInt(POSTGRES_SERVICE_PORT as string),
    username: POSTGRES_SERVICE_USERNAME as string,
    password: POSTGRES_SERVICE_PASSWORD as string,
    database: POSTGRES_SERVICE_DATABASE as string,
    synchronize: true,
    logging: false,
    entities: Object.values(entities),
  });

  console.log(`@ Connected to PostgreSQL [${POSTGRES_SERVICE_DATABASE}]`);

  return connection;
};
