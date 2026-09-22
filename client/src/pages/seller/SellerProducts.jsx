import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePhotograph,
  HiOutlineShoppingBag,
  HiOutlineSearch,
  HiOutlineEye,
} from 'react-icons/hi';
import { productService } from '../../services/dataService';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = async (p = page) => {
    try {
      setLoading(true);
      const res = await productService.getSellerProducts({ page: p, limit: 10 });
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    setDeleting(id);
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted successfully');
      fetchProducts(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const filteredProducts = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div className="bg-surface py-8 min-h-screen">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              Artisan Portal
            </span>
            <h1 className="text-3xl font-bold text-text font-[Playfair_Display]">
              My Products
            </h1>
            <p className="text-sm text-text-muted mt-1">
              {pagination.total || 0} products listed
            </p>
          </div>

          <Link
            to="/seller/products/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-xs shadow-md transition-all self-start sm:self-auto hover:shadow-lg"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Add New Product
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search your products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
        </div>

        {/* Products List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-border-light p-12 text-center"
          >
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiOutlineShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-text text-lg mb-2">No Products Yet</h3>
            <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
              Start showcasing your artisan creations! Add your first product to begin selling on HAMROLOK BAZAR.
            </p>
            <Link
              to="/seller/products/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-xs transition"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Add Your First Product
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl border border-border-light shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Product Image */}
                  <div className="sm:w-32 sm:h-32 h-48 bg-surface flex-shrink-0">
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                        <HiOutlinePhotograph className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-text text-base truncate">{product.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-primary font-bold text-sm">
                          {formatPrice(product.price)}
                        </span>
                        {product.comparePrice && (
                          <span className="text-text-muted text-xs line-through">
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                        <span className="text-[10px] text-text-muted bg-surface px-2 py-0.5 rounded-full">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-text-muted">
                        <span>Stock: <strong className={`${(product.inventory?.quantity || 0) === 0 ? 'text-error' : 'text-text'}`}>{product.inventory?.quantity || 0}</strong></span>
                        <span>Orders: <strong className="text-text">{product._count?.orderItems || 0}</strong></span>
                        <span>Reviews: <strong className="text-text">{product._count?.reviews || 0}</strong></span>
                        {!product.isActive && (
                          <span className="bg-error/10 text-error px-2 py-0.5 rounded-full font-bold">
                            INACTIVE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        to={`/products/${product.slug}`}
                        className="p-2.5 rounded-xl bg-surface hover:bg-surface-alt text-text-muted hover:text-text transition"
                        title="View product page"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/seller/products/${product.id}/edit`}
                        className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition"
                        title="Edit product"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deleting === product.id}
                        className="p-2.5 rounded-xl bg-error/10 hover:bg-error hover:text-white text-error transition disabled:opacity-50"
                        title="Delete product"
                      >
                        {deleting === product.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <HiOutlineTrash className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-white hover:bg-surface transition disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs text-text-muted px-3">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-white hover:bg-surface transition disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProducts;
