import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Test data for exercising the API locally. Safe to re-run: it clears the
 * tables it owns first. Never point this at a database with real data.
 */
async function main() {
  const url = process.env.DATABASE_URL ?? '';
  if (/hostinger|prod/i.test(url)) {
    throw new Error('Refusing to seed: DATABASE_URL looks like a hosted database');
  }

  // Children before parents, so foreign keys stay satisfied.
  await prisma.watchList.deleteMany();
  await prisma.buyerOrder.deleteMany();
  await prisma.variety.deleteMany();
  await prisma.product.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.buyer.deleteMany();
  await prisma.seller.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.users.deleteMany();

  const password = await bcrypt.hash('Test@1234', 12);

  const buyerUser = await prisma.users.create({
    data: {
      authenticationType: 'BUYER',
      name: 'Test Buyer',
      userName: 'testbuyer',
      email: 'buyer@example.com',
      sPhrase: password,
    },
  });

  const buyer = await prisma.buyer.create({
    data: {
      name: 'Test Buyer',
      userName: 'testbuyer',
      email: 'buyer@example.com',
      phone: '9000000001',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      country: 'India',
      zip: '641001',
      address: '1 Market Street',
      password,
      usersEntity: { connect: { id: buyerUser.id } },
    },
  });

  const sellerUser = await prisma.users.create({
    data: {
      authenticationType: 'SELLER',
      name: 'Test Seller',
      userName: 'testseller',
      email: 'seller@example.com',
      sPhrase: password,
    },
  });

  await prisma.seller.create({
    data: {
      name: 'Test Seller',
      email: 'seller@example.com',
      phone: '9000000002',
      city: 'Madurai',
      state: 'Tamil Nadu',
      country: 'India',
      zip: '625001',
      address: '2 Farm Road',
      status: 'PENDING',
      usersEntity: { connect: { id: sellerUser.id } },
    },
  });

  const banana = await prisma.product.create({
    data: {
      productName: 'Banana',
      category: 'Fruits',
      subcategory: 'Tropical',
      description: 'Certified organic ripe banana',
      image_url: 'assets/images/Prdimg/b1.jpg',
      quantity: '500',
      varieties: {
        create: [
          {
            varietyName: 'Cavendish',
            description: 'Sweet dessert banana',
            origin: 'Tamil Nadu',
            grower: 'Test Seller',
            growingMethod: 'Organic',
            harvestSeason: 'Summer',
            quality: 'Grade A',
            color: 'Yellow',
            size: 'Medium',
            price_per_unit: '45',
            availability: 'In Stock',
            certifications: 'Organic India',
            imageUrl: 'assets/images/Prdimg/b1.jpg',
            harvestDate: new Date('2026-06-01'),
          },
          {
            varietyName: 'Red Banana',
            description: 'Firm, less sweet',
            origin: 'Kerala',
            quality: 'Grade B',
            availability: 'Limited',
          },
        ],
      },
    },
  });

  const pepper = await prisma.product.create({
    data: {
      productName: 'Black Pepper',
      category: 'Spices',
      description: 'Whole black peppercorns',
      quantity: '120',
      varieties: {
        create: [{ varietyName: 'Malabar', origin: 'Kerala', quality: 'Grade A' }],
      },
    },
  });

  await prisma.buyerOrder.create({
    data: {
      orderDate: new Date('2026-10-01'),
      paymentMethod: 'NET_BANKING',
      billingCompanyName: 'Test Traders',
      shippingName: 'Test Buyer',
      quantity: '20',
      status: 'IN_TRANSIT',
      estimationDateOfArrival: '2026-11-15',
      buyer: { connect: { id: buyer.id } },
      products: { connect: [{ id: banana.id }, { id: pepper.id }] },
    },
  });

  await prisma.buyerOrder.create({
    data: {
      orderDate: new Date('2026-10-20'),
      paymentMethod: 'UPI',
      shippingName: 'Test Buyer',
      quantity: '5',
      status: 'DELIVERED',
      buyer: { connect: { id: buyer.id } },
      products: { connect: [{ id: banana.id }] },
    },
  });

  await prisma.watchList.create({
    data: { buyerId: buyer.id, productId: pepper.id },
  });

  console.log('Seeded:');
  console.log('  buyer    testbuyer / Test@1234  id=%s', buyer.id);
  console.log('  seller   testseller / Test@1234');
  console.log('  products banana=%s pepper=%s', banana.id, pepper.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
