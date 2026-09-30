import { Link } from 'react-router-dom';
import { APP_NAME } from '../../utils/constants';

/**
 * Logo — shopping bag with a leaf, followed by the brand name and tagline.
 * `variant="light"` is used on dark backgrounds (footer).
 */
const Logo = ({ variant = 'dark', className = '' }) => {
  const isLight = variant === 'light';
  const [first, ...rest] = APP_NAME.split(' ');

  return (
    <Link to="/" className={`flex items-center gap-2.5 shrink-0 ${className}`} aria-label={`${APP_NAME} home`}>
      <svg
        viewBox="0 0 40 44"
        className={`w-8 h-9 sm:w-9 sm:h-10 md:w-10 md:h-11 ${isLight ? 'text-sage' : 'text-primary'}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 14h28l-2 26H8L6 14z" />
        <path d="M14 14V10a6 6 0 0 1 12 0v4" />
        <path d="M20 35c0-7 4-11 9-12-1 6-4 10-9 12z" fill="currentColor" stroke="none" />
        <path d="M20 35c0-6-3-10-8-11 1 5 3 9 8 11z" fill="currentColor" stroke="none" opacity="0.7" />
      </svg>
      <div className="leading-none">
        <span
          className={`block font-[Playfair_Display] text-base sm:text-lg md:text-xl font-bold tracking-wide ${
            isLight ? 'text-white' : 'text-primary'
          }`}
        >
          {first}
          {rest.length > 0 && <span className="font-medium"> {rest.join(' ')}</span>}
        </span>
        <span
          className={`block text-[9px] md:text-[10px] tracking-[0.25em] uppercase mt-1 ${
            isLight ? 'text-white/60' : 'text-text-light'
          }`}
        >
          Handmade in Nepal
        </span>
      </div>
    </Link>
  );
};

export default Logo;
