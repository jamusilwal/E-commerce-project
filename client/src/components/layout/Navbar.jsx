import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineUser,
  HiOutlineSearch,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLogout,
  HiOutlineCog,
  HiOutlineClipboardList,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { APP_NAME } from '../../utils/constants';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/categories', label: 'Categories' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const { user, isAuthenticated, isSeller, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate('/auth/login');
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-primary text-white text-xs sm:text-sm">
        <div className="container-custom flex items-center justify-between py-1.5">
          <p className="hidden sm:block">🇳🇵 Supporting Nepalese Artisans &amp; Handmade Products</p>
          <p className="sm:hidden text-center w-full">🇳🇵 Handmade in Nepal</p>
          <div className="hidden sm:flex items-center gap-4">
            {isSeller ? (
              <Link to="/seller/dashboard" className="hover:text-accent transition-colors font-bold">
                Seller Portal
              </Link>
            ) : isAdmin ? (
              <Link to="/admin/dashboard" className="hover:text-accent transition-colors font-bold">
                Admin Panel
              </Link>
            ) : (
              <Link to="/auth/register" className="hover:text-accent transition-colors">
                Become an Artisan Seller
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg md:text-xl font-[Playfair_Display]">H</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-bold text-primary leading-none font-[Playfair_Display]">
                  {APP_NAME}
                </h1>
                <p className="text-[10px] text-text-light leading-none tracking-wider uppercase">
                  Handmade Marketplace
                </p>
              </div>
            </Link>

            {/* Desktop Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'text-primary bg-primary/5'
                        : 'text-text hover:text-primary hover:bg-primary/5'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 rounded-xl text-text-light hover:text-primary hover:bg-primary/5 transition-all"
                aria-label="Search"
              >
                <HiOutlineSearch className="w-5 h-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                className="p-2.5 rounded-xl text-text-light hover:text-primary hover:bg-primary/5 transition-all relative"
                aria-label="Wishlist"
              >
                <HiOutlineHeart className="w-5 h-5" />
              </Link>

              {/* Cart Link */}
              <Link
                to="/cart"
                className="p-2.5 rounded-xl text-text-light hover:text-primary hover:bg-primary/5 transition-all relative"
                aria-label="Cart"
              >
                <HiOutlineShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown / Auth Buttons */}
              {isAuthenticated ? (
                <div className="relative ml-2">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl border border-border-light hover:border-primary transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {user.firstName?.charAt(0)}
                    </div>
                    <span className="hidden md:block text-xs font-semibold text-text max-w-[100px] truncate">
                      {user.firstName}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-dropdown border border-border-light p-2 z-50"
                      >
                        <div className="p-3 border-b border-border-light">
                          <p className="text-xs font-bold text-text truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-[10px] text-text-muted truncate">{user.email}</p>
                          <span className="inline-block mt-1 bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full">
                            {user.role}
                          </span>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-text hover:bg-surface rounded-xl font-medium"
                          >
                            <HiOutlineClipboardList className="w-4 h-4 text-text-muted" />
                            My Orders
                          </Link>

                          {isSeller && (
                            <Link
                              to="/seller/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-xs text-primary hover:bg-primary/5 rounded-xl font-bold"
                            >
                              <HiOutlineCog className="w-4 h-4" />
                              Artisan Dashboard
                            </Link>
                          )}

                          {isAdmin && (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-xs text-primary hover:bg-primary/5 rounded-xl font-bold"
                            >
                              <HiOutlineCog className="w-4 h-4" />
                              Admin Panel
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-border-light pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-error hover:bg-error/10 rounded-xl font-semibold transition-all text-left"
                          >
                            <HiOutlineLogout className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2 ml-2">
                  <Link
                    to="/auth/login"
                    className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-xl transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Drawer Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl text-text-light hover:text-primary hover:bg-primary/5"
              >
                {isMobileMenuOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border overflow-hidden bg-surface"
            >
              <div className="container-custom py-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const query = e.target.search.value;
                    if (query) {
                      navigate(`/products?search=${encodeURIComponent(query)}`);
                      setIsSearchOpen(false);
                    }
                  }}
                  className="relative max-w-2xl mx-auto"
                >
                  <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    name="search"
                    type="text"
                    placeholder="Search Nepalese products, artisans, crafts..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-xl text-sm focus:border-primary"
                    autoFocus
                  />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Navbar;
