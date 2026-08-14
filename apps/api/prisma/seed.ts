import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PanenQu Database Seeding...');

  // 1. Clean existing data
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Admin & Test Customer Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin PanenQu',
      email: 'admin@panenqu.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      email: 'budi@gmail.com',
      password: hashedPassword,
      role: Role.CUSTOMER,
    },
  });

  console.log(`👤 Users seeded: Admin (${admin.email}), Customer (${customer.email})`);

  // 3. Seed Categories
  const catFresh = await prisma.category.create({ data: { name: 'Ikan Segar' } });
  const catFrozen = await prisma.category.create({ data: { name: 'Ikan Beku (Frozen IQF)' } });
  const catProcessed = await prisma.category.create({ data: { name: 'Ikan Olahan & Bumbu' } });
  const catSeafood = await prisma.category.create({ data: { name: 'Udang & Seafood' } });
  const catBundle = await prisma.category.create({ data: { name: 'Paket Hemat Panen' } });

  console.log('🏷️ Categories seeded!');

  // 4. Seed Products
  const products = [
    {
      name: 'Ikan Gurame Segar Utuh (1 Kg)',
      description: 'Ikan Gurame hidup dipanen segar dari kolam budidaya mitra PanenQu. Daging tebal, gurih, cocok untuk dibakar atau digoreng.',
      price: 55000,
      weightGram: 1000,
      unit: 'kg',
      stock: 50,
      isFresh: true,
      isFrozen: false,
      isProcessed: false,
      categoryId: catFresh.id,
      imageUrl: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Ikan Nila Segar Bersih (1 Kg)',
      description: 'Ikan Nila segar pilihan yang sudah dibersihkan sisik dan jeroannya. Praktis langsung diolah.',
      price: 38000,
      weightGram: 1000,
      unit: 'kg',
      stock: 80,
      isFresh: true,
      isFrozen: false,
      isProcessed: false,
      categoryId: catFresh.id,
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Fillet Ikan Patin Frozen IQF (500g)',
      description: 'Daging fillet ikan Patin tanpa duri dan tanpa kulit, dibekukan dengan metode Individual Quick Freezing (IQF) untuk menjaga kesegaran alami.',
      price: 32000,
      weightGram: 500,
      unit: 'pack',
      stock: 100,
      isFresh: false,
      isFrozen: true,
      isProcessed: false,
      categoryId: catFrozen.id,
      imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Udang Vaname Kupas Frozen (500g)',
      description: 'Udang Vaname berkualitas ekspor yang telah dikupas bersih. Sangat praktis untuk masakan tumis, sup, atau goreng tepung.',
      price: 68000,
      weightGram: 500,
      unit: 'pack',
      stock: 60,
      isFresh: false,
      isFrozen: true,
      isProcessed: false,
      categoryId: catSeafood.id,
      imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Lele Marinasi Bumbu Kuning Ready-to-Cook (500g)',
      description: 'Ikan Lele segar yang sudah dibersihkan dan dimarinasi dengan rempah bumbu kuning alami. Tinggal digoreng!',
      price: 35000,
      weightGram: 500,
      unit: 'pack',
      stock: 45,
      isFresh: false,
      isFrozen: false,
      isProcessed: true,
      categoryId: catProcessed.id,
      imageUrl: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Paket Hemat Panen Dapur Keluarga (2 Kg)',
      description: 'Paket kombinasi hemat berisi 1 Kg Nila Segar + 500g Fillet Patin + 500g Lele Bumbu Kuning. Lebih hemat untuk stok konsumsi seminggu.',
      price: 105000,
      weightGram: 2000,
      unit: 'paket',
      stock: 30,
      isFresh: true,
      isFrozen: true,
      isProcessed: true,
      categoryId: catBundle.id,
      imageUrl: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (const item of products) {
    await prisma.product.create({ data: item });
  }

  console.log('🐟 Products seeded successfully!');
  console.log('✅ PanenQu Database Seeding Completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
