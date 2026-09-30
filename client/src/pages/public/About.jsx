import { Link } from 'react-router-dom';
import { LuShieldCheck, LuHandHeart, LuLeaf, LuUsers, LuArrowRight } from 'react-icons/lu';
import { APP_NAME } from '../../utils/constants';

const values = [
  {
    icon: LuShieldCheck,
    title: 'Verified artisans',
    text: 'Every seller is reviewed by our team before they can list, so what you buy is genuinely handmade.',
  },
  {
    icon: LuHandHeart,
    title: 'Fair to makers',
    text: 'Artisans set their own prices and sell directly to you — no chain of middlemen.',
  },
  {
    icon: LuLeaf,
    title: 'Made to last',
    text: 'Natural materials and traditional techniques mean pieces that age beautifully rather than wear out.',
  },
];

const About = () => (
  <div className="bg-background">
    <section className="container-custom py-12 md:py-16">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">About us</p>
        <h1 className="text-3xl sm:text-5xl font-bold text-primary-dark mt-3 leading-tight">
          Bringing Nepal&apos;s craft traditions to your everyday
        </h1>
        <p className="text-text-light text-lg mt-5 leading-relaxed">
          {APP_NAME} is an online marketplace for authentic Nepalese handmade goods — pottery from Bhaktapur,
          Dhaka weaving from Palpa, Patan metalwork, Lokta paper and much more — sold directly by the artisans
          who make them.
        </p>
      </div>
    </section>

    <section className="container-custom pb-12">
      <div className="grid md:grid-cols-3 gap-4">
        {values.map((value) => (
          <div key={value.title} className="bg-white rounded-2xl border border-border-light shadow-card p-6">
            <value.icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold text-text font-sans mt-4">{value.title}</h2>
            <p className="text-sm text-text-light mt-2 leading-relaxed">{value.text}</p>
          </div>
        ))}
      </div>
    </section>

    <section id="artisans" className="container-custom pb-12 scroll-mt-40">
      <div className="grid lg:grid-cols-2 gap-6 items-center bg-white rounded-2xl border border-border-light shadow-card overflow-hidden">
        <img
          src="/images/wooden-peacock-window.jpg"
          alt="Hand-carved wooden peacock window"
          className="w-full h-64 lg:h-full object-cover"
        />
        <div className="p-6 sm:p-10">
          <LuUsers className="w-8 h-8 text-primary" strokeWidth={1.5} />
          <h2 className="text-2xl font-bold text-primary-dark mt-4">Our artisans</h2>
          <p className="text-sm text-text-light mt-3 leading-relaxed">
            From family pottery workshops to women-led weaving co-operatives, our sellers keep skills alive that
            have been passed down for generations. Every order supports their work directly.
          </p>
          <Link
            to="/seller/register"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-primary hover:bg-primary-light text-white text-sm font-semibold rounded-lg"
          >
            Become a seller <LuArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>

    <section id="sustainability" className="container-custom pb-16 scroll-mt-40">
      <div className="rounded-2xl bg-primary text-white p-8 sm:p-12">
        <LuLeaf className="w-8 h-8 text-sage" strokeWidth={1.5} />
        <h2 className="text-2xl font-bold text-white mt-4">Sustainability</h2>
        <p className="text-white/80 mt-3 max-w-2xl leading-relaxed">
          Handmade goods use local, natural materials — clay, wood, hemp, bamboo and Lokta bark — and far less
          energy than mass production. We encourage sellers to use plastic-free packaging wherever possible.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-sage hover:bg-sage-dark text-primary-dark text-sm font-semibold rounded-lg"
        >
          Shop the collection <LuArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  </div>
);

export default About;
