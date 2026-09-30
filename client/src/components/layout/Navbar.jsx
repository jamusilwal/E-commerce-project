import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuSearch,
  LuUser,
  LuHeart,
  LuShoppingCart,
  LuMenu,
  LuX,
  LuLogOut,
  LuSettings,
  LuClipboardList,
  LuTruck,
  LuRotateCcw,
  LuLock,
  LuChevronDown,
  LuChevronRight,
  LuStore,
} from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import useCategories from '../../hooks/useCategories';
import { getCategoryStyle } from '../../utils/categoryIcons';
import Logo from '../common/Logo';

const announcements = [
  { icon: LuTruck, text: 'Free Shipping on Orders Over Rs. 5,000' },
  { icon: LuRotateCcw, text: '30-Day Easy Returns' },
  { icon: LuLock, text: 'Secure Payments' },
];

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Shop' },
  { to: '/products?sort=popularity', label: 'Deals' },
  { to: '/products?sort=newest', label: 'New Arrivals' },
  { to: '/categories', label: 'Categories' },
  { to: '/about', label: 'Inspiration' },
  { to: '/orders', label: 'Track Order' },
];

const Badge = ({ count }) =>
  count > 0 ? (
    <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
      {count > 99 ? '99+' : count}
    </span>
  ) : null;

const Navbar = () => {
  const { user, isAuthenticated, isSeller, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const categories = useCategories();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setIsUserMenuOpen(false);
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) setIsCategoryMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCategoryMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const isLinkActive = (to) => {
    const [path, query] = to.split('?');
    if (path === '/') return location.pathname === '/';
    if (query) return location.pathname === path && location.search === `?${query}`;
    return location.pathname === path && !location.search;
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate('/auth/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value.trim();
    if (query) navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  const searchForm = (
    <form onSubmit={handleSearch} className="relative flex w-full" role="search">
      <input
        name="search"
        type="search"
        placeholder="Search handmade products, categories and more..."
        className="w-full h-11 pl-5 pr-16 bg-surface border border-border rounded-full text-sm placeholder:text-text-muted focus:bg-white focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
        aria-label="Search products"
      />
      <button
        type="submit"
        className="absolute right-1 top-1 bottom-1 w-14 bg-primary hover:bg-primary-light text-white rounded-full flex items-center justify-center transition-colors"
        aria-label="Submit search"
      >
        <LuSearch className="w-[18px] h-[18px]" />
      </button>
    </form>
  );

  const portalLink = isSeller
    ? { to: '/seller/dashboard', label: 'Seller Portal' }
    : isAdmin
      ? { to: '/admin/dashboard', label: 'Admin Panel' }
      : { to: '/seller/register', label: 'Become a Seller' };

  return (
    <>
      {/* ===== Announcement Bar ===== */}
      <div className="bg-primary-dark text-white text-[11px] sm:text-xs">
        <div className="container-custom flex items-center justify-center py-2">
          {announcements.map((item, idx) => (
            <div
              key={item.text}
              className={`items-center gap-2 font-medium ${idx === 0 ? 'flex' : 'hidden md:flex'}`}
            >
              {idx > 0 && <span className="mx-6 h-3 w-px bg-white/30" aria-hidden="true" />}
              <item.icon className="w-3.5 h-3.5 text-sage" />
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* ===== Main Header ===== */}
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
          isScrolled ? 'shadow-[0_4px_20px_rgba(15,46,34,0.08)]' : 'border-b border-border-light'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-10 h-[72px] md:h-20">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden -ml-2 p-2 rounded-lg text-text hover:bg-surface"
              aria-label="Open menu"
            >
              <LuMenu className="w-6 h-6" />
            </button>

            <Logo />

            {/* Search (desktop) */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-auto">{searchForm}</div>

            {/* Right Controls */}
            <div className="flex items-center gap-3.5 sm:gap-6 ml-auto md:ml-0">
              {/* Account */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen((open) => !open)}
                    className="flex flex-col items-center gap-1 text-text hover:text-primary transition-colors"
                    aria-haspopup="menu"
                    aria-expanded={isUserMenuOpen}
                  >
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
                      {user.firstName?.charAt(0)}
                    </span>
                    <span className="hidden sm:flex items-center gap-0.5 text-[11px] font-medium max-w-[80px] truncate">
                      {user.firstName}
                      <LuChevronDown className="w-3 h-3" />
                    </span>
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-3 w-60 bg-white rounded-2xl shadow-dropdown border border-border-light p-2 z-50"
                        role="menu"
                      >
                        <div className="p-3 border-b border-border-light">
                          <p className="text-sm font-semibold text-text truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-text-muted truncate">{user.email}</p>
                          <span className="inline-block mt-1.5 bg-sage text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {user.role}
                          </span>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/orders"
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-text hover:bg-surface rounded-xl"
                          >
                            <LuClipboardList className="w-4 h-4 text-text-muted" />
                            My Orders
                          </Link>
                          {!isAdmin && (
                            <Link
                              to="/wishlist"
                              className="flex items-center gap-2.5 px-3 py-2 text-sm text-text hover:bg-surface rounded-xl"
                            >
                              <LuHeart className="w-4 h-4 text-text-muted" />
                              Wishlist
                            </Link>
                          )}
                          {isSeller && (
                            <>
                              <Link
                                to="/seller/dashboard"
                                className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-primary hover:bg-sage/50 rounded-xl"
                              >
                                <LuSettings className="w-4 h-4" />
                                Artisan Dashboard
                              </Link>
                              <Link
                                to="/seller/products"
                                className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-primary hover:bg-sage/50 rounded-xl"
                              >
                                <LuStore className="w-4 h-4" />
                                My Products
                              </Link>
                            </>
                          )}
                          {isAdmin && (
                            <Link
                              to="/admin/dashboard"
                              className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-primary hover:bg-sage/50 rounded-xl"
                            >
                              <LuSettings className="w-4 h-4" />
                              Admin Panel
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-border-light pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-error hover:bg-error/10 rounded-xl font-medium text-left"
                          >
                            <LuLogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/auth/login"
                  className="flex flex-col items-center gap-1 text-text hover:text-primary transition-colors"
                >
                  <LuUser className="w-[22px] h-[22px] sm:w-6 sm:h-6" strokeWidth={1.6} />
                  <span className="hidden sm:block text-[11px] font-medium">Account</span>
                </Link>
              )}

              {isAdmin ? (
                <Link
                  to="/admin/dashboard"
                  className="flex flex-col items-center gap-1 text-text hover:text-primary transition-colors"
                >
                  <LuSettings className="w-[22px] h-[22px] sm:w-6 sm:h-6" strokeWidth={1.6} />
                  <span className="hidden sm:block text-[11px] font-medium">Admin</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/wishlist"
                    className="flex flex-col items-center gap-1 text-text hover:text-primary transition-colors"
                    aria-label="Wishlist"
                  >
                    <span className="relative">
                      <LuHeart className="w-[22px] h-[22px] sm:w-6 sm:h-6" strokeWidth={1.6} />
                      <Badge count={wishlistCount} />
                    </span>
                    <span className="hidden sm:block text-[11px] font-medium">Wishlist</span>
                  </Link>
                  <Link
                    to="/cart"
                    className="flex flex-col items-center gap-1 text-text hover:text-primary transition-colors"
                    aria-label="Cart"
                  >
                    <span className="relative">
                      <LuShoppingCart className="w-[22px] h-[22px] sm:w-6 sm:h-6" strokeWidth={1.6} />
                      <Badge count={itemCount} />
                    </span>
                    <span className="hidden sm:block text-[11px] font-medium">Cart</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Search (mobile) */}
          <div className="md:hidden pb-3">{searchForm}</div>
        </div>

        {/* ===== Category Navigation ===== */}
        <nav className="hidden lg:block border-t border-border-light">
          <div className="container-custom flex items-center gap-8 h-14">
            <div className="relative" ref={categoryMenuRef}>
              <button
                onClick={() => setIsCategoryMenuOpen((open) => !open)}
                className="flex items-center gap-3 h-10 pl-4 pr-5 bg-primary hover:bg-primary-light text-white text-sm font-semibold rounded-lg transition-colors"
                aria-haspopup="menu"
                aria-expanded={isCategoryMenuOpen}
              >
                <LuMenu className="w-4 h-4" />
                All Categories
                <LuChevronDown
                  className={`w-4 h-4 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {isCategoryMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-dropdown border border-border-light p-2 z-50"
                    role="menu"
                  >
                    {categories.map((category) => {
                      const style = getCategoryStyle(category.id);
                      return (
                        <Link
                          key={category.id}
                          to={`/products?category=${category.id}`}
                          className="group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface"
                        >
                          <span
                            className={`w-8 h-8 rounded-full ${style.bg} ${style.color} flex items-center justify-center`}
                          >
                            <style.icon className="w-4 h-4" />
                          </span>
                          <span className="flex-1 text-sm text-text group-hover:text-primary">
                            {category.name}
                          </span>
                          <LuChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <ul className="flex items-center gap-8">
              {navLinks.map((link) => {
                const active = isLinkActive(link.to);
                return (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className={`relative block py-4 text-sm font-medium transition-colors ${
                        active ? 'text-primary' : 'text-text hover:text-primary'
                      }`}
                    >
                      {link.label}
                      <span
                        className={`absolute left-0 right-0 bottom-2 h-0.5 rounded-full bg-primary transition-transform origin-left ${
                          active ? 'scale-x-100' : 'scale-x-0'
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <Link
              to={portalLink.to}
              className="ml-auto flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-light"
            >
              <LuStore className="w-4 h-4" />
              {portalLink.label}
            </Link>
          </div>
        </nav>
      </header>

      {/* ===== Mobile Drawer ===== */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-[70] w-[85%] max-w-sm bg-white overflow-y-auto lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border-light">
                <Logo />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-surface"
                  aria-label="Close menu"
                >
                  <LuX className="w-5 h-5" />
                </button>
              </div>

              <ul className="p-2">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className={`block px-4 py-3 rounded-xl text-sm font-medium ${
                        isLinkActive(link.to) ? 'bg-sage/60 text-primary' : 'text-text hover:bg-surface'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Categories
              </div>
              <ul className="p-2 pt-0">
                {categories.map((category) => {
                  const style = getCategoryStyle(category.id);
                  return (
                    <li key={category.id}>
                      <Link
                        to={`/products?category=${category.id}`}
                        className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-text hover:bg-surface"
                      >
                        <span
                          className={`w-7 h-7 rounded-full ${style.bg} ${style.color} flex items-center justify-center`}
                        >
                          <style.icon className="w-3.5 h-3.5" />
                        </span>
                        {category.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="p-4 border-t border-border-light space-y-2">
                <Link
                  to={portalLink.to}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-primary/20 text-primary text-sm font-semibold"
                >
                  <LuStore className="w-4 h-4" />
                  {portalLink.label}
                </Link>
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-error/10 text-error text-sm font-semibold"
                  >
                    <LuLogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/auth/login"
                      className="py-3 text-center rounded-xl border border-border text-sm font-semibold text-text"
                    >
                      Login
                    </Link>
                    <Link
                      to="/auth/register"
                      className="py-3 text-center rounded-xl bg-primary text-white text-sm font-semibold"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
