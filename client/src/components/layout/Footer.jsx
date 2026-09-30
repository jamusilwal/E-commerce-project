import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaApple, FaGooglePlay } from 'react-icons/fa';
import { LuGlobe, LuChevronDown } from 'react-icons/lu';
import { APP_NAME } from '../../utils/constants';
import Logo from '../common/Logo';

const footerColumns = [
  {
    title: 'Shop',
    links: [
      { label: 'All Categories', to: '/categories' },
      { label: 'New Arrivals', to: '/products?sort=newest' },
      { label: 'Best Sellers', to: '/products?sort=popularity' },
      { label: 'Top Rated', to: '/products?sort=rating' },
      { label: 'Handmade Gifts', to: '/products?category=handmade-gifts' },
    ],
  },
  {
    title: 'Customer Service',
    links: [
      { label: 'Track Order', to: '/orders' },
      { label: 'Returns & Refunds', to: '/returns' },
      { label: 'Shipping Info', to: '/shipping' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Our Artisans', to: '/about#artisans' },
      { label: 'Sustainability', to: '/about#sustainability' },
      { label: 'Become a Seller', to: '/seller/register' },
    ],
  },
];

const socialLinks = [
  { icon: FaFacebookF, href: '#', label: 'Facebook' },
  { icon: FaInstagram, href: '#', label: 'Instagram' },
  { icon: FaTwitter, href: '#', label: 'Twitter' },
  { icon: FaYoutube, href: '#', label: 'YouTube' },
];

const appStores = [
  { icon: FaApple, small: 'Download on the', label: 'App Store' },
  { icon: FaGooglePlay, small: 'Get it on', label: 'Google Play' },
];

const legalLinks = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Cookie Policy', to: '/cookies' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-dark text-white">
      <div className="container-custom pt-14 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr] gap-10 lg:gap-0">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 lg:pr-10">
            <Logo variant="light" />
            <p className="text-white/65 text-sm leading-relaxed mt-5 max-w-xs">
              Your one-stop shop for authentic handmade products across every category. Every
              purchase supports local Nepalese artisans.
            </p>
            <div className="flex items-center gap-2.5 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white/80 hover:bg-white hover:text-primary-dark transition-all"
                >
                  <social.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerColumns.map((column) => (
            <div key={column.title} className="lg:border-l lg:border-white/10 lg:px-8">
              <h4 className="text-sm font-semibold text-white font-sans mb-4">{column.title}</h4>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[13px] text-white/65 hover:text-sage transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* App Download */}
          <div className="col-span-2 md:col-span-1 lg:border-l lg:border-white/10 lg:pl-8">
            <h4 className="text-sm font-semibold text-white font-sans mb-4">Download Our App</h4>
            <p className="text-[13px] text-white/65 mb-4">Shop on the go with our mobile app.</p>
            <div className="flex flex-row md:flex-col gap-2.5">
              {appStores.map((store) => (
                <a
                  key={store.label}
                  href="#"
                  className="inline-flex items-center gap-2.5 w-40 px-3 py-2 bg-black rounded-lg border border-white/20 hover:border-white/50 transition-colors"
                >
                  <store.icon className="w-5 h-5 shrink-0" />
                  <span className="leading-tight">
                    <span className="block text-[9px] text-white/70 uppercase">{store.small}</span>
                    <span className="block text-sm font-semibold">{store.label}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-5 flex flex-col md:flex-row items-center gap-4 md:gap-10">
          <p className="text-xs text-white/60">
            © {currentYear} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 md:ml-24">
            {legalLinks.map((link) => (
              <Link key={link.label} to={link.to} className="text-xs text-white/60 hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
          <button
            type="button"
            className="md:ml-auto flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 text-xs text-white/80 hover:border-white/40"
          >
            <LuGlobe className="w-4 h-4" />
            Nepal (NPR)
            <LuChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
