import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  it('connects to a local libSQL database', async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
        }),
      ],
      providers: [DatabaseService],
    }).compile();

    const database = module.get(DatabaseService);
    await database.onModuleInit();

    const result = await database.client.execute('SELECT 1 AS ok');
    expect(result.rows[0].ok).toBe(1);

    database.onModuleDestroy();
    await module.close();
  });
});
