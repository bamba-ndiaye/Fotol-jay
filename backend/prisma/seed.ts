import prisma from './client';
import bcrypt from 'bcryptjs';

async function main(){

  console.log('Seeding admin user...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    }
  });

  console.log('Admin user created or updated.');

  console.log('Seeding categories...');

  const categories = [
    'Électronique',
    'Véhicules',
    'Immobilier',
    'Mode et Vêtements',
    'Maison et Jardin',
    'Sports et Loisirs',
    'Emploi',
    'Services',
    'Animaux',
    'Autres'
  ];

  for (const categoryName of categories) {
    await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName }
    });
  }

  console.log('Categories created or updated.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
});








