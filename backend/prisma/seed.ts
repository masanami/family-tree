import { SeedManager } from '../src/utils/seed';

async function main() {
  const seedManager = new SeedManager();
  
  console.log('🌱 Starting database seed...');
  
  try {
    // Clear existing data first
    console.log('🧹 Clearing existing data...');
    const clearResult = await seedManager.clear();
    console.log(`Cleared: ${clearResult.relationshipsDeleted} relationships, ${clearResult.personsDeleted} persons, ${clearResult.familyTreesDeleted} family trees`);
    
    // Seed new data
    console.log('📝 Creating sample data...');
    const seedResult = await seedManager.seed();
    console.log(`Created: ${seedResult.familyTreesCreated} family trees, ${seedResult.personsCreated} persons, ${seedResult.relationshipsCreated} relationships`);
    
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });