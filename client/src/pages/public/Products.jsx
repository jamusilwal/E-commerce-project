import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineAdjustments,
  HiOutlineStar,
  HiOutlineHeart,
  HiOutlineShoppingBag,
} from 'react-icons/hi';
import productService from '../../services/productService';
import { categoryService } from '../../services/dataService';
import { useCart } from '../../context/CartContext';
import { CATEGORIES, SORT_OPTIONS } from '../../utils/constants';
import { formatPrice } from '../../utils/helpers';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState(CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  // Filters
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 12,
          category: currentCategory || undefined,
          search: currentSearch || undefined,
          sort: currentSort,
          minPrice: currentMinPrice || undefined,
          maxPrice: currentMaxPrice || undefined,
        };
        const res = await productService.getProducts(params);
        setProducts(res.data.data.products);
        setTotal(res.data.data.pagination.total);
        setPages(res.data.data.pagination.pages);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentCategory, currentSearch, currentSort, currentMinPrice, currentMaxPrice, currentPage]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  return (
    <div className="bg-surface min-h-screen py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text font-[Playfair_Display]">
              Nepalese Handmade Marketplace
            </h1>
            <p className="text-sm text-text-light mt-1">
              Showing {products.length} of {total} artisan products
            </p>
          </div>

          {/* Search & Sort controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search products..."
                defaultValue={currentSearch}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateParam('search', e.target.value);
                }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-xl text-sm focus:border-primary transition-all"
              />
            </div>

            {/* Sort Select */}
            <select
              value={currentSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="px-3 py-2 bg-white border border-border rounded-xl text-sm focus:border-primary text-text font-medium"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 bg-white rounded-2xl p-6 border border-border-light h-fit space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-light">
              <h3 className="font-bold text-text flex items-center gap-2">
                <HiOutlineFilter className="w-5 h-5 text-primary" />
                Filters
              </h3>
              {(currentCategory || currentSearch || currentMinPrice) && (
                <button
                  onClick={() => setSearchParams({})}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Categories Filter */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-light mb-3">
                Category
              </h4>
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                <button
                  onClick={() => updateParam('category', '')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    !currentCategory
                      ? 'bg-primary text-white font-semibold'
                      : 'text-text hover:bg-surface'
                  }`}
                >
                  All Categories
                </button>
                {categoriesList.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateParam('category', cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-all ${
                      currentCategory === cat.id
                        ? 'bg-primary text-white font-semibold'
                        : 'text-text hover:bg-surface'
                    }`}
                  >
                    <span>
                      {cat.icon} {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-light mb-3">
                Price Range (NPR)
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  defaultValue={currentMinPrice}
                  onBlur={(e) => updateParam('minPrice', e.target.value)}
                  className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs"
                />
                <span className="text-text-muted">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  defaultValue={currentMaxPrice}
                  onBlur={(e) => updateParam('maxPrice', e.target.value)}
                  className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs"
                />
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-80 bg-white rounded-2xl border border-border-light animate-pulse p-4"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
                <span className="text-5xl">🏺</span>
                <h3 className="text-lg font-bold text-text mt-4">No products found</h3>
                <p className="text-sm text-text-light mt-1">
                  Try adjusting your filters or search term
                </p>
                <button
                  onClick={() => setSearchParams({})}
                  className="mt-4 px-6 py-2 bg-primary text-white text-sm font-semibold rounded-xl"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-white rounded-2xl border border-border-light overflow-hidden hover:shadow-card-hover transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image */}
                      <Link to={`/products/${product.slug}`} className="block relative aspect-square bg-surface overflow-hidden">
                        <img
                          src={product.images?.[0]?.url || 'https://placehold.co/400x400/F8F4EC/8B1E3F?text=Handmade'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.comparePrice > product.price && (
                          <span className="absolute top-3 left-3 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-full">
                            SALE
                          </span>
                        )}
                      </Link>

                      {/* Content */}
                      <div className="p-4">
                        <p className="text-xs text-accent font-semibold uppercase tracking-wider">
                          {product.category?.name}
                        </p>
                        <Link
                          to={`/products/${product.slug}`}
                          className="font-bold text-text hover:text-primary transition-colors line-clamp-1 mt-1"
                        >
                          {product.name}
                        </Link>
                        <p className="text-xs text-text-muted mt-1">
                          By {product.seller?.shopName || 'Nepalese Artisan'}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mt-2 text-accent">
                          <HiOutlineStar className="w-4 h-4 fill-current" />
                          <span className="text-xs font-bold text-text">
                            {product.avgRating.toFixed(1)}
                          </span>
                          <span className="text-xs text-text-muted">
                            ({product.totalReviews || 0})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer / Add to Cart */}
                    <div className="p-4 pt-0 flex items-center justify-between border-t border-border-light mt-2 pt-3">
                      <div>
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        {product.comparePrice > product.price && (
                          <span className="text-xs text-text-muted line-through ml-2">
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(product.id, 1)}
                        className="p-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl transition-all"
                        title="Add to Cart"
                      >
                        <HiOutlineShoppingBag className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {[...Array(pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => updateParam('page', (i + 1).toString())}
                    className={`w-9 h-9 rounded-xl font-semibold text-xs transition-all ${
                      currentPage === i + 1
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white text-text border border-border hover:bg-surface'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
