import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineSearch } from 'react-icons/hi';
import productService from '../../services/productService';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', price: '', comparePrice: '', description: '', materials: '', categoryId: '', isFeatured: false,
  });

  const fetchProducts = async () => {
    try {
      const res = await productService.getProducts({ limit: 100 });
      setProducts(res.data.data.products || []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      comparePrice: product.comparePrice || '',
      description: product.description || '',
      materials: product.materials || '',
      categoryId: product.categoryId || '',
      isFeatured: product.isFeatured,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, {
          ...formData,
          price: parseFloat(formData.price),
          comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        });
        toast.success('Product updated!');
      }
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-surface py-8 min-h-screen">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Link to="/admin/dashboard" className="text-xs text-primary font-semibold hover:underline">← Back to Dashboard</Link>
            <h1 className="text-2xl font-bold text-text font-[Playfair_Display] mt-1">Product Management</h1>
            <p className="text-xs text-text-muted mt-0.5">{products.length} total products</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {/* Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl">
              <h3 className="font-bold text-lg text-text mb-4">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-text-light">Product Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 border border-border rounded-xl text-sm mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-text-light">Price (NPR)</label>
                    <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full p-2.5 border border-border rounded-xl text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-light">Compare Price</label>
                    <input type="number" value={formData.comparePrice} onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                      className="w-full p-2.5 border border-border rounded-xl text-sm mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-light">Materials</label>
                  <input type="text" value={formData.materials} onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                    className="w-full p-2.5 border border-border rounded-xl text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-light">Description</label>
                  <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 border border-border rounded-xl text-sm mt-1 resize-none" />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded border-border" />
                  <span className="text-xs font-semibold text-text-light">Featured Product</span>
                </label>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={handleSave} className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl text-xs">
                  Save Changes
                </button>
                <button onClick={() => { setShowForm(false); setEditingProduct(null); }}
                  className="px-5 py-2.5 border border-border text-text font-semibold rounded-xl text-xs">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface/50 border-b border-border-light text-text-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Featured</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-surface/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0]?.url || 'https://placehold.co/48x48'}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-surface"
                        />
                        <div>
                          <p className="font-bold text-text line-clamp-1 max-w-[200px]">{product.name}</p>
                          <p className="text-[10px] text-text-muted">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-light">{product.category?.name || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                      {product.comparePrice > product.price && (
                        <span className="text-[10px] text-text-muted line-through ml-1">{formatPrice(product.comparePrice)}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${(product.inventory?.quantity || 0) < 5 ? 'text-red-600' : 'text-text'}`}>
                        {product.inventory?.quantity ?? '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-accent font-bold">★ {product.avgRating?.toFixed(1) || '0.0'}</span>
                      <span className="text-text-muted ml-0.5">({product.totalReviews || 0})</span>
                    </td>
                    <td className="py-3 px-4">
                      {product.isFeatured ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent">★ Featured</span>
                      ) : (
                        <span className="text-[10px] text-text-muted">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(product)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors" title="Edit">
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Delete">
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProducts.length === 0 && (
            <div className="py-12 text-center text-text-muted text-sm">No products found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
