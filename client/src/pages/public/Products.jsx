import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LuSearch, LuSlidersHorizontal, LuX, LuPackageSearch } from 'react-icons/lu';
import productService from '../../services/productService';
import useCategories from '../../hooks/useCategories';
import { SORT_OPTIONS } from '../../utils/constants';
import ProductCard from '../../components/product/ProductCard';

const PAGE_SIZE = 12;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categories = useCategories();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Filters (the URL is the single source of truth)
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const activeCategory = categories.find((c) => c.slug === currentCategory);
  const hasFilters = !!(currentCategory || currentSearch || currentMinPrice || currentMaxPrice);

  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await productService.getProducts({
          page: currentPage,
          limit: PAGE_SIZE,
          category: currentCategory || undefined,
          search: currentSearch || undefined,
          sort: currentSort,
          minPrice: currentMinPrice || undefined,
          maxPrice: currentMaxPrice || undefined,
        });
        if (!active) return;
        const data = res.data.data;
        setProducts(data.products || []);
        setTotal(data.pagination?.total || 0);
        setPages(data.pagination?.pages || 1);
      } catch {
        if (!active) return;
        setProducts([]);
        setTotal(0);
        setPages(1);
        setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      active = false;
    };
  }, [currentCategory, currentSearch, currentSort, currentMinPrice, currentMaxPrice, currentPage, reloadKey]);

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
      else newParams.delete(key);
    });
    // Changing a filter or sort starts again from page 1
    if (!('page' in updates)) newParams.delete('page');
    setSearchParams(newParams);
    if ('page' in updates) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    if (currentSort !== 'newest') newParams.set('sort', currentSort);
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ search: e.target.search.value.trim() });
  };

  const handlePriceSubmit = (e) => {
    e.preventDefault();
    let min = e.target.minPrice.value;
    let max = e.target.maxPrice.value;
    // Swap if entered the wrong way round
    if (min && max && Number(min) > Number(max)) [min, max] = [max, min];
    updateParams({ minPrice: min, maxPrice: max });
    setFiltersOpen(false);
  };

  const heading = currentSearch
    ? `Results for “${currentSearch}”`
    : activeCategory?.name || 'All Handmade Products';

  const firstItem = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-dark">{heading}</h1>
            <p className="text-sm text-text-light mt-1">
              {loading
                ? 'Loading products…'
                : total === 0
                  ? 'No products to show'
                  : `Showing ${firstItem}–${lastItem} of ${total} products`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search — keyed so it resets when the URL search changes */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64" role="search">
              <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                key={currentSearch}
                name="search"
                type="search"
                placeholder="Search products…"
                defaultValue={currentSearch}
                aria-label="Search products"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:border-primary"
              />
            </form>

            <select
              value={currentSort}
              onChange={(e) => updateParams({ sort: e.target.value === 'newest' ? '' : e.target.value })}
              aria-label="Sort products"
              className="px-3 py-2.5 bg-white border border-border rounded-xl text-sm text-text font-medium focus:border-primary"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              className="lg:hidden flex items-center gap-2 px-3 py-2.5 bg-white border border-border rounded-xl text-sm font-medium"
              aria-expanded={filtersOpen}
            >
              <LuSlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {activeCategory && (
              <button
                onClick={() => updateParams({ category: '' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage text-primary text-xs font-semibold"
              >
                {activeCategory.name}
                <LuX className="w-3.5 h-3.5" />
              </button>
            )}
            {currentSearch && (
              <button
                onClick={() => updateParams({ search: '' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage text-primary text-xs font-semibold"
              >
                “{currentSearch}”
                <LuX className="w-3.5 h-3.5" />
              </button>
            )}
            {(currentMinPrice || currentMaxPrice) && (
              <button
                onClick={() => updateParams({ minPrice: '', maxPrice: '' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage text-primary text-xs font-semibold"
              >
                Rs. {currentMinPrice || 0} – {currentMaxPrice || 'any'}
                <LuX className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={clearFilters} className="text-xs font-semibold text-text-light hover:text-primary ml-1">
              Clear all
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`${filtersOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0 bg-white rounded-2xl p-5 border border-border-light shadow-card h-fit space-y-6`}
          >
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted font-sans mb-3">
                Category
              </h2>
              <ul className="space-y-0.5">
                <li>
                  <button
                    onClick={() => {
                      updateParams({ category: '' });
                      setFiltersOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !currentCategory ? 'bg-primary text-white font-semibold' : 'text-text hover:bg-surface'
                    }`}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <button
                      onClick={() => {
                        updateParams({ category: cat.slug });
                        setFiltersOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between gap-2 transition-colors ${
                        currentCategory === cat.slug
                          ? 'bg-primary text-white font-semibold'
                          : 'text-text hover:bg-surface'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {cat.productCount !== null && (
                        <span className={`text-[11px] ${currentCategory === cat.slug ? 'text-white/70' : 'text-text-muted'}`}>
                          {cat.productCount}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handlePriceSubmit} key={`${currentMinPrice}-${currentMaxPrice}`}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted font-sans mb-3">
                Price Range (NPR)
              </h2>
              <div className="flex items-center gap-2">
                <input
                  name="minPrice"
                  type="number"
                  min="0"
                  placeholder="Min"
                  defaultValue={currentMinPrice}
                  aria-label="Minimum price"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm"
                />
                <span className="text-text-muted">–</span>
                <input
                  name="maxPrice"
                  type="number"
                  min="0"
                  placeholder="Max"
                  defaultValue={currentMaxPrice}
                  aria-label="Maximum price"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-3 py-2 rounded-lg bg-primary hover:bg-primary-light text-white text-sm font-semibold transition-colors"
              >
                Apply
              </button>
            </form>
          </aside>

          {/* Product Grid */}
          <section className="flex-1 min-w-0" aria-live="polite">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 rounded-xl animate-shimmer" />
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
                <LuPackageSearch className="w-12 h-12 mx-auto text-text-muted" strokeWidth={1.4} />
                <h3 className="text-lg font-bold text-text mt-4">Couldn&apos;t load products</h3>
                <p className="text-sm text-text-light mt-1">Please check your connection and try again.</p>
                <button
                  onClick={() => setReloadKey((k) => k + 1)}
                  className="mt-5 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
                <LuPackageSearch className="w-12 h-12 mx-auto text-text-muted" strokeWidth={1.4} />
                <h3 className="text-lg font-bold text-text mt-4">No products found</h3>
                <p className="text-sm text-text-light mt-1">Try a different search term or remove some filters.</p>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-5 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && pages > 1 && (
              <nav className="flex flex-wrap items-center justify-center gap-2 mt-10" aria-label="Pagination">
                <button
                  type="button"
                  onClick={() => updateParams({ page: String(currentPage - 1) })}
                  disabled={currentPage <= 1}
                  className="px-3 h-9 rounded-lg text-xs font-semibold bg-white border border-border hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => updateParams({ page: String(n) })}
                    aria-current={currentPage === n ? 'page' : undefined}
                    className={`w-9 h-9 rounded-lg text-xs font-semibold transition-colors ${
                      currentPage === n
                        ? 'bg-primary text-white'
                        : 'bg-white text-text border border-border hover:bg-surface'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => updateParams({ page: String(currentPage + 1) })}
                  disabled={currentPage >= pages}
                  className="px-3 h-9 rounded-lg text-xs font-semibold bg-white border border-border hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </nav>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Products;
