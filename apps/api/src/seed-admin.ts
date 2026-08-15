import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('⏳ Upserting Admin user into database...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@panenqu.com' },
    update: {
      name: 'Admin PanenQu',
      password: hashedPassword,
      role: Role.ADMIN,
    },
    create: {
      name: 'Admin PanenQu',
      email: 'admin@panenqu.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log('✅ Admin Account Ready!');
  console.log('   Email:', admin.email);
  console.log('   Role:', admin.role);
}

main()
  .catch((err) => {
    console.error('❌ Failed to upsert admin:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
