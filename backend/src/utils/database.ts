import { PrismaClient } from '@prisma/client';

export class DatabaseConnection {
  public client: PrismaClient;

  constructor() {
    this.client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.$connect();
    } catch (error) {
      throw new Error('Failed to connect to database');
    }
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }
}