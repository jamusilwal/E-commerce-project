import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuArrowRight,
  LuChevronLeft,
  LuChevronRight,
  LuShieldCheck,
  LuTag,
  LuUsers,
  LuSparkles,
  LuHeart,
  LuMail,
  LuTruck,
  LuRotateCcw,
  LuLock,
  LuHeadphones,
  LuLayoutGrid,
  LuBadgeCheck,
} from 'react-icons/lu';
import toast from 'react-hot-toast';
import { getInitials, isValidEmail } from '../../utils/helpers';
import useCategories from '../../hooks/useCategories';
import { getCategoryStyle } from '../../utils/categoryIcons';
import productService from '../../services/productService';
import ProductCard from '../../components/product/ProductCard';
import Stars from '../../components/product/Stars';

// ---------------------------------------------------------------------------
// Static content
// ---------------------------------------------------------------------------

const heroSlides = [
  {
    title: ['Elevate Your', 'Everyday'],
    description:
      "Discover quality handmade products across every category — crafted by Nepal's finest artisans for the way you live.",
    cta: { label: 'Shop Now', to: '/products' },
    images: {
      main: '/images/lokta-lamp-shade.jpg',
      side: '/images/terracotta-elephant-planter.jpg',
      small: '/images/Handcrafted Seven-Metal Singing Bowl Set.jpg',
    },
    badge: { eyebrow: 'Festive Sale', label: 'Up to', value: '40%', suffix: 'Off' },
  },
  {
    title: ['Crafted by Hand,', 'Made to Last'],
    description:
      'Wood carvings, brass statues and silverwork shaped with techniques passed down through generations.',
    cta: { label: 'Explore Crafts', to: '/products?category=wooden-crafts' },
    images: {
      main: '/images/wooden-peacock-window.jpg',
      side: '/images/brass-buddha-statue.jpg',
      small: '/images/silver-turquoise-ring.jpg',
    },
    badge: { eyebrow: 'New Season', label: 'Just', value: 'In', suffix: '' },
  },
  {
    title: ['Wear the', 'Heritage'],
    description:
      'Soft pashmina, hand-woven Dhaka and cosy yak wool — timeless textiles for every season.',
    cta: { label: 'Shop Textiles', to: '/products?category=dhaka-products' },
    images: {
      main: '/images/yak-wool-knitwear.jpg',
      side: '/images/pasmina.jpeg',
      small: '/images/palpali-dhaka-topi.jpg',
    },
    badge: { eyebrow: 'Winter Edit', label: 'Up to', value: '25%', suffix: 'Off' },
  },
];

const heroHighlights = [
  { icon: LuShieldCheck, label: 'Premium Quality' },
  { icon: LuTag, label: 'Great Prices' },
  { icon: LuUsers, label: 'Trusted by 10K+ Customers' },
];

const promoBanners = [
  {
    eyebrow: 'New Arrivals',
    title: ['Fresh Styles', 'Just In'],
    to: '/products?sort=newest',
    image: '/images/allo-shoulder-bag.jpg',
    bg: 'bg-promo-green',
  },
  {
    eyebrow: 'Home Refresh',
    title: ['Make Your', 'Space Better'],
    to: '/products?category=home-decor',
    image: '/images/terracotta-ghyampo.jpg',
    bg: 'bg-promo-peach',
  },
  {
    eyebrow: 'Gift Essentials',
    title: ['Gifts That', 'Tell a Story'],
    to: '/products?category=handmade-gifts',
    image: '/images/herbal-soap-gift-box.jpg',
    bg: 'bg-promo-blue',
  },
];

const testimonials = [
  {
    name: 'Sarah J.',
    text: 'Amazing quality and fast delivery! The singing bowl sounds beautiful — this is my go-to store for gifts.',
  },
  {
    name: 'Michael T.',
    text: 'Great prices, excellent customer service, and super easy returns. Highly recommend!',
  },
  {
    name: 'Priya K.',
    text: 'I love the variety they offer. I can find everything from pottery to pashmina in one place. So convenient!',
  },
  {
    name: 'Anish S.',
    text: 'Knowing my purchase supports the artisan directly makes every order feel special. Beautiful packaging too.',
  },
  {
    name: 'Emma L.',
    text: 'The Dhaka shawl is even prettier in person. Shipping abroad was quick and tracking was spot on.',
  },
  {
    name: 'Rohan M.',
    text: 'Checkout with eSewa was seamless and the order arrived two days early. Will definitely shop again.',
  },
];

const avatarColors = ['bg-[#F6E7DC] text-[#8A4B2A]', 'bg-[#E4EEF7] text-[#2F5D8A]', 'bg-[#EEE7F6] text-[#5E4690]'];

const serviceFeatures = [
  { icon: LuTruck, title: 'Free Shipping', text: 'On orders over Rs. 5,000' },
  { icon: LuRotateCcw, title: 'Easy Returns', text: '30 days return policy' },
  { icon: LuLock, title: 'Secure Payments', text: '100% secure checkout' },
  { icon: LuHeadphones, title: '24/7 Support', text: "We're here to help" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

const ScrollButton = ({ direction, onClick, className = '' }) => {
  const Icon = direction === 'left' ? LuChevronLeft : LuChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-10 h-10 rounded-full bg-white border border-border shadow-card flex items-center justify-center text-text hover:bg-primary hover:text-white hover:border-primary transition-all ${className}`}
      aria-label={direction === 'left' ? 'Scroll left' : 'Scroll right'}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
};

/** Horizontal scroller helper — scrolls one "page" of the track at a time */
const useScroller = () => {
  const ref = useRef(null);
  const scroll = useCallback((direction) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: (direction === 'left' ? -1 : 1) * el.clientWidth * 0.9, behavior: 'smooth' });
  }, []);
  return [ref, scroll];
};

const SectionCard = ({ children, className = '' }) => (
  <motion.section
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-60px' }}
    variants={fadeInUp}
    className={`bg-white rounded-2xl border border-border-light shadow-card ${className}`}
  >
    {children}
  </motion.section>
);

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

const Hero = () => {
  const [active, setActive] = useState(0);
  const slide = heroSlides[active];

  useEffect(() => {
    const timer = setInterval(() => setActive((i) => (i + 1) % heroSlides.length), 6000);
    return () => clearInterval(timer);
  }, [active]);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EFEBE0] via-[#ECE7DA] to-[#E2DCCB] min-h-[440px] lg:min-h-[460px]">
      {/* Decorative foliage */}
      <svg
        className="absolute right-[38%] -bottom-20 w-72 h-72 text-primary/[0.06] rotate-12 pointer-events-none hidden lg:block"
        viewBox="0 0 200 200"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M100 10c40 30 60 70 40 120-10 25-30 45-40 60-10-15-30-35-40-60C40 80 60 40 100 10z" />
      </svg>
      <div className="absolute right-[30%] top-0 w-80 h-80 bg-white/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative grid lg:grid-cols-[1fr_1.15fr] gap-8 px-6 sm:px-10 lg:px-14 pt-10 pb-14 lg:py-0 h-full">
        {/* Copy */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col justify-center lg:py-14"
          >
            <h1 className="text-4xl sm:text-5xl xl:text-[56px] font-bold text-primary-dark leading-[1.1] tracking-tight">
              {slide.title[0]}
              <br />
              {slide.title[1]}
            </h1>
            <p className="text-text-light text-base sm:text-lg mt-5 max-w-md leading-relaxed">
              {slide.description}
            </p>
            <div className="mt-8">
              <Link
                to={slide.cta.to}
                className="group inline-flex items-center gap-3 px-7 py-3.5 bg-primary hover:bg-primary-light text-white text-sm font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-primary/20"
              >
                {slide.cta.label}
                <LuArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <ul className="flex flex-wrap items-center gap-x-7 gap-y-3 mt-10">
              {heroHighlights.map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-xs text-text">
                  <item.icon className="w-5 h-5 text-primary" strokeWidth={1.6} />
                  <span className="max-w-[90px] leading-tight">{item.label}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        {/* Image collage */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative hidden md:block h-[380px] lg:h-full lg:min-h-[460px]"
          >
            <div className="absolute left-[4%] right-[26%] top-[10%] bottom-[12%] rounded-3xl overflow-hidden shadow-2xl shadow-primary-dark/20 bg-white">
              <img src={slide.images.main} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute right-[4%] top-[34%] w-[30%] aspect-[3/4] rounded-2xl overflow-hidden shadow-xl shadow-primary-dark/20 border-4 border-white bg-white">
              <img src={slide.images.side} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute left-0 bottom-[13%] w-[24%] aspect-square rounded-2xl overflow-hidden shadow-xl shadow-primary-dark/20 border-4 border-white bg-white">
              <img src={slide.images.small} alt="" className="w-full h-full object-cover" />
            </div>

            {/* Sale badge */}
            <div className="absolute right-0 top-0 bg-primary-dark text-white text-center rounded-b-xl px-4 pt-4 pb-3 shadow-lg">
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-sage">
                {slide.badge.eyebrow.split(' ')[0]}
              </p>
              <p className="text-xl font-[Playfair_Display] font-bold uppercase leading-none">
                {slide.badge.eyebrow.split(' ').slice(1).join(' ') || 'Sale'}
              </p>
              <div className="w-8 h-px bg-white/30 mx-auto my-2" />
              <p className="text-[10px] uppercase tracking-wider text-white/70">{slide.badge.label}</p>
              <p className="text-3xl font-bold text-sage leading-none">{slide.badge.value}</p>
              {slide.badge.suffix && (
                <p className="text-[10px] uppercase tracking-wider text-white/70 mt-0.5">{slide.badge.suffix}</p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-primary' : 'w-2 bg-primary/25 hover:bg-primary/40'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

const CategoryStrip = () => {
  const categories = useCategories();

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={fadeInUp}
      className="bg-white rounded-2xl border border-border-light shadow-card py-5 px-3 sm:px-5"
    >
      <ul className="flex lg:justify-between gap-4 overflow-x-auto no-scrollbar">
        {categories.map((category) => {
          const style = getCategoryStyle(category.slug);
          return (
            <li key={category.id} className="shrink-0 w-[84px]">
              <Link to={`/products?category=${category.id}`} className="group flex flex-col items-center text-center">
                <span
                  className={`w-16 h-16 lg:w-[68px] lg:h-[68px] rounded-full ${style.bg} ${style.color} flex items-center justify-center ring-4 ring-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] group-hover:-translate-y-1 group-hover:shadow-card-hover transition-all`}
                >
                  <style.icon className="w-7 h-7" strokeWidth={1.5} />
                </span>
                <span className="mt-2.5 text-xs font-medium text-text group-hover:text-primary leading-tight">
                  {category.name}
                </span>
              </Link>
            </li>
          );
        })}
        <li className="shrink-0 w-[84px]">
          <Link to="/categories" className="group flex flex-col items-center text-center">
            <span className="w-16 h-16 lg:w-[68px] lg:h-[68px] rounded-full bg-white border border-border text-primary flex items-center justify-center group-hover:-translate-y-1 group-hover:shadow-card-hover transition-all">
              <LuLayoutGrid className="w-6 h-6" strokeWidth={1.5} />
            </span>
            <span className="mt-2.5 text-xs font-medium text-text group-hover:text-primary">View All</span>
          </Link>
        </li>
      </ul>
    </motion.section>
  );
};

const TopPicks = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackRef, scroll] = useScroller();

  useEffect(() => {
    productService
      .getProducts({ limit: 10, sort: 'popularity' })
      .then((res) => setProducts(res.data.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SectionCard className="p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="flex items-center gap-2 text-xl sm:text-2xl text-primary-dark">
          Top Picks For You
          <LuSparkles className="w-5 h-5 text-accent" />
        </h2>
        <Link
          to="/products?sort=popularity"
          className="group flex items-center gap-1.5 text-sm font-semibold text-text hover:text-primary"
        >
          See All Deals
          <LuArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="relative">
        <div ref={trackRef} className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1">
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[62%] sm:w-[38%] md:w-[30%] lg:w-[calc((100%-4*16px)/5)] h-80 rounded-xl animate-shimmer"
              />
            ))}
          {!loading &&
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className="shrink-0 snap-start w-[62%] sm:w-[38%] md:w-[30%] lg:w-[calc((100%-4*16px)/5)]"
              />
            ))}
          {!loading && products.length === 0 && (
            <div className="w-full py-12 text-center text-sm text-text-light">
              No products available right now.{' '}
              <Link to="/products" className="font-semibold text-primary hover:underline">
                Browse the shop
              </Link>
            </div>
          )}
        </div>

        {products.length > 5 && (
          <>
            <ScrollButton direction="left" onClick={() => scroll('left')} className="hidden lg:flex absolute -left-5 top-[40%]" />
            <ScrollButton direction="right" onClick={() => scroll('right')} className="hidden lg:flex absolute -right-5 top-[40%]" />
          </>
        )}
        {products.length > 1 && (
          <ScrollButton direction="right" onClick={() => scroll('right')} className="lg:hidden absolute -right-2 top-[40%]" />
        )}
      </div>
    </SectionCard>
  );
};

const PromoBanners = () => (
  <motion.section
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-60px' }}
    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    className="grid md:grid-cols-3 gap-4"
  >
    {promoBanners.map((banner) => (
      <motion.div key={banner.eyebrow} variants={fadeInUp}>
        <Link
          to={banner.to}
          className={`group relative flex items-center justify-between h-full min-h-[150px] overflow-hidden rounded-2xl ${banner.bg} p-6 hover:shadow-card-hover transition-shadow`}
        >
          <div className="relative z-10">
            <p className="text-xs font-medium text-text-light">{banner.eyebrow}</p>
            <h3 className="text-xl sm:text-2xl text-primary-dark mt-1.5 leading-tight">
              {banner.title[0]}
              <br />
              {banner.title[1]}
            </h3>
            <span className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-text group-hover:text-primary">
              Shop Now
              <LuArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
          <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-2xl overflow-hidden shadow-lg rotate-3 group-hover:rotate-0 group-hover:scale-105 transition-transform duration-500">
            <img src={banner.image} alt="" loading="lazy" className="w-full h-full object-cover" />
          </div>
        </Link>
      </motion.div>
    ))}
  </motion.section>
);

const Testimonials = () => {
  const [trackRef, scroll] = useScroller();

  return (
    <SectionCard className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="flex items-center gap-2 text-xl sm:text-2xl text-primary-dark">
          Loved By Thousands
          <LuHeart className="w-5 h-5 text-sale fill-sale" />
        </h2>
        <div className="flex items-center gap-2 text-sm text-text">
          <span className="font-medium">4.8/5 Average Rating</span>
          <Stars rating={5} className="w-4 h-4" />
        </div>
      </div>

      <div className="relative lg:px-8">
        <div ref={trackRef} className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory">
          {testimonials.map((review, idx) => (
            <figure
              key={review.name}
              className="shrink-0 snap-start w-[85%] sm:w-[48%] lg:w-[calc((100%-2*16px)/3)] flex gap-4 p-5 rounded-xl bg-surface"
            >
              <span
                className={`w-14 h-14 shrink-0 rounded-full ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-base font-bold`}
                aria-hidden="true"
              >
                {getInitials(review.name.replace('.', ''))}
              </span>
              <div>
                <figcaption className="flex items-center gap-1.5 text-sm font-semibold text-text">
                  {review.name}
                  <LuBadgeCheck className="w-4 h-4 text-primary-light" aria-label="Verified buyer" />
                </figcaption>
                <div className="mt-1">
                  <Stars rating={5} />
                </div>
                <blockquote className="text-[13px] text-text-light leading-relaxed mt-2">
                  &ldquo;{review.text}&rdquo;
                </blockquote>
              </div>
            </figure>
          ))}
        </div>

        <ScrollButton direction="left" onClick={() => scroll('left')} className="hidden lg:flex absolute -left-2 top-1/2 -translate-y-1/2" />
        <ScrollButton direction="right" onClick={() => scroll('right')} className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2" />
      </div>
    </SectionCard>
  );
};

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success('Thanks for subscribing!');
    setEmail('');
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={fadeInUp}
      className="relative overflow-hidden rounded-2xl bg-primary px-6 py-8 sm:px-10 lg:px-16"
    >
      <svg
        className="absolute -left-8 -top-8 w-48 h-48 text-white/[0.04] pointer-events-none"
        viewBox="0 0 200 200"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M100 10c40 30 60 70 40 120-10 25-30 45-40 60-10-15-30-35-40-60C40 80 60 40 100 10z" />
      </svg>

      <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-10 text-center sm:text-left">
          <span className="w-20 h-20 lg:w-24 lg:h-24 shrink-0 rounded-full bg-white flex items-center justify-center">
            <LuMail className="w-9 h-9 lg:w-10 lg:h-10 text-primary" strokeWidth={1.4} />
          </span>
          <div>
            <h2 className="text-2xl lg:text-[26px] text-white">Stay in the Loop</h2>
            <p className="text-sm text-white/75 mt-2 max-w-xs leading-relaxed">
              Get exclusive deals, new arrivals and style inspiration straight to your inbox.
            </p>
          </div>
        </div>

        <div className="w-full lg:max-w-md lg:ml-auto">
          <form onSubmit={handleSubmit} className="flex p-1.5 bg-white rounded-xl">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 min-w-0 px-3 text-sm text-text placeholder:text-text-muted bg-transparent"
              aria-label="Email address"
            />
            <button
              type="submit"
              className="px-6 sm:px-8 py-2.5 bg-sage hover:bg-sage-dark text-primary-dark text-sm font-semibold rounded-lg transition-colors"
            >
              Subscribe
            </button>
          </form>
          <p className="flex items-center gap-1.5 text-xs text-white/60 mt-3">
            <LuShieldCheck className="w-3.5 h-3.5 text-sage" />
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </motion.section>
  );
};

const ServiceStrip = () => (
  <section className="bg-white rounded-2xl border border-border-light shadow-card px-6 py-5">
    <ul className="grid grid-cols-2 lg:grid-cols-4 gap-y-5">
      {serviceFeatures.map((feature, idx) => (
        <li
          key={feature.title}
          className={`flex items-center justify-center gap-3.5 ${idx > 0 ? 'lg:border-l lg:border-border-light' : ''}`}
        >
          <feature.icon className="w-8 h-8 text-primary shrink-0" strokeWidth={1.4} />
          <div>
            <p className="text-sm font-semibold text-text">{feature.title}</p>
            <p className="text-xs text-text-light">{feature.text}</p>
          </div>
        </li>
      ))}
    </ul>
  </section>
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const Home = () => (
  <div className="bg-background">
    <div className="container-custom py-5 md:py-6 space-y-5 md:space-y-6">
      <Hero />
      <CategoryStrip />
      <TopPicks />
      <PromoBanners />
      <Testimonials />
      <Newsletter />
      <ServiceStrip />
    </div>
    <div className="h-8 md:h-10" />
  </div>
);

export default Home;
