import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineHome } from 'react-icons/hi';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-white to-secondary px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        {/* 404 Number */}
        <div className="relative inline-block mb-6">
          <span className="text-[120px] sm:text-[180px] font-bold text-primary/5 leading-none font-[Playfair_Display]">
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center text-6xl">
            🏺
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          Oops! Page Not Found
        </h1>
        <p className="text-text-light mt-3 leading-relaxed">
          The page you&apos;re looking for seems to have wandered off like a lost yak
          in the Himalayas. Let&apos;s get you back on track.
        </p>

        <div className="flex items-center justify-center gap-4 mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all group"
          >
            <HiOutlineHome className="w-5 h-5" />
            Back to Home
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary/20 text-primary font-semibold rounded-xl hover:bg-primary/5 transition-all"
          >
            Browse Products
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
