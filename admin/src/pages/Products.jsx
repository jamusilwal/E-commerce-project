import { useState, useEffect } from 'react';
import {
  HiOutlineSearch,
  HiOutlineExternalLink,
  HiOutlineTag,
} from 'react-icons/hi';
import { adminService } from '../services/adminService';
import { formatPrice, formatDate, handleImageError, getProductImage } from '../utils/helpers';
import Badge from '../components/Badge';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        adminService.getProducts({ limit: 100 }),
        adminService.getCategories(),
      ]);
      setProducts(prodRes.data?.data?.products || prodRes.data?.data || []);
      setCategories(catRes.data?.data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.seller?.shopName?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || p.category?.id === selectedCategory || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Products</h1>
          <p className="text-sm text-slate-500">
            Catalog inventory auditing and quality control across all Nepalese artisan shops.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
          Listed: {products.length} products
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-80">
          <HiOutlineSearch className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products or artisan shop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Categories ({categories.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon || '📦'} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Artisan / Seller</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Added On</th>
                <th className="py-3 px-4 text-right">Storefront</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading platform catalog...
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const stock = product.inventory?.quantity ?? product.stock ?? 0;
                  const isOutOfStock = stock <= 0;
                  const isLowStock = stock > 0 && stock < 5;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            onError={handleImageError}
                            className="w-11 h-11 rounded-lg object-cover border border-slate-200 bg-slate-50 shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 line-clamp-1">{product.name}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-1 font-mono">
                              SKU: {product.id.slice(-6).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px]">
                          <span>{product.category?.icon || '📦'}</span>
                          <span>{product.category?.name || 'Unassigned'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800">
                          {product.seller?.shopName || 'Hamrolok Direct'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatPrice(product.price)}
                      </td>
                      <td className="py-3.5 px-4">
                        {isOutOfStock ? (
                          <Badge variant="danger">Out of stock</Badge>
                        ) : isLowStock ? (
                          <Badge variant="warning">{stock} left</Badge>
                        ) : (
                          <Badge variant="success">{stock} units</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{formatDate(product.createdAt)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`https://localhost:5173/products/${product.slug || product.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
                        >
                          <HiOutlineExternalLink className="w-4 h-4" />
                          View
                        </a>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No products found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
