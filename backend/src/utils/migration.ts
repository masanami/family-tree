import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface MigrationResult {
  success: boolean;
  message: string;
}

interface MigrationStatus {
  needsMigration: boolean;
  pendingMigrations: string[];
}

interface SchemaValidation {
  valid: boolean;
  errors: string[];
}

export class MigrationManager {
  private prismaPath: string;

  constructor() {
    this.prismaPath = path.join(process.cwd(), 'prisma');
  }

  async runMigration(name: string): Promise<MigrationResult> {
    try {
      execSync(`npx prisma migrate dev --name ${name} --skip-seed`, {
        stdio: 'pipe',
        env: { ...process.env }
      });

      return {
        success: true,
        message: 'Migration completed successfully'
      };
    } catch (error) {
      throw new Error(`Migration failed: ${error}`);
    }
  }

  async checkMigrationStatus(): Promise<MigrationStatus> {
    try {
      const output = execSync('npx prisma migrate status', {
        stdio: 'pipe',
        env: { ...process.env }
      }).toString();

      const needsMigration = output.includes('Database schema is not up to date');
      const pendingMigrations: string[] = [];

      if (needsMigration) {
        // Parse pending migrations from output
        const lines = output.split('\n');
        lines.forEach(line => {
          if (line.includes('migration') && line.includes('pending')) {
            pendingMigrations.push(line.trim());
          }
        });
      }

      return {
        needsMigration,
        pendingMigrations
      };
    } catch (error) {
      return {
        needsMigration: true,
        pendingMigrations: ['Unable to determine migration status']
      };
    }
  }

  async validateSchema(): Promise<SchemaValidation> {
    try {
      execSync('npx prisma validate', {
        stdio: 'pipe',
        env: { ...process.env }
      });

      return {
        valid: true,
        errors: []
      };
    } catch (error: any) {
      const errorMessage = error.stdout?.toString() || error.message;
      return {
        valid: false,
        errors: [errorMessage]
      };
    }
  }

  getDefinedModels(): string[] {
    const schemaPath = path.join(this.prismaPath, 'schema.prisma');
    
    if (!fs.existsSync(schemaPath)) {
      return [];
    }

    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    const modelRegex = /model\s+(\w+)\s*{/g;
    const models: string[] = [];
    
    let match;
    while ((match = modelRegex.exec(schemaContent)) !== null) {
      models.push(match[1]);
    }

    return models;
  }
}