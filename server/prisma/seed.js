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

  // 4. Create 22 Authentic Nepalese Handmade Products with 100 stocks each
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
      quantity: 100,
      imageUrl: '/images/pottery.webp',
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
      quantity: 100,
      imageUrl: '/images/silver-turquoise-ring.jpg',
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
      quantity: 100,
      imageUrl: '/images/palpali-dhaka-topi.jpg',
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
      quantity: 100,
      imageUrl: '/images/wooden-peacock-window.jpg',
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
      quantity: 100,
      imageUrl: '/images/hemp-backpack.jpg',
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
      quantity: 100,
      imageUrl: '/images/green-tara-thangka.jpg',
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
      quantity: 100,
      imageUrl: '/images/Handcrafted Seven-Metal Singing Bowl Set.jpg',
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
      quantity: 100,
      imageUrl: '/images/Blue-Handloom-Woolen-Dhaka-Shawl-with-Multicolor-Pattern-SWL-3248_157816__92812.webp',
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
      quantity: 100,
      imageUrl: '/images/bhairav mask.jpeg',
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
      quantity: 100,
      imageUrl: '/images/Handcrafted Bamboo Tea Canister & Coaster Set.jpeg',
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
      quantity: 100,
      imageUrl: '/images/pasmina.jpeg',
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
      quantity: 100,
      imageUrl: '/images/lokta-notebook.jpg',
    },
    {
      name: 'Patan Hand-Cast Antique Brass Buddha Statue',
      slug: 'patan-cast-brass-buddha-statue',
      categorySlug: 'home-decor',
      sellerShop: 'Patan Fine Silver & Filigree',
      price: 6800,
      comparePrice: 8000,
      materials: 'Solid Cast Brass, Hand-Chiseled Patina Detailing',
      description:
        'Masterfully hand-cast Shakyamuni Buddha statue handcrafted in Patan using lost-wax technique. Features serene meditative expression.',
      estimatedDelivery: '3-5 Business Days',
      isFeatured: true,
      quantity: 100,
      imageUrl: '/images/brass-buddha-statue.jpg',
    },
    {
      name: 'Authentic Mithila Kohbar Folk Art Painting',
      slug: 'authentic-mithila-kohbar-folk-art',
      categorySlug: 'paintings',
      sellerShop: 'Patan Fine Silver & Filigree',
      price: 4200,
      comparePrice: 5000,
      materials: 'Handmade Lokta Paper, Natural Plant Dyes & Bamboo Twig Brushes',
      description:
        'Traditional Mithila Kohbar wall art depicting auspicious symbols of harmony, hand-painted with natural plant dyes on artisanal Lokta paper.',
      estimatedDelivery: '3-5 Business Days',
      isFeatured: true,
      quantity: 100,
      imageUrl: '/images/mithila-folk-art.jpg',
    },
    {
      name: 'Traditional Hand-Forged Bhojpure Khukuri Knife',
      slug: 'traditional-hand-forged-bhojpure-khukuri',
      categorySlug: 'wooden-crafts',
      sellerShop: 'Himalayan Wood Carvings',
      price: 5500,
      comparePrice: 6500,
      materials: 'High Carbon Steel Blade, Carved Rosewood Handle, Buffalo Leather Scabbard',
      description:
        'Iconic Nepalese curved knife hand-forged by traditional Kami blacksmiths of Bhojpur. Features polished rosewood grip and dual utility knives.',
      estimatedDelivery: '4-6 Business Days',
      isFeatured: true,
      quantity: 100,
      imageUrl: '/images/bhojpure-khukuri.jpg',
    },
    {
      name: 'Handcrafted Nepalese Lokta Paper Hanging Lamp Shade',
      slug: 'handcrafted-lokta-paper-hanging-lamp-shade',
      categorySlug: 'home-decor',
      sellerShop: 'Bhaktapur Clay & Pottery Works',
      price: 1450,
      comparePrice: 1800,
      materials: 'Wild Himalayan Lokta Paper with Pressed Natural Wildflowers, Bamboo Frame',
      description:
        'Warm atmospheric hanging lamp shade handmade from sun-dried Himalayan Lokta bush bark embedded with real mountain wildflowers.',
      estimatedDelivery: '2-4 Business Days',
      isFeatured: true,
      quantity: 100,
      imageUrl: '/images/lokta-lamp-shade.jpg',
    },
    {
      name: 'Hand-Woven Natural Himalayan Hemp Laptop Tote Bag',
      slug: 'hand-woven-hemp-laptop-tote-bag',
      categorySlug: 'handmade-bags',
      sellerShop: 'Himalayan Wood Carvings',
      price: 2650,
      comparePrice: 3100,
      materials: '100% Wild Himalayan Hemp Fiber, Natural Cotton Lining, Brass Zippers',
      description:
        'Eco-friendly, highly resilient tote bag hand-woven from wild Himalayan hemp fibers. Features padded 15-inch laptop compartment and utility pockets.',
      estimatedDelivery: '2-4 Business Days',
      isFeatured: true,
      quantity: 100,
      imageUrl: '/images/hemp-laptop-bag.jpg',
    },
    {
      name: 'Bhaktapur Terracotta Handmade Elephant Garden Planter',
      slug: 'bhaktapur-terracotta-elephant-planter',
      categorySlug: 'pottery',
      sellerShop: 'Bhaktapur Clay & Pottery Works',
      price: 1850,
      comparePrice: 2200,
      materials: 'Red Terracotta Clay, Kiln-Fired Natural Finish',
      description:
        'Charming hand-sculpted elephant flower planter pot molded and wood-kiln fired in Pottery Square, Bhaktapur. Breathable earthen terracotta.',
      estimatedDelivery: '2-3 Business Days',
      isFeatured: true,
      quantity: 100,
      imageUrl: '/images/terracotta-elephant-planter.jpg',
    },
    {
      name: 'Authentic Himalayan Yak Wool Hand-Knitted Beanie & Gloves',
      slug: 'himalayan-yak-wool-beanie-gloves-set',
      categorySlug: 'traditional-clothing',
      sellerShop: 'Palpali Traditional Dhaka Weavers',
      price: 1950,
      comparePrice: 2400,
      materials: '100% Pure Himalayan Yak Wool, Cozy Microfleece Lining',
      description:
        'Chunky winter knitwear hand-crafted by Himalayan women cooperatives using pure, cruelty-free mountain yak wool with soft thermal lining.',
      estimatedDelivery: '3-5 Business Days',
      isFeatured: false,
      quantity: 100,
      imageUrl: '/images/yak-wool-knitwear.jpg',
    },
    {
      name: 'Hand-Carved Wooden Astamangala Incense Burner Box',
      slug: 'hand-carved-wooden-astamangala-incense-burner',
      categorySlug: 'wooden-crafts',
      sellerShop: 'Himalayan Wood Carvings',
      price: 1600,
      comparePrice: 1950,
      materials: 'Seasoned Sheesham Rosewood, Brass Inlay Latch',
      description:
        'Aromatherapy incense box hand-carved with the 8 Auspicious Buddhist Symbols. Includes brass burning tray and secret incense storage.',
      estimatedDelivery: '3-4 Business Days',
      isFeatured: false,
      quantity: 100,
      imageUrl: 'https://www.thepoojastore.com/cdn/shop/files/Sheesham_wood_agarbatti_stand_front_view.jpg?v=1782285578',
    },
    {
      name: 'Sacred Natural Bodhi Seed & Turquoise Meditation Mala',
      slug: 'sacred-bodhi-seed-turquoise-prayer-mala',
      categorySlug: 'handmade-jewelry',
      sellerShop: 'Patan Fine Silver & Filigree',
      price: 2200,
      comparePrice: 2600,
      materials: 'Authentic 108 Bodhi Tree Seeds, Raw Himalayan Turquoise, Coral Accents',
      description:
        'Sacred 108-bead meditation necklace hand-knotted in Boudha with genuine Bodhi tree seeds, blessed guru bead, and polished turquoise spacers.',
      estimatedDelivery: '2-4 Business Days',
      isFeatured: false,
      quantity: 100,
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsLeD4DkWH_AybpgB-IRKkA-I53fxzrvyRz7M9NO91FVh_k9FWkqzIH8I&s=10',
    },
    {
      name: 'Handwoven Bamboo Multi-Purpose Storage Basket (Dalo)',
      slug: 'handwoven-bamboo-multipurpose-dalo-basket',
      categorySlug: 'bamboo-crafts',
      sellerShop: 'Bhaktapur Clay & Pottery Works',
      price: 1200,
      comparePrice: 1500,
      materials: 'Split Green Bamboo Canes, Natural Vegetable Fiber Binding',
      description:
        'Traditional Nepalese Dalo basket woven tightly by hand from mountain bamboo strips. Perfect for fruit, bread, or rustic home organization.',
      estimatedDelivery: '2-4 Business Days',
      isFeatured: false,
      quantity: 100,
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9NJn6QCi7i-LUPtmOeInWT_3k4Fsv1bJQpwxvr9ThZA&s=10',
    },
    {
      name: 'Traditional Brass Karuwa Water Pot',
      slug: 'traditional-brass-karuwa-water-pot',
      categorySlug: 'home-decor',
      sellerShop: 'Patan Fine Silver & Filigree',
      price: 2400,
      comparePrice: 2800,
      materials: 'Solid Hand-Cast Brass, Hand-Etched Floral Motif',
      description:
        'Traditional Nepalese spout vessel (Karuwa) hand-cast in Patan. Used for hospitality, sacred rituals, and royal home aesthetics.',
      estimatedDelivery: '2-4 Business Days',
      isFeatured: true,
      quantity: 100,
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT74dOgXx1pIb_A8qViAfyKUnKh76u3EGv_SVq-DXjdOLyKNqoEAGsQc8Qk&s=10',
    },
    {
      name: 'Handmade Himalayan Wild Nettle (Allo) Shoulder Bag',
      slug: 'himalayan-wild-allo-shoulder-bag',
      categorySlug: 'handmade-bags',
      sellerShop: 'Himalayan Wood Carvings',
      price: 2100,
      comparePrice: 2500,
      materials: '100% Wild Himalayan Giant Nettle (Allo) Fiber, Cotton Lining',
      description:
        'Handspun and handwoven shoulder bag crafted from wild stinging nettle fibers harvested in Eastern Nepal. Strong, eco-friendly, and lightweight.',
      estimatedDelivery: '3-5 Business Days',
      isFeatured: true,
      quantity: 100,
      imageUrl: '/images/allo-shoulder-bag.jpg',
    },
    {
      name: 'Handmade Terracotta Ghyampo Ceramic Urn',
      slug: 'handmade-terracotta-ghyampo-urn',
      categorySlug: 'pottery',
      sellerShop: 'Bhaktapur Clay & Pottery Works',
      price: 1650,
      comparePrice: 1950,
      materials: 'Bhaktapur Black & Red Clay Mixture',
      description:
        'Traditional miniature Ghyampo earthen storage jar with lid, hand-turned and kiln-baked by pottery masters in Bhaktapur.',
      estimatedDelivery: '2-3 Business Days',
      isFeatured: false,
      quantity: 100,
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5dDmCMi0kmuW5MHK6-qsGlSCI0SqigMsYPy3_zRJLXU86nfKTgEaW_jWH&s=10',
    },
    {
      name: 'Palpali Handloom Dhaka Table Runner & Mats Set',
      slug: 'palpali-handloom-dhaka-table-runner-set',
      categorySlug: 'dhaka-products',
      sellerShop: 'Palpali Traditional Dhaka Weavers',
      price: 2300,
      comparePrice: 2700,
      materials: 'Hand-Woven Pure Palpali Cotton Dhaka',
      description:
        'Exquisite 5-piece dining set featuring 1 long table runner and 4 matching place mats hand-woven with vibrant Palpali geometric motifs.',
      estimatedDelivery: '3-5 Business Days',
      isFeatured: true,
      quantity: 100,
      imageUrl: 'https://static-01.daraz.com.bd/p/a118ada823fbc9a0b77783282839d814.jpg',
    },
    {
      name: 'Traditional Hand-Carved Newari Wooden Bajra Stand',
      slug: 'hand-carved-newari-wooden-bajra-stand',
      categorySlug: 'wooden-crafts',
      sellerShop: 'Himalayan Wood Carvings',
      price: 1900,
      comparePrice: 2300,
      materials: 'Himalayan Walnut Wood, Natural Beeswax Polish',
      description:
        'Intricately carved ceremonial wooden pedestal featuring traditional Newari lotus carvings, hand-chiseled in Kirtipur.',
      estimatedDelivery: '3-5 Business Days',
      isFeatured: false,
      quantity: 100,
      imageUrl: 'https://www.handmadeexpo.com/pics/product/28999.jpg',
    },
    {
      name: 'Hand-Painted Mandala Wheel of Life Thangka',
      slug: 'hand-painted-mandala-wheel-of-life-thangka',
      categorySlug: 'paintings',
      sellerShop: 'Patan Fine Silver & Filigree',
      price: 12000,
      comparePrice: 15000,
      materials: 'Organic Cotton Canvas, Natural Ground Stone Pigments, Gold Dust',
      description:
        'Sacred Bhavachakra (Wheel of Life) Buddhist meditation painting, hand-rendered with microscopic detail by Thangka masters.',
      estimatedDelivery: '5-7 Business Days',
      isFeatured: true,
      quantity: 100,
      imageUrl: 'https://i.etsystatic.com/23787288/r/il/eee82a/7735638695/il_300x300.7735638695_g38v.jpg',
    },
    {
      name: 'Handmade Natural Hemp & Jute Yoga Mat',
      slug: 'handmade-hemp-jute-yoga-mat',
      categorySlug: 'handmade-gifts',
      sellerShop: 'Bhaktapur Clay & Pottery Works',
      price: 2750,
      comparePrice: 3200,
      materials: 'Organic Wild Himalayan Hemp, Natural Jute Weave, Rubberized Base',
      description:
        'Eco-friendly, slip-resistant yoga and meditation mat hand-woven from organic Himalayan fibers. Naturally antimicrobial and durable.',
      estimatedDelivery: '2-4 Business Days',
      isFeatured: false,
      quantity: 100,
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFFZdJLx4EXclcna_xAH6B4Ixx0F_mfSU7wiLA7va8ODdsjW_f2mYoiDsn&s=10',
    },
    {
      name: 'Authentic Newari Sukunda Brass Ritual Oil Lamp',
      slug: 'authentic-newari-sukunda-brass-oil-lamp',
      categorySlug: 'home-decor',
      sellerShop: 'Patan Fine Silver & Filigree',
      price: 4500,
      comparePrice: 5200,
      materials: 'Heavy Gauge Brass with Ganesha Carving',
      description:
        'Iconic traditional Newari oil lamp (Sukunda) featuring an ornate Lord Ganesha shrine and oil reservoir spoon. Handcrafted in Lalitpur.',
      estimatedDelivery: '3-5 Business Days',
      isFeatured: true,
      quantity: 100,
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0s9rQ_dWbTz8Afwkz7ga64ufaXdNtxUT7sPdfW43OuVEwuHF1rqhszA&s=10',
    },
    {
      name: 'Handwoven Bamboo Fruit Basket with Net Cover',
      slug: 'handwoven-bamboo-fruit-basket-chhati',
      categorySlug: 'bamboo-crafts',
      sellerShop: 'Bhaktapur Clay & Pottery Works',
      price: 950,
      comparePrice: 1200,
      materials: 'Fine Split Bamboo, Hand-Knitted Breathable Food Net',
      description:
        'Traditional eco-friendly kitchen basket with pull-string protective dome net for keeping dried foods, rotis, and fruits safe from insects.',
      estimatedDelivery: '2-3 Business Days',
      isFeatured: false,
      quantity: 100,
      imageUrl: 'https://m.media-amazon.com/images/I/51Kc3OC+gQL._AC_UF1000,1000_QL80_.jpg',
    },
    {
      name: 'Traditional Hand-Stitched Leather & Dhaka Mojari Shoes',
      slug: 'traditional-dhaka-mojari-shoes',
      categorySlug: 'traditional-clothing',
      sellerShop: 'Palpali Traditional Dhaka Weavers',
      price: 2500,
      comparePrice: 3000,
      materials: 'Genuine Buffalo Leather, Handloom Dhaka Upper, Cushioned Insole',
      description:
        'Festive ethnic Mojari slip-on shoes crafted with genuine leather soles and vibrant hand-woven Palpali Dhaka fabric.',
      estimatedDelivery: '3-5 Business Days',
      isFeatured: false,
      quantity: 100,
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlIOea6Vs4-l0dKVuYxpcMm6eAsTu90w3Z1NsCkHIRVg&s=10',
    },
    {
      name: 'Silver Filigree Mandala Pendant Necklace',
      slug: 'silver-filigree-mandala-pendant-necklace',
      categorySlug: 'handmade-jewelry',
      sellerShop: 'Patan Fine Silver & Filigree',
      price: 3400,
      comparePrice: 4000,
      materials: '925 Sterling Silver, Himalayan Lapis Lazuli Gemstone',
      description:
        'Intricate handcrafted filigree silver mandala pendant holding a deep royal blue lapis lazuli stone, crafted by Patan silversmiths.',
      estimatedDelivery: '3-4 Business Days',
      isFeatured: true,
      quantity: 100,
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTf_kcvCxfWW-mIUmAzqAd0TYO6hLVkwuufAClc4y7Sov6cRvzHnrotqIk&s=10',
    },
    {
      name: 'Handmade Himalayan Herbal Soap & Lokta Gift Box',
      slug: 'himalayan-herbal-soap-lokta-gift-box',
      categorySlug: 'handmade-gifts',
      sellerShop: 'Bhaktapur Clay & Pottery Works',
      price: 1150,
      comparePrice: 1400,
      materials: 'Himalayan Pine, Juniper & Yak Milk Soaps, Handmade Lokta Paper Gift Box',
      description:
        'Artisan wellness gift set containing 3 cold-pressed organic Himalayan soaps wrapped in flower-pressed Lokta paper in an artisan gift box.',
      estimatedDelivery: '2-3 Business Days',
      isFeatured: false,
      quantity: 100,
      imageUrl: '/images/herbal-soap-gift-box.jpg',
    },
  ];

  // Seed products and UPDATE existing product images and inventory
  for (const prod of productsData) {
    const categoryId = categoryMap[prod.categorySlug];
    const sellerId = sellerMap[prod.sellerShop];

    const createdProduct = await prisma.product.upsert({
      where: { slug: prod.slug },

      // Update existing product
      update: {
        name: prod.name,
        description: prod.description,
        shortDescription: prod.description.substring(0, 100) + '...',
        materials: prod.materials,
        price: prod.price,
        comparePrice: prod.comparePrice,
        isFeatured: prod.isFeatured,
        estimatedDelivery: prod.estimatedDelivery,
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
            quantity: 100,
          },
        },
      },
    });

    // Ensure inventory is always 100 stocks
    await prisma.inventory.upsert({
      where: { productId: createdProduct.id },
      update: { quantity: 100 },
      create: {
        productId: createdProduct.id,
        quantity: 100,
      },
    });

    // Update or create product image
    const existingImage = await prisma.productImage.findFirst({
      where: {
        productId: createdProduct.id,
        isPrimary: true,
      },
    });

    if (existingImage) {
      await prisma.productImage.update({
        where: { id: existingImage.id },
        data: { url: prod.imageUrl, altText: prod.name },
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

  // Ensure ALL products in database have exactly 100 stocks
  await prisma.inventory.updateMany({
    data: { quantity: 100 },
  });

  console.log(
    `✅ ${productsData.length} Authentic Nepalese Handmade Products seeded (all with 100 stocks)`
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