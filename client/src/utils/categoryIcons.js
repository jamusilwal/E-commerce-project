import {
  LuGem,
  LuTreePine,
  LuAmphora,
  LuScissors,
  LuShirt,
  LuSofa,
  LuSprout,
  LuShoppingBag,
  LuPalette,
  LuGift,
  LuLayoutGrid,
} from 'react-icons/lu';

// Line icon + pastel circle colour for each category in CATEGORIES
export const CATEGORY_STYLES = {
  'handmade-jewelry': { icon: LuGem, bg: 'bg-[#E4EEF7]', color: 'text-[#2F5D8A]' },
  'wooden-crafts': { icon: LuTreePine, bg: 'bg-[#F6E7DC]', color: 'text-[#8A4B2A]' },
  pottery: { icon: LuAmphora, bg: 'bg-[#FBEBDD]', color: 'text-[#A0522D]' },
  'dhaka-products': { icon: LuScissors, bg: 'bg-[#FBE4E4]', color: 'text-[#A23B3B]' },
  'traditional-clothing': { icon: LuShirt, bg: 'bg-[#FDE8E6]', color: 'text-[#B0463C]' },
  'home-decor': { icon: LuSofa, bg: 'bg-[#FFF1D9]', color: 'text-[#9A6A12]' },
  'bamboo-crafts': { icon: LuSprout, bg: 'bg-[#E4F0E2]', color: 'text-[#2D6A4F]' },
  'handmade-bags': { icon: LuShoppingBag, bg: 'bg-[#EEE7F6]', color: 'text-[#5E4690]' },
  paintings: { icon: LuPalette, bg: 'bg-[#E3F1F0]', color: 'text-[#2B7068]' },
  'handmade-gifts': { icon: LuGift, bg: 'bg-[#F7E6EE]', color: 'text-[#99406A]' },
};

export const DEFAULT_CATEGORY_STYLE = {
  icon: LuLayoutGrid,
  bg: 'bg-white',
  color: 'text-primary',
};

export const getCategoryStyle = (slug) => CATEGORY_STYLES[slug] || DEFAULT_CATEGORY_STYLE;
