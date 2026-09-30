import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { getStarArray } from '../../utils/helpers';

/** Five-star rating display (full / half / empty stars) */
const Stars = ({ rating, className = 'w-3 h-3' }) => {
  const value = Math.min(5, Math.max(0, Number(rating) || 0));
  return (
    <span className="flex items-center gap-0.5 text-star" role="img" aria-label={`${value} out of 5 stars`}>
      {getStarArray(value).map((type, i) =>
        type === 'full' ? (
          <FaStar key={i} className={className} />
        ) : type === 'half' ? (
          <FaStarHalfAlt key={i} className={className} />
        ) : (
          <FaRegStar key={i} className={className} />
        )
      )}
    </span>
  );
};

export default Stars;
