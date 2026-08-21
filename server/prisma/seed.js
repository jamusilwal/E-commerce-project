import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting complete database seed...\n');

  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  const sellerPassword = await bcrypt.hash('Seller@123', 12);

  // 1. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hamrolokbazar.com' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'HamrolokBazar',
      email: 'admin@hamrolokbazar.com',
      phone: '+9779800000000',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log(`✅ Admin user created: ${admin.email}`);

  // 2. Create Categories
  const categoriesData = [
    {
      name: 'Handmade Jewelry',
      slug: 'handmade-jewelry',
      description:
        'Beautiful handcrafted jewelry made by skilled Nepalese artisans using traditional techniques.',
      icon: '💎',
      sortOrder: 1,
    },
    {
      name: 'Wooden Crafts',
      slug: 'wooden-crafts',
      description:
        'Exquisitely carved wooden items showcasing the rich woodworking tradition of Nepal.',
      icon: '🪵',
      sortOrder: 2,
    },
    {
      name: 'Pottery',
      slug: 'pottery',
      description:
        'Traditional Nepalese pottery handmade on the wheel by master potters of Bhaktapur.',
      icon: '🏺',
      sortOrder: 3,
    },
    {
      name: 'Dhaka Products',
      slug: 'dhaka-products',
      description:
        'Authentic Dhaka fabric products including topis, scarves, and accessories.',
      icon: '🧵',
      sortOrder: 4,
    },
    {
      name: 'Traditional Clothing',
      slug: 'traditional-clothing',
      description: 'Traditional Nepalese garments handmade with care.',
      icon: '👘',
      sortOrder: 5,
    },
    {
      name: 'Home Decor',
      slug: 'home-decor',
      description:
        'Handcrafted home decoration items that bring Nepalese charm to any space.',
      icon: '🏠',
      sortOrder: 6,
    },
    {
      name: 'Bamboo Crafts',
      slug: 'bamboo-crafts',
      description:
        'Eco-friendly bamboo products crafted by skilled artisans.',
      icon: '🎋',
      sortOrder: 7,
    },
    {
      name: 'Handmade Bags',
      slug: 'handmade-bags',
      description:
        'Unique handmade bags crafted from hemp, cotton, and natural materials.',
      icon: '👜',
      sortOrder: 8,
    },
    {
      name: 'Paintings',
      slug: 'paintings',
      description:
        'Traditional and contemporary Nepalese paintings including Thangka & Paubha.',
      icon: '🎨',
      sortOrder: 9,
    },
    {
      name: 'Handmade Gifts',
      slug: 'handmade-gifts',
      description:
        'Thoughtful handmade gift items perfect for special occasions.',
      icon: '🎁',
      sortOrder: 10,
    },
  ];

  const categoryMap = {};

  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });

    categoryMap[cat.slug] = created.id;
  }

  console.log(`✅ ${categoriesData.length} categories ready`);

  // 3. Create Approved Sellers
  const sellersData = [
    {
      user: {
        firstName: 'Ram',
        lastName: 'Shrestha',
        email: 'ram.pottery@hamrolokbazar.com',
        phone: '9841234567',
      },
      profile: {
        shopName: 'Bhaktapur Clay & Pottery Works',
        shopDescription:
          'Master potters preserving 300 years of Bhaktapur clay craftsmanship.',
        businessPhone: '9841234567',
        businessAddress: 'Pottery Square, Bhaktapur',
        panNumber: '600123456',
        status: 'APPROVED',
      },
    },
    {
      user: {
        firstName: 'Sita',
        lastName: 'Tamang',
        email: 'sita.jewelry@hamrolokbazar.com',
        phone: '9851234567',
      },
      profile: {
        shopName: 'Patan Fine Silver & Filigree',
        shopDescription:
          'Authentic handmade silver jewelry with precious turquoise and coral stones.',
        businessPhone: '9851234567',
        businessAddress: 'Mangal Bazar, Patan, Lalitpur',
        panNumber: '600234567',
        status: 'APPROVED',
      },
    },
    {
      user: {
        firstName: 'Maya',
        lastName: 'Gurung',
        email: 'maya.dhaka@hamrolokbazar.com',
        phone: '9861234567',
      },
      profile: {
        shopName: 'Palpali Traditional Dhaka Weavers',
        shopDescription:
          'Hand-woven Palpali Dhaka topis, shawls, and fabrics from Palpa, Nepal.',
        businessPhone: '9861234567',
        businessAddress: 'Tansen, Palpa',
        panNumber: '600345678',
        status: 'APPROVED',
      },
    },
    {
      user: {
        firstName: 'Hari',
        lastName: 'Maharjan',
        email: 'hari.wood@hamrolokbazar.com',
        phone: '9801234567',
      },
      profile: {
        shopName: 'Himalayan Wood Carvings',
        shopDescription:
          'Traditional Newari wooden windows, masks, and spiritual crafts.',
        businessPhone: '9801234567',
        businessAddress: 'Kirtipur, Kathmandu',
        panNumber: '600456789',
        status: 'APPROVED',
      },
    },
  ];

  const sellerMap = {};

  for (const s of sellersData) {
    const user = await prisma.user.upsert({
      where: { email: s.user.email },
      update: {},
      create: {
        ...s.user,
        password: sellerPassword,
        role: 'SELLER',
      },
    });

    const sellerProfile = await prisma.sellerProfile.upsert({
      where: { userId: user.id },
      update: { status: 'APPROVED' },
      create: {
        userId: user.id,
        ...s.profile,
      },
    });

    sellerMap[s.profile.shopName] = sellerProfile.id;
  }

  console.log(`✅ 4 Approved seller profiles ready`);

  // 4. Create 12 Authentic Handmade Products
  const productsData = [
    {
      name: 'Handcrafted Bhaktapur Clay Water Vessel (Matka)',
      slug: 'handcrafted-bhaktapur-clay-water-vessel',
      categorySlug: 'pottery',
      sellerShop: 'Bhaktapur Clay & Pottery Works',
      price: 1250,
      comparePrice: 1500,
      materials: 'Natural Bhaktapur Terracotta Clay',
      description:
        'Authentic handmade clay vessel wheel-thrown by master potters of Bhaktapur. Keeps water naturally cool while preserving minerals.',
      estimatedDelivery: '2-3 Business Days',
      isFeatured: true,
      quantity: 25,
      imageUrl:
        'https://images.squarespace-cdn.com/content/v1/5f7d822f9176547c7c6697f7/1620338476648-YMNZB9MMEVFO4N9NJG1W/.Lisa+2.jpg',
    },
    {
      name: 'Pure Silver Filigree Turquoise Gem Ring',
      slug: 'pure-silver-filigree-turquoise-gem-ring',
      categorySlug: 'handmade-jewelry',
      sellerShop: 'Patan Fine Silver & Filigree',
      price: 2800,
      comparePrice: 3200,
      materials: '925 Sterling Silver, Himalayan Turquoise Stone',
      description:
        'Handcrafted in Patan using ancient filigree wire techniques. Features a genuine natural Himalayan turquoise gemstone.',
      estimatedDelivery: '3-4 Business Days',
      isFeatured: true,
      quantity: 15,
      imageUrl:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXVD2N5wrWIxbcGr4PWWoVWkxFkNjt4ZD03_PpumQGqA&s=10',
    },
    {
      name: 'Authentic Palpali Hand-Woven Dhaka Topi',
      slug: 'authentic-palpali-hand-woven-dhaka-topi',
      categorySlug: 'dhaka-products',
      sellerShop: 'Palpali Traditional Dhaka Weavers',
      price: 950,
      comparePrice: 1200,
      materials: '100% Pure Cotton Dhaka Thread',
      description:
        'Traditional Nepalese Dhaka Topi hand-woven on handlooms in Tansen, Palpa. Lightweight, durable, and culturally iconic.',
      estimatedDelivery: '2-4 Business Days',
      isFeatured: true,
      quantity: 40,
      imageUrl:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSXsLDXjWxqAwWMZgL6AcKxzj_LYmO6H6NnJ_L-V3wsg&s',
    },
    {
      name: 'Hand-Carved Wooden Peacock Window (Ankhijhyal)',
      slug: 'hand-carved-wooden-peacock-window',
      categorySlug: 'wooden-crafts',
      sellerShop: 'Himalayan Wood Carvings',
      price: 8500,
      comparePrice: 10000,
      materials: 'Sal Wood (Shorea robusta)',
      description:
        'Detailed replica of Kathmandu Valley traditional Newari architectural wooden window. Intricately carved by master woodworkers.',
      estimatedDelivery: '4-7 Business Days',
      isFeatured: true,
      quantity: 8,
      imageUrl:
        'https://m.media-amazon.com/images/I/71zvF1IODQL.jpg',
    },
    {
      name: 'Ecofriendly Pure Himalayan Hemp Backpack',
      slug: 'ecofriendly-pure-himalayan-hemp-backpack',
      categorySlug: 'handmade-bags',
      sellerShop: 'Himalayan Wood Carvings',
      price: 2450,
      comparePrice: 2900,
      materials: 'Organic Wild Himalayan Hemp, Cotton Lining',
      description:
        'Handmade backpack woven from wild organic hemp harvested in Western Nepal. Durable, stylish, with padded laptop compartment.',
      estimatedDelivery: '2-4 Business Days',
      isFeatured: true,
      quantity: 30,
      imageUrl:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlUL3PrLKEqecA6hcDCEc26NfjXKA_TjP_036F3jgwwAdhaVSb4Ex6szXU&s=10',
    },
    {
      name: 'Sacred Hand-Painted Green Tara Thangka Painting',
      slug: 'sacred-hand-painted-green-tara-thangka-painting',
      categorySlug: 'paintings',
      sellerShop: 'Patan Fine Silver & Filigree',
      price: 14500,
      comparePrice: 18000,
      materials: 'Cotton Canvas, Mineral Pigments, 24K Gold Dust Paint',
      description:
        'Authentic Buddhist Thangka scroll painting hand-painted by master artists of Patan using gold powder and natural stone mineral colors.',
      estimatedDelivery: '5-7 Business Days',
      isFeatured: true,
      quantity: 5,
      imageUrl:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQu95ZeoKR6C0OO5wphjsmY-3iMXuNhb2WlLDkcjM-kZLM-UNROwI6C7W1U&s=10',
    },
    {
      name: 'Handcrafted Seven-Metal Singing Bowl Set',
      slug: 'handcrafted-seven-metal-singing-bowl-set',
      categorySlug: 'home-decor',
      sellerShop: 'Patan Fine Silver & Filigree',
      price: 4800,
      comparePrice: 5500,
      materials: '7 Sacred Metals Alloy (Bronze, Brass, Copper, etc.)',
      description:
        'Hand-hammered Tibetan singing bowl for meditation and sound healing. Includes wooden striker mallet and silk cushion.',
      estimatedDelivery: '2-3 Business Days',
      isFeatured: true,
      quantity: 20,
      imageUrl:
        'https://m.media-amazon.com/images/I/71CUHQ8WAnL._AC_UF894,1000_QL80_.jpg',
    },
    {
      name: 'Traditional Handloom Dhaka Shawl / Stole',
      slug: 'traditional-handloom-dhaka-shawl',
      categorySlug: 'dhaka-products',
      sellerShop: 'Palpali Traditional Dhaka Weavers',
      price: 1850,
      comparePrice: 2200,
      materials: 'Pure Cotton Dhaka Weave',
      description:
        'Elegant handmade Dhaka shawl woven with intricate geometric patterns. Perfect gift for formal occasions and celebrations.',
      estimatedDelivery: '3-5 Business Days',
      isFeatured: false,
      quantity: 18,
      imageUrl:
        'https://cdn11.bigcommerce.com/s-tgrcca6nho/images/stencil/original/products/72892/157817/Blue-Handloom-Woolen-Dhaka-Shawl-with-Multicolor-Pattern-SWL-3248_157816__92812.1775128879.jpg?c=1',
    },
    {
      name: 'Hand-Painted Traditional Bhairav Wooden Mask',
      slug: 'hand-painted-traditional-bhairav-wooden-mask',
      categorySlug: 'home-decor',
      sellerShop: 'Himalayan Wood Carvings',
      price: 3200,
      comparePrice: 3800,
      materials: 'Lightweight Softwood, Organic Oil Paint',
      description:
        'Vibrant hand-carved and hand-painted wall mask representing Lord Bhairav, crafted by traditional artisans of Kirtipur.',
      estimatedDelivery: '3-5 Business Days',
      isFeatured: false,
      quantity: 12,
      imageUrl:
        'https://www.handmadeexpo.com/pics/product/33981.jpg',
    },
    {
      name: 'Handcrafted Bamboo Tea Canister & Coaster Set',
      slug: 'handcrafted-bamboo-tea-canister-set',
      categorySlug: 'bamboo-crafts',
      sellerShop: 'Bhaktapur Clay & Pottery Works',
      price: 1100,
      comparePrice: 1400,
      materials: 'Treated Natural Bamboo',
      description:
        'Eco-friendly polished bamboo canister for Ilam tea leaves, accompanied by 4 woven bamboo drink coasters.',
      estimatedDelivery: '2-4 Business Days',
      isFeatured: false,
      quantity: 35,
      imageUrl:
        'https://www.kadamhaat.com/cdn/shop/files/handmade-bamboo-coasters-7917861.jpg?v=1763035510&width=900',
    },
    {
      name: 'Pure Soft Pashmina Wool Scarf',
      slug: 'pure-soft-pashmina-wool-scarf',
      categorySlug: 'traditional-clothing',
      sellerShop: 'Palpali Traditional Dhaka Weavers',
      price: 3500,
      comparePrice: 4200,
      materials: '100% Himalayan Pashmina Wool',
      description:
        'Ultra-soft cashmere pashmina shawl woven from Himalayan mountain goat wool. Feather-light, warm, and luxurious.',
      estimatedDelivery: '3-5 Business Days',
      isFeatured: true,
      quantity: 14,
      imageUrl:
        'https://cdn11.bigcommerce.com/s-tgrcca6nho/images/stencil/original/products/72119/155046/Red-Pashmina-Shawl-with-Multicolor-Kashmiri-Floral-Patterns-SWL-3217_155045__67772.1774002721.jpg',
    },
    {
      name: 'Handmade Nepalese Lokta Paper Notebook & Pen',
      slug: 'handmade-nepalese-lokta-paper-notebook',
      categorySlug: 'handmade-gifts',
      sellerShop: 'Bhaktapur Clay & Pottery Works',
      price: 750,
      comparePrice: 900,
      materials: 'Daphne Papyracea (Lokta Bark)',
      description:
        'Handmade eco-journal bound with dried flower pressed Lokta paper. Durable, germ-resistant, and 100% sustainable.',
      estimatedDelivery: '2-3 Business Days',
      isFeatured: false,
      quantity: 50,
      imageUrl:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrhEQ3DiKB8TvOBRAFlAnlp5DhssLl0ImO6DjpwnaEeA&s',
    },
  ];

  // Seed products and UPDATE existing product images
  for (const prod of productsData) {
    const categoryId = categoryMap[prod.categorySlug];
    const sellerId = sellerMap[prod.sellerShop];

    const createdProduct = await prisma.product.upsert({
      where: { slug: prod.slug },

      // Update existing product
      update: {
        price: prod.price,
        comparePrice: prod.comparePrice,
        isFeatured: prod.isFeatured,
      },

      // Create new product
      create: {
        sellerId,
        categoryId,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        shortDescription: prod.description.substring(0, 100) + '...',
        materials: prod.materials,
        price: prod.price,
        comparePrice: prod.comparePrice,
        isFeatured: prod.isFeatured,
        estimatedDelivery: prod.estimatedDelivery,
        avgRating: 4.8,
        totalReviews: 12,
        totalSold: 34,

        images: {
          create: [
            {
              url: prod.imageUrl,
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },

        inventory: {
          create: {
            quantity: prod.quantity,
          },
        },
      },
    });

    // ============================================
    // UPDATE EXISTING PRODUCT IMAGE
    // ============================================

    const existingImage = await prisma.productImage.findFirst({
      where: {
        productId: createdProduct.id,
        isPrimary: true,
      },
    });

    if (existingImage) {
      await prisma.productImage.update({
        where: {
          id: existingImage.id,
        },
        data: {
          url: prod.imageUrl,
        },
      });

      console.log(`🖼️ Updated image: ${prod.name}`);
    } else {
      await prisma.productImage.create({
        data: {
          productId: createdProduct.id,
          url: prod.imageUrl,
          altText: prod.name,
          isPrimary: true,
          sortOrder: 0,
        },
      });

      console.log(`🖼️ Created image: ${prod.name}`);
    }
  }

  console.log(
    `✅ ${productsData.length} Authentic Nepalese Handmade Products seeded`
  );

  // 5. Create Sample Banners
  const banners = [
    {
      title: 'Discover Authentic Nepalese Crafts',
      subtitle:
        'Handmade with love by local artisans — Shop the finest handcrafted products from Nepal',
      image:
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1920&auto=format&fit=crop&q=80',
      link: '/products',
      sortOrder: 1,
    },
    {
      title: 'New Arrivals — Dhaka Collection',
      subtitle:
        'Explore our latest Dhaka fabric products woven by master weavers of Palpa',
      image:
        'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=1920&auto=format&fit=crop&q=80',
      link: '/products?category=dhaka-products',
      sortOrder: 2,
    },
    {
      title: 'Support Local Artisans',
      subtitle:
        'Every purchase directly supports Nepalese artisan families and preserves traditional crafts',
      image:
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1920&auto=format&fit=crop&q=80',
      link: '/about',
      sortOrder: 3,
    },
  ];

  await prisma.banner.deleteMany();

  for (const banner of banners) {
    await prisma.banner.create({
      data: banner,
    });
  }

  console.log(`✅ ${banners.length} homepage banners seeded`);

  // 6. Create Coupon
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: '10% off on your first order',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 500,
      maxDiscount: 1000,
      usageLimit: 1000,
      isActive: true,
      validFrom: new Date(),
      validUntil: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ),
    },
  });

  console.log('✅ Coupon WELCOME10 seeded');

  console.log('\n🎉 Complete Database Seeding Finished!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });