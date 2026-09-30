import { Link, useLocation } from 'react-router-dom';
import { APP_NAME, FREE_DELIVERY_THRESHOLD, DELIVERY_FEE } from '../../utils/constants';
import { formatPrice } from '../../utils/helpers';
import NotFound from './NotFound';

// Plain-language store policies. Review these with the business owner before launch.
const PAGES = {
  shipping: {
    title: 'Shipping Information',
    intro: 'We deliver handmade products from artisans across Nepal straight to your door.',
    sections: [
      {
        heading: 'Delivery charges',
        body: [
          `Orders of ${formatPrice(FREE_DELIVERY_THRESHOLD)} or more ship free anywhere in Nepal.`,
          `Smaller orders have a flat delivery charge of ${formatPrice(DELIVERY_FEE)}.`,
        ],
      },
      {
        heading: 'Delivery times',
        body: [
          'Each product page shows its estimated delivery time. Most orders arrive within 2–7 business days.',
          'Items are handmade to order by independent artisans, so some pieces may take a little longer to prepare.',
        ],
      },
      {
        heading: 'Tracking your order',
        body: ['Follow every step — confirmed, packed, shipped and delivered — from the My Orders page.'],
      },
    ],
  },
  returns: {
    title: 'Returns & Refunds',
    intro: 'We want you to love your purchase. If something is not right, we will help.',
    sections: [
      {
        heading: '30-day returns',
        body: [
          'You can request a return within 30 days of delivery for items that are unused and in their original packaging.',
          'Personalised or custom-made items cannot be returned unless they arrive damaged or faulty.',
        ],
      },
      {
        heading: 'Damaged or incorrect items',
        body: ['Contact us within 48 hours of delivery with photos of the item and packaging, and we will arrange a replacement or refund.'],
      },
      {
        heading: 'Refunds',
        body: [
          'Approved refunds go back to your original payment method (eSewa or Khalti). Cash on Delivery orders are refunded by bank transfer or eSewa.',
          'Refunds are usually processed within 5–7 business days after we receive the returned item.',
        ],
      },
    ],
  },
  faq: {
    title: 'Frequently Asked Questions',
    intro: 'Quick answers to the questions we hear most.',
    sections: [
      {
        heading: 'How do I pay?',
        body: ['You can pay with eSewa, Khalti, or Cash on Delivery at checkout.'],
      },
      {
        heading: 'Can I cancel my order?',
        body: ['Yes — orders can be cancelled from the order page until they are packed.'],
      },
      {
        heading: 'Are the products really handmade?',
        body: [`Every seller on ${APP_NAME} is a verified Nepalese artisan or workshop, reviewed by our team before they can list products.`],
      },
      {
        heading: 'How do I sell on the marketplace?',
        body: ['Create an account and apply through “Become a Seller”. Our team reviews every application, usually within 2 business days.'],
      },
      {
        heading: 'Where can I download my invoice?',
        body: ['Once an order is confirmed, use the “Download Bill” button on the order page.'],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro: `This policy explains what information ${APP_NAME} collects and how it is used.`,
    sections: [
      {
        heading: 'Information we collect',
        body: ['Your name, email, phone number and delivery addresses, plus the orders you place and payments you make.'],
      },
      {
        heading: 'How we use it',
        body: [
          'To process and deliver orders, send order updates, provide customer support and keep the marketplace secure.',
          'Sellers only receive the details they need to fulfil your order.',
        ],
      },
      {
        heading: 'Payments',
        body: ['Card and wallet payments are handled by eSewa and Khalti. We never store your wallet password or PIN.'],
      },
      {
        heading: 'Your choices',
        body: ['You can update your details at any time, and contact us to request a copy or deletion of your data.'],
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    intro: `By using ${APP_NAME} you agree to these terms.`,
    sections: [
      {
        heading: 'Accounts',
        body: ['Keep your login details private. You are responsible for activity on your account.'],
      },
      {
        heading: 'Orders and pricing',
        body: [
          'All prices are in Nepalese Rupees (NPR). An order is confirmed once payment is received or, for Cash on Delivery, once the seller confirms it.',
          'We may cancel orders affected by pricing errors or stock problems, with a full refund.',
        ],
      },
      {
        heading: 'Sellers',
        body: ['Sellers must list only genuine handmade products and describe them accurately. Listings that break these rules may be removed.'],
      },
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    intro: 'We use a small number of cookies and similar storage to run the site.',
    sections: [
      {
        heading: 'Essential storage',
        body: ['A secure cookie keeps you signed in, and your browser stores your session so the cart and wishlist work.'],
      },
      {
        heading: 'No advertising cookies',
        body: ['We do not use third-party advertising or tracking cookies.'],
      },
    ],
  },
};

/** Renders a store policy page based on the current URL (e.g. /shipping) */
const InfoPage = () => {
  const { pathname } = useLocation();
  const page = PAGES[pathname.replace(/^\//, '')];

  if (!page) return <NotFound />;

  return (
    <div className="bg-background py-10 min-h-[70vh]">
      <div className="container-custom max-w-3xl">
        <nav className="text-xs text-text-muted mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary">Home</Link> / <span className="text-text">{page.title}</span>
        </nav>
        <article className="bg-white rounded-2xl border border-border-light shadow-card p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-primary-dark">{page.title}</h1>
          <p className="text-text-light mt-3">{page.intro}</p>
          <div className="mt-8 space-y-7">
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-lg font-semibold text-text font-sans">{section.heading}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm text-text-light leading-relaxed mt-2">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
          <p className="text-sm text-text-light mt-10 pt-6 border-t border-border-light">
            Still have questions?{' '}
            <Link to="/contact" className="font-semibold text-primary hover:underline">
              Contact us
            </Link>
            .
          </p>
        </article>
      </div>
    </div>
  );
};

export default InfoPage;
