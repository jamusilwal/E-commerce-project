import { Link } from 'react-router-dom';
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
} from 'react-icons/hi';
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from 'react-icons/fa';
import { APP_NAME } from '../../utils/constants';

const footerLinks = {
  shop: [
    { label: 'All Products', to: '/products' },
    { label: 'Categories', to: '/categories' },
    { label: 'New Arrivals', to: '/products?sort=newest' },
    { label: 'Best Sellers', to: '/products?sort=popularity' },
    { label: 'Offers & Deals', to: '/products?discount=true' },
  ],
  company: [
    { label: 'About Us', to: '/about' },
    { label: 'Our Artisans', to: '/artisans' },
    { label: 'Contact Us', to: '/contact' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Become a Seller', to: '/seller/register' },
  ],
  support: [
    { label: 'Shipping Info', to: '/shipping' },
    { label: 'Returns & Exchanges', to: '/returns' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms & Conditions', to: '/terms' },
    { label: 'Help Center', to: '/help' },
  ],
};

const socialLinks = [
  { icon: FaFacebookF, href: '#', label: 'Facebook' },
  { icon: FaInstagram, href: '#', label: 'Instagram' },
  { icon: FaTwitter, href: '#', label: 'Twitter' },
  { icon: FaYoutube, href: '#', label: 'YouTube' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-text text-white">
      {/* Newsletter Section */}
      <div className="bg-primary">
        <div className="container-custom py-10 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold text-white font-[Playfair_Display]">
                Stay Updated with {APP_NAME}
              </h3>
              <p className="text-white/80 mt-1 text-sm">
                Subscribe to get updates on new artisan products and exclusive offers.
              </p>
            </div>
            <form className="flex w-full max-w-md" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-l-xl bg-white/15 border border-white/20 text-white placeholder:text-white/60 text-sm focus:bg-white/20 focus:border-white/40 transition-all"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-accent hover:bg-accent-dark text-white font-semibold text-sm rounded-r-xl transition-all whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl font-[Playfair_Display]">H</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-none font-[Playfair_Display]">
                  {APP_NAME}
                </h2>
                <p className="text-[10px] text-white/50 leading-none tracking-wider uppercase">
                  Handmade Marketplace
                </p>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              A dedicated marketplace connecting Nepalese artisans with customers worldwide.
              Every purchase supports local craftspeople and preserves traditional art forms.
            </p>

            {/* Contact Info */}
            <div className="space-y-2.5">
              <a
                href="mailto:info@hamrolokbazar.com"
                className="flex items-center gap-2.5 text-white/60 hover:text-accent transition-colors text-sm"
              >
                <HiOutlineMail className="w-4 h-4 shrink-0" />
                info@hamrolokbazar.com
              </a>
              <a
                href="tel:+9771234567890"
                className="flex items-center gap-2.5 text-white/60 hover:text-accent transition-colors text-sm"
              >
                <HiOutlinePhone className="w-4 h-4 shrink-0" />
                +977-1-234567890
              </a>
              <p className="flex items-center gap-2.5 text-white/60 text-sm">
                <HiOutlineLocationMarker className="w-4 h-4 shrink-0" />
                Kathmandu, Nepal
              </p>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/60 hover:text-accent hover:translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/60 hover:text-accent hover:translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/60 hover:text-accent hover:translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40 text-center md:text-left">
            © {currentYear} {APP_NAME}. All rights reserved. Made with ❤️ in Nepal.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-accent hover:text-white transition-all"
              >
                <social.icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
