import { PrismaClient, type BuyerOrderStatus, type SellerStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Test data for exercising the API locally. Safe to re-run: it clears the
 * tables it owns first. Never point this at a database with real data.
 */

interface VarietySeed {
  varietyName: string;
  description?: string;
  origin?: string;
  grower?: string;
  growingMethod?: string;
  harvestSeason?: string;
  quality?: string;
  color?: string;
  size?: string;
  price_per_unit?: string;
  availability?: string;
  certifications?: string;
  imageUrl?: string;
  harvestDate?: Date;
  grade?: string;
  packingType?: string;
  packingDetail?: string;
  moq?: number;
  availableQuantity?: number;
  priceMin?: number;
  priceMax?: number;
  paymentTerms?: string;
  deliveryTimeDays?: string;
  moistureContent?: string;
  processingType?: string;
}

interface ProductSeed {
  productName: string;
  category: string;
  subcategory?: string;
  description: string;
  image_url?: string;
  quantity: string;
  country?: string;
  location?: string;
  productTag?: string;
  farmerInfo?: string;
  varieties: VarietySeed[];
}

const PRODUCTS: ProductSeed[] = [
  {
    productName: 'Banana',
    category: 'Fruits',
    subcategory: 'Tropical',
    description: 'Certified organic ripe bananas, hand-picked and graded',
    image_url: 'assets/images/Prdimg/b1.jpg',
    quantity: '1200',
    location: 'Theni, Tamil Nadu',
    productTag: 'Organic',
    farmerInfo: 'Green Valley Farms — a 140-member co-operative farming 320 acres across Theni district.',
    varieties: [
      {
        grade: 'Grade A',
        packingType: 'Corrugated carton',
        packingDetail: '13 kg net cartons, 20 per pallet',
        moq: 18,
        availableQuantity: 1200,
        priceMin: 420,
        priceMax: 560,
        paymentTerms: '30% advance, balance against B/L',
        deliveryTimeDays: '12-18',
        moistureContent: '74%',
        processingType: 'Washed, waxed, pre-cooled',
        varietyName: 'Cavendish',
        description: 'Sweet dessert banana, the global export standard',
        origin: 'Tamil Nadu',
        grower: 'Green Valley Farms',
        growingMethod: 'Organic',
        harvestSeason: 'Year-round',
        quality: 'Grade A',
        color: 'Yellow',
        size: 'Medium',
        price_per_unit: '45',
        availability: 'In Stock',
        certifications: 'Organic India, Global GAP',
        imageUrl: 'assets/images/Prdimg/b1.jpg',
        harvestDate: new Date('2026-06-01'),
      },
      {
        varietyName: 'Red Banana',
        description: 'Firm texture, less sweet, high in beta carotene',
        origin: 'Kerala',
        grower: 'Backwater Organics',
        growingMethod: 'Natural',
        harvestSeason: 'Summer',
        quality: 'Grade B',
        color: 'Reddish purple',
        size: 'Small',
        price_per_unit: '70',
        availability: 'Limited',
        grade: 'Grade B',
        packingType: 'Corrugated carton',
        packingDetail: '10 kg net cartons',
        moq: 12,
        availableQuantity: 180,
        priceMin: 640,
        priceMax: 780,
        paymentTerms: '50% advance, balance against B/L',
        deliveryTimeDays: '12-18',
        moistureContent: '72%',
        processingType: 'Washed, pre-cooled',
      },
      {
        varietyName: 'Nendran',
        description: 'Plantain variety, used for chips and cooking',
        origin: 'Kerala',
        quality: 'Grade A',
        color: 'Green',
        price_per_unit: '55',
        availability: 'In Stock',
        grade: 'Grade A',
        packingType: 'Corrugated carton',
        packingDetail: '14 kg net cartons',
        moq: 15,
        availableQuantity: 400,
        priceMin: 500,
        priceMax: 620,
        paymentTerms: '30% advance, balance against B/L',
        deliveryTimeDays: '12-18',
        moistureContent: '70%',
        processingType: 'Washed, graded',
      },
    ],
  },
  {
    productName: 'Black Pepper',
    category: 'Spices',
    subcategory: 'Whole Spices',
    description: 'Sun-dried whole black peppercorns, 550 g/l density',
    image_url: 'assets/images/Prdimg/pep1.jpg',
    quantity: '480',
    location: 'Idukki, Kerala',
    productTag: 'Export Grade',
    farmerInfo: 'Western Ghats Spice Co. sources from 60 smallholders at 900-1200m elevation.',
    varieties: [
      {
        grade: 'MG1',
        packingType: 'Jute bag',
        packingDetail: '50 kg double-stitched jute bags',
        moq: 5,
        availableQuantity: 320,
        priceMin: 5800,
        priceMax: 6400,
        paymentTerms: 'Irrevocable LC at sight',
        deliveryTimeDays: '15-21',
        moistureContent: '11% max',
        processingType: 'Sun-dried, garbled, machine cleaned',
        varietyName: 'Malabar Garbled',
        description: 'Premium export grade, uniform bold berries',
        origin: 'Kerala',
        grower: 'Western Ghats Spice Co.',
        growingMethod: 'Shade grown',
        harvestSeason: 'Winter',
        quality: 'Grade A',
        color: 'Black',
        size: '4.25mm',
        price_per_unit: '620',
        availability: 'In Stock',
        certifications: 'Spices Board India',
        harvestDate: new Date('2026-01-20'),
      },
      {
        varietyName: 'Tellicherry Extra Bold',
        description: 'Largest berries, left to ripen longer on the vine',
        origin: 'Kerala',
        quality: 'Premium',
        size: '4.75mm',
        price_per_unit: '890',
        availability: 'Limited',
        certifications: 'Spices Board India',
        grade: 'TGEB',
        packingType: 'Jute bag',
        packingDetail: '50 kg double-stitched jute bags',
        moq: 3,
        availableQuantity: 160,
        priceMin: 8200,
        priceMax: 9100,
        paymentTerms: 'Irrevocable LC at sight',
        deliveryTimeDays: '15-21',
        moistureContent: '11% max',
        processingType: 'Sun-dried, garbled, size graded',
      },
    ],
  },
  {
    productName: 'Coffee Beans',
    category: 'Coffee',
    subcategory: 'Arabica',
    description: 'Shade-grown arabica, washed and sun-dried',
    image_url: 'assets/images/Prdimg/coff.jpg',
    quantity: '860',
    location: 'Chikmagalur, Karnataka',
    productTag: 'Specialty',
    farmerInfo: 'Hillside Estate, 180 acres under native shade canopy, third-generation growers.',
    varieties: [
      {
        grade: 'Specialty 84+',
        packingType: 'Jute bag with GrainPro liner',
        packingDetail: '60 kg bags',
        moq: 3,
        availableQuantity: 540,
        priceMin: 3900,
        priceMax: 4600,
        paymentTerms: '50% advance, balance before shipment',
        deliveryTimeDays: '20-28',
        moistureContent: '10.5%',
        processingType: 'Fully washed, sun-dried on raised beds',
        varietyName: 'Chikmagalur Arabica',
        description: 'Medium body, citrus notes, 1200m elevation',
        origin: 'Karnataka',
        grower: 'Hillside Estate',
        growingMethod: 'Shade grown',
        harvestSeason: 'Nov - Jan',
        quality: 'Specialty',
        color: 'Green bean',
        size: 'Screen 17',
        price_per_unit: '410',
        availability: 'In Stock',
        certifications: 'Rainforest Alliance',
        imageUrl: 'assets/images/Prdimg/coff.jpg',
        harvestDate: new Date('2025-12-15'),
      },
      {
        varietyName: 'Monsooned Malabar',
        description: 'Exposed to monsoon winds, low acidity, heavy body',
        origin: 'Karnataka',
        quality: 'Grade A',
        price_per_unit: '480',
        availability: 'In Stock',
        grade: 'AA',
        packingType: 'Jute bag',
        packingDetail: '60 kg bags',
        moq: 5,
        availableQuantity: 320,
        priceMin: 4400,
        priceMax: 5200,
        paymentTerms: 'Irrevocable LC at sight',
        deliveryTimeDays: '20-28',
        moistureContent: '13%',
        processingType: 'Monsooned, hand sorted',
      },
    ],
  },
  {
    productName: 'Avocado',
    category: 'Fruits',
    subcategory: 'Tropical',
    description: 'Export-grade Hass avocados, cold chain maintained',
    image_url: 'assets/images/Prdimg/av3.jpg',
    quantity: '340',
    location: 'Pune, Maharashtra',
    productTag: 'Cold Chain',
    farmerInfo: 'Deccan Highlands, drip-irrigated orchards at 700m with on-site pack house.',
    varieties: [
      {
        grade: 'Grade A',
        packingType: 'Vented carton',
        packingDetail: '4 kg cartons, count 20-24',
        moq: 2,
        availableQuantity: 340,
        priceMin: 2200,
        priceMax: 2800,
        paymentTerms: '100% advance',
        deliveryTimeDays: '7-10',
        moistureContent: 'n/a',
        processingType: 'Hand-picked, pre-cooled to 5°C',
        varietyName: 'Hass',
        description: 'Creamy texture, pebbled skin, 22% oil content',
        origin: 'Maharashtra',
        grower: 'Deccan Highlands',
        growingMethod: 'Drip irrigated',
        harvestSeason: 'Aug - Oct',
        quality: 'Grade A',
        color: 'Dark green',
        size: 'Count 20',
        price_per_unit: '240',
        availability: 'In Stock',
        imageUrl: 'assets/images/Prdimg/av3.jpg',
        harvestDate: new Date('2026-09-05'),
      },
    ],
  },
  {
    productName: 'Cauliflower',
    category: 'Vegetables',
    subcategory: 'Brassica',
    description: 'Fresh Indian cauliflower, tight curd, field packed',
    image_url: 'assets/images/Prdimg/cau1.jpg',
    quantity: '2100',
    location: 'Ludhiana, Punjab',
    productTag: 'Fresh',
    farmerInfo: 'Northern Fields Co-op, 85 farms supplying a shared grading and packing line.',
    varieties: [
      {
        grade: 'Grade A',
        packingType: 'Mesh sack',
        packingDetail: '20 kg sacks, field packed',
        moq: 10,
        availableQuantity: 2100,
        priceMin: 310,
        priceMax: 420,
        paymentTerms: 'Payment on delivery',
        deliveryTimeDays: '3-5',
        moistureContent: 'n/a',
        processingType: 'Trimmed, field cooled',
        varietyName: 'Snowball',
        description: 'Pure white compact head, 600-900g',
        origin: 'Punjab',
        grower: 'Northern Fields Co-op',
        growingMethod: 'Conventional',
        harvestSeason: 'Winter',
        quality: 'Grade A',
        color: 'White',
        size: 'Large',
        price_per_unit: '35',
        availability: 'In Stock',
      },
    ],
  },
  {
    productName: 'Cardamom',
    category: 'Spices',
    subcategory: 'Whole Spices',
    description: 'Green cardamom capsules, 8mm bold, high oil content',
    quantity: '95',
    location: 'Idukki, Kerala',
    productTag: 'Premium',
    farmerInfo: 'Cardamom Hills Estate, organic certified since 2011, 240 acres.',
    varieties: [
      {
        grade: 'AGEB 8mm',
        packingType: 'Vacuum pouch in carton',
        packingDetail: '5 kg vacuum pouches, 4 per carton',
        moq: 1,
        availableQuantity: 95,
        priceMin: 22000,
        priceMax: 26500,
        paymentTerms: 'Irrevocable LC at sight',
        deliveryTimeDays: '14-20',
        moistureContent: '10% max',
        processingType: 'Flue-cured, size graded',
        varietyName: 'Alleppey Green Bold',
        description: 'Deep green, strong aroma, 8mm+ capsules',
        origin: 'Kerala',
        grower: 'Cardamom Hills Estate',
        growingMethod: 'Organic',
        harvestSeason: 'Oct - Feb',
        quality: 'Premium',
        color: 'Green',
        size: '8mm',
        price_per_unit: '2450',
        availability: 'Limited',
        certifications: 'Organic India, Spices Board India',
        harvestDate: new Date('2025-11-30'),
      },
    ],
  },
  {
    productName: 'Turmeric',
    category: 'Spices',
    subcategory: 'Ground Spices',
    description: 'Polished turmeric fingers, 3.5% curcumin',
    quantity: '1500',
    location: 'Salem, Tamil Nadu',
    productTag: 'High Curcumin',
    farmerInfo: 'Salem Farmers Collective, 210 growers with shared polishing and boiling units.',
    varieties: [
      {
        grade: 'Grade A',
        packingType: 'PP woven bag',
        packingDetail: '25 kg bags with inner liner',
        moq: 5,
        availableQuantity: 1500,
        priceMin: 880,
        priceMax: 1150,
        paymentTerms: '30% advance, balance against documents',
        deliveryTimeDays: '10-15',
        moistureContent: '8% max',
        processingType: 'Boiled, dried, polished',
        varietyName: 'Salem Finger',
        description: 'Bright orange cross-section, high curcumin',
        origin: 'Tamil Nadu',
        grower: 'Salem Farmers Collective',
        growingMethod: 'Conventional',
        harvestSeason: 'Jan - Mar',
        quality: 'Grade A',
        color: 'Deep orange',
        price_per_unit: '95',
        availability: 'In Stock',
        certifications: 'Spices Board India',
      },
    ],
  },
  {
    productName: 'Alphonso Mango',
    category: 'Fruits',
    subcategory: 'Tropical',
    description: 'GI-tagged Ratnagiri Alphonso, naturally ripened',
    image_url: 'assets/images/Prdimg/app1.jpg',
    quantity: '220',
    location: 'Ratnagiri, Maharashtra',
    productTag: 'GI Tagged',
    farmerInfo: 'Konkan Orchards, coastal groves within the Ratnagiri GI boundary.',
    varieties: [
      {
        grade: 'Export Premium',
        packingType: 'Single-layer carton',
        packingDetail: '5.2 kg cartons, count 12, paper wrapped',
        moq: 1,
        availableQuantity: 220,
        priceMin: 11500,
        priceMax: 14000,
        paymentTerms: '100% advance',
        deliveryTimeDays: '5-8',
        moistureContent: 'n/a',
        processingType: 'Naturally ripened, hot water treated',
        varietyName: 'Ratnagiri Alphonso',
        description: 'Saffron flesh, non-fibrous, GI tagged',
        origin: 'Maharashtra',
        grower: 'Konkan Orchards',
        growingMethod: 'Natural ripening',
        harvestSeason: 'Apr - Jun',
        quality: 'Premium',
        color: 'Golden yellow',
        size: 'Count 12',
        price_per_unit: '1250',
        availability: 'Seasonal',
        certifications: 'GI Tag, Global GAP',
        imageUrl: 'assets/images/Prdimg/app1.jpg',
        harvestDate: new Date('2026-05-10'),
      },
    ],
  },
];

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

  // --- buyers -------------------------------------------------------------
  const buyerSpecs = [
    { name: 'Test Buyer', userName: 'testbuyer', email: 'buyer@example.com', phone: '9000000001', city: 'Coimbatore', state: 'Tamil Nadu', zip: '641001' },
    { name: 'Meera Traders', userName: 'meera', email: 'meera@example.com', phone: '9000000003', city: 'Kochi', state: 'Kerala', zip: '682001' },
    { name: 'Global Foods Ltd', userName: 'globalfoods', email: 'buying@globalfoods.example', phone: '9000000004', city: 'Mumbai', state: 'Maharashtra', zip: '400001' },
  ];

  const buyers = [];
  for (const spec of buyerSpecs) {
    const user = await prisma.users.create({
      data: {
        authenticationType: 'BUYER',
        name: spec.name,
        userName: spec.userName,
        email: spec.email,
        sPhrase: password,
      },
    });
    buyers.push(
      await prisma.buyer.create({
        data: {
          ...spec,
          country: 'India',
          address: `${spec.city} trade centre`,
          password,
          usersEntity: { connect: { id: user.id } },
        },
      }),
    );
  }

  // --- sellers ------------------------------------------------------------
  const sellerSpecs: Array<{ name: string; userName: string; email: string; phone: string; city: string; state: string; zip: string; status: SellerStatus }> = [
    { name: 'Test Seller', userName: 'testseller', email: 'seller@example.com', phone: '9000000002', city: 'Madurai', state: 'Tamil Nadu', zip: '625001', status: 'APPROVED' },
    { name: 'Green Valley Farms', userName: 'greenvalley', email: 'hello@greenvalley.example', phone: '9000000005', city: 'Erode', state: 'Tamil Nadu', zip: '638001', status: 'PENDING' },
    { name: 'Western Ghats Spice Co.', userName: 'wgspice', email: 'sales@wgspice.example', phone: '9000000006', city: 'Idukki', state: 'Kerala', zip: '685501', status: 'IN_REVIEW' },
    { name: 'Hillside Estate', userName: 'hillside', email: 'estate@hillside.example', phone: '9000000007', city: 'Chikmagalur', state: 'Karnataka', zip: '577101', status: 'APPROVED' },
  ];

  for (const spec of sellerSpecs) {
    const { userName, ...sellerFields } = spec;
    const user = await prisma.users.create({
      data: {
        authenticationType: 'SELLER',
        name: spec.name,
        userName,
        email: spec.email,
        sPhrase: password,
      },
    });
    await prisma.seller.create({
      data: {
        ...sellerFields,
        country: 'India',
        address: `${spec.city} farm road`,
        usersEntity: { connect: { id: user.id } },
      },
    });
  }

  // --- admin --------------------------------------------------------------
  const adminUser = await prisma.users.create({
    data: {
      authenticationType: 'ADMIN',
      name: 'Site Admin',
      userName: 'admin',
      email: 'admin@example.com',
      sPhrase: password,
    },
  });
  await prisma.admin.create({
    data: {
      name: 'Site Admin',
      userName: 'admin',
      email: 'admin@example.com',
      usersEntity: { connect: { id: adminUser.id } },
    },
  });

  // --- products and varieties --------------------------------------------
  const products = [];
  for (const p of PRODUCTS) {
    products.push(
      await prisma.product.create({
        data: {
          productName: p.productName,
          category: p.category,
          subcategory: p.subcategory ?? null,
          description: p.description,
          image_url: p.image_url ?? null,
          quantity: p.quantity,
          country: p.country ?? 'India',
          location: p.location ?? null,
          productTag: p.productTag ?? null,
          inStock: true,
          farmerInfo: p.farmerInfo ?? null,
          varieties: { create: p.varieties },
        },
        include: { varieties: true },
      }),
    );
  }

  const byName = (name: string) => products.find((p) => p.productName === name)!;

  // --- orders, spread across statuses and dates ---------------------------
  const orderSpecs: Array<{
    buyer: number;
    products: string[];
    status: BuyerOrderStatus;
    quantity: string;
    orderDate: string;
    eta: string;
    payment: string;
    company: string;
  }> = [
    { buyer: 0, products: ['Banana', 'Black Pepper'], status: 'IN_TRANSIT', quantity: '20', orderDate: '2026-10-01', eta: '2026-11-15', payment: 'NET_BANKING', company: 'Test Traders' },
    { buyer: 0, products: ['Banana'], status: 'DELIVERED', quantity: '5', orderDate: '2026-09-18', eta: '2026-09-30', payment: 'UPI', company: 'Test Traders' },
    { buyer: 0, products: ['Coffee Beans', 'Cardamom'], status: 'DELIVERED', quantity: '12', orderDate: '2026-08-04', eta: '2026-08-20', payment: 'LC', company: 'Test Traders' },
    { buyer: 1, products: ['Turmeric'], status: 'CANCELLED', quantity: '40', orderDate: '2026-10-11', eta: '2026-10-28', payment: 'UPI', company: 'Meera Traders' },
    { buyer: 1, products: ['Alphonso Mango'], status: 'RETURNED', quantity: '8', orderDate: '2026-06-02', eta: '2026-06-14', payment: 'NET_BANKING', company: 'Meera Traders' },
    { buyer: 2, products: ['Black Pepper', 'Cardamom', 'Turmeric'], status: 'IN_TRANSIT', quantity: '150', orderDate: '2026-10-25', eta: '2026-11-20', payment: 'LC', company: 'Global Foods Ltd' },
    { buyer: 2, products: ['Avocado'], status: 'DELIVERED', quantity: '60', orderDate: '2026-09-09', eta: '2026-09-22', payment: 'LC', company: 'Global Foods Ltd' },
  ];

  for (const o of orderSpecs) {
    await prisma.buyerOrder.create({
      data: {
        orderDate: new Date(o.orderDate),
        paymentMethod: o.payment,
        billingCompanyName: o.company,
        shippingName: buyers[o.buyer].name,
        quantity: o.quantity,
        status: o.status,
        estimationDateOfArrival: o.eta,
        buyer: { connect: { id: buyers[o.buyer].id } },
        products: { connect: o.products.map((n) => ({ id: byName(n).id })) },
      },
    });
  }

  // --- watch lists --------------------------------------------------------
  const watchSpecs: Array<[number, string]> = [
    [0, 'Black Pepper'],
    [0, 'Cardamom'],
    [0, 'Alphonso Mango'],
    [1, 'Coffee Beans'],
    [1, 'Black Pepper'],
    [2, 'Turmeric'],
  ];
  for (const [buyerIdx, productName] of watchSpecs) {
    await prisma.watchList.create({
      data: { buyerId: buyers[buyerIdx].id, productId: byName(productName).id },
    });
  }

  // --- contact and enquiry records ---------------------------------------
  await prisma.contact.createMany({
    data: [
      { name: 'Ravi Kumar', email: 'ravi@example.com', city: 'Salem', phoneNumber: '9000000010', message: 'Interested in bulk turmeric pricing for export.' },
      { name: 'Anita Desai', email: 'anita@example.com', city: 'Pune', phoneNumber: '9000000011', message: 'Please share the cardamom specification sheet.' },
      {
        name: 'John Mathew',
        email: 'john@buyer.example',
        city: 'Erode',
        phoneNumber: '9000000012',
        message: 'Looking for a long term banana supply contract.',
        topic: 'Farmer Support',
        loginType: 'BUYER',
        state: 'Tamil Nadu',
        district: 'Erode',
        companyName: 'Mathew Exports',
        country: 'India',
        comments: 'We import roughly two containers a month and want a steady supplier.',
      },
    ],
  });

  const counts = {
    products: await prisma.product.count(),
    varieties: await prisma.variety.count(),
    buyers: await prisma.buyer.count(),
    sellers: await prisma.seller.count(),
    orders: await prisma.buyerOrder.count(),
    watchList: await prisma.watchList.count(),
    contacts: await prisma.contact.count(),
  };

  console.log('Seeded:', counts);
  console.log('Logins (all password Test@1234):');
  console.log('  buyer   testbuyer, meera, globalfoods');
  console.log('  seller  testseller, greenvalley, wgspice, hillside');
  console.log('  admin   admin');
  console.log('  main buyer id:', buyers[0].id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
