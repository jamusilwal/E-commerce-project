import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlineCurrencyDollar,
  HiOutlineHeart,
  HiOutlineStar,
  HiOutlineShoppingBag,
} from 'react-icons/hi';
import { APP_NAME, APP_TAGLINE, CATEGORIES } from '../../utils/constants';
import { formatPrice } from '../../utils/helpers';
import productService from '../../services/productService';
import { useCart } from '../../context/CartContext';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await productService.getProducts({ limit: 4 });
        setFeaturedProducts(res.data.data.products);
      } catch {
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div>
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-white to-secondary">
        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.02] rounded-full" />
        </div>

        <div className="container-custom relative">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 py-16 md:py-20 lg:py-28">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex-1 text-center lg:text-left max-w-2xl"
            >
              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Authentic Nepalese Handmade Products
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight"
              >
                Discover the Art of{' '}
                <span className="gradient-text">Nepal&apos;s</span>{' '}
                <span className="text-primary">Finest Crafts</span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-text-light text-base sm:text-lg mt-6 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                {APP_TAGLINE}. Support local artisans and bring home unique,
                handcrafted treasures that tell a story of tradition and skill.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4 mt-8"
              >
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-primary/25 group"
                >
                  Shop Now
                  <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-primary/20 text-primary font-semibold rounded-xl hover:bg-primary/5 transition-all"
                >
                  Our Story
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center justify-center lg:justify-start gap-8 mt-10"
              >
                {[
                  { value: '45+', label: 'Artisans' },
                  { value: '85+', label: 'Products' },
                  { value: '99+', label: 'Happy Customers' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</p>
                    <p className="text-xs text-text-muted mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Image Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex-1 relative hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden shadow-card-hover aspect-[3/4] bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <div className="text-center p-6">
                      <span className="text-6xl">🏺</span>
                      <p className="text-sm font-medium text-text-light mt-3">Traditional Pottery</p>
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-card-hover aspect-square bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center">
                    <div className="text-center p-6">
                      <span className="text-5xl">💎</span>
                      <p className="text-sm font-medium text-text-light mt-3">Handmade Jewelry</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="rounded-2xl overflow-hidden shadow-card-hover aspect-square bg-gradient-to-br from-secondary to-accent/10 flex items-center justify-center">
                    <div className="text-center p-6">
                      <span className="text-5xl">🪵</span>
                      <p className="text-sm font-medium text-text-light mt-3">Wooden Crafts</p>
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-card-hover aspect-[3/4] bg-gradient-to-br from-primary/5 to-secondary flex items-center justify-center">
                    <div className="text-center p-6">
                      <span className="text-6xl">🧵</span>
                      <p className="text-sm font-medium text-text-light mt-3">Dhaka Topi &amp; Textiles</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED CATEGORIES ===== */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.p
              variants={fadeInUp}
              className="text-accent font-semibold text-sm uppercase tracking-wider"
            >
              Browse Our Collection
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mt-2 font-[Playfair_Display]"
            >
              Shop by Category
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-text-light mt-3 max-w-2xl mx-auto">
              Explore our curated categories of authentic Nepalese handmade products,
              each crafted with love and tradition.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {CATEGORIES.map((category) => (
              <motion.div key={category.id} variants={fadeInUp}>
                <Link
                  to={`/products?category=${category.id}`}
                  className="group flex flex-col items-center p-6 rounded-2xl bg-surface hover:bg-primary/5 border border-border-light hover:border-primary/20 transition-all hover:shadow-card-hover"
                >
                  <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </span>
                  <span className="text-sm font-medium text-text group-hover:text-primary transition-colors text-center">
                    {category.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="section-padding bg-surface">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.p
              variants={fadeInUp}
              className="text-accent font-semibold text-sm uppercase tracking-wider"
            >
              Handpicked For You
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mt-2 font-[Playfair_Display]"
            >
              Featured Products
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-text-light mt-3 max-w-2xl mx-auto">
              Discover our most loved handmade products, chosen for their quality,
              craftsmanship, and cultural significance.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-white rounded-2xl border border-border-light animate-pulse p-4" />
              ))
            ) : (
              featuredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={fadeInUp}
                  className="group bg-white rounded-2xl border border-border-light overflow-hidden hover:shadow-card-hover transition-all flex flex-col justify-between"
                >
                  <div>
                    <Link to={`/products/${product.slug}`} className="block aspect-square bg-surface overflow-hidden relative">
                      <img
                        src={product.images?.[0]?.url || 'https://placehold.co/400x400'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.comparePrice > product.price && (
                        <span className="absolute top-3 left-3 bg-accent text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                          SALE
                        </span>
                      )}
                    </Link>
                    <div className="p-4">
                      <p className="text-xs text-accent font-semibold uppercase tracking-wider">
                        {product.category?.name}
                      </p>
                      <Link
                        to={`/products/${product.slug}`}
                        className="font-bold text-text hover:text-primary transition-colors line-clamp-1 mt-1 block"
                      >
                        {product.name}
                      </Link>
                      <div className="flex items-center gap-1 mt-2 text-accent">
                        <HiOutlineStar className="w-4 h-4 fill-current" />
                        <span className="text-xs font-bold text-text">{product.avgRating.toFixed(1)}</span>
                        <span className="text-xs text-text-muted">({product.totalReviews || 0})</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-between border-t border-border-light mt-2 pt-3">
                    <div>
                      <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
                      {product.comparePrice > product.price && (
                        <span className="text-xs text-text-muted line-through ml-1.5">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product.id, 1)}
                      className="p-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl transition-all"
                      title="Add to Cart"
                    >
                      <HiOutlineShoppingBag className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          <div className="text-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-all group"
            >
              View All Products
              <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="section-padding bg-secondary/50">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.p
              variants={fadeInUp}
              className="text-accent font-semibold text-sm uppercase tracking-wider"
            >
              Why {APP_NAME}
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mt-2 font-[Playfair_Display]"
            >
              Why Choose Us
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: HiOutlineShieldCheck,
                title: '100% Authentic',
                description: 'Every product is verified as genuinely handmade by Nepalese artisans.',
              },
              {
                icon: HiOutlineTruck,
                title: 'Fast Delivery',
                description: 'Nationwide delivery across Nepal with real-time order tracking.',
              },
              {
                icon: HiOutlineCurrencyDollar,
                title: 'Fair Prices',
                description: 'Artisans set their own prices. No middlemen, fair compensation.',
              },
              {
                icon: HiOutlineHeart,
                title: 'Support Local',
                description: 'Every purchase directly supports Nepalese artisan families.',
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="group p-6 rounded-2xl bg-white border border-border-light hover:border-primary/20 hover:shadow-card-hover transition-all text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                  <feature.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold mt-4">{feature.title}</h3>
                <p className="text-text-light text-sm mt-2 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== MEET OUR ARTISANS ===== */}
      <section className="section-padding bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex-1"
            >
              <p className="text-accent font-semibold text-sm uppercase tracking-wider">
                Our Artisans
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 text-white font-[Playfair_Display]">
                Meet the Hands Behind the Craft
              </h2>
              <p className="text-white/70 mt-4 leading-relaxed">
                Behind every product is an artisan with decades of experience, preserving
                Nepal&apos;s rich cultural heritage. From the pottery wheels of Bhaktapur to
                the weaving looms of Palpa, each piece tells a unique story.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Verified artisans from across Nepal',
                  'Fair trade and ethical practices',
                  'Traditional techniques preserved for generations',
                  'Direct support to artisan families',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white/80">
                    <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <span className="w-2 h-2 rounded-full bg-accent" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1 grid grid-cols-2 gap-4"
            >
              {[
                { name: 'Ram Shrestha', craft: 'Master Potter, Bhaktapur', emoji: '🏺' },
                { name: 'Sita Tamang', craft: 'Jewelry Artisan, Patan', emoji: '💎' },
                { name: 'Hari Maharjan', craft: 'Wood Carver, Kirtipur', emoji: '🪵' },
                { name: 'Maya Gurung', craft: 'Dhaka Weaver, Palpa', emoji: '🧵' },
              ].map((artisan) => (
                <div
                  key={artisan.name}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl mb-3">
                    {artisan.emoji}
                  </div>
                  <h4 className="font-semibold text-white">{artisan.name}</h4>
                  <p className="text-sm text-white/60 mt-0.5">{artisan.craft}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
