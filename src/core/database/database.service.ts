import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, createClient } from '@libsql/client';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  readonly client: Client;

  constructor(config: ConfigService) {
    const url = config.getOrThrow<string>('DATABASE_URL');
    const authToken = config.get<string>('DATABASE_AUTH_TOKEN');

    this.client = createClient({
      url,
      authToken: authToken || undefined,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.client.execute('SELECT 1');
    this.logger.log('Connected to Database');
  }

  onModuleDestroy(): void {
    this.client.close();
  }
}
