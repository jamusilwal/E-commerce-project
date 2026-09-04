import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCollection } from 'react-icons/hi';
import { categoryService, adminService } from '../../services/dataService';
import toast from 'react-hot-toast';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', icon: '📦', sortOrder: 0 });

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      setCategories(res.data.data || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '', icon: '📦', sortOrder: categories.length + 1 });
    setShowModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || '📦',
      sortOrder: cat.sortOrder || 0,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Category name is required');

    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, formData);
        toast.success('Category updated successfully');
      } else {
        await adminService.createCategory(formData);
        toast.success('Category created successfully');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await adminService.deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
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
            <Link to="/admin/dashboard" className="text-xs text-primary font-semibold hover:underline">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-text font-[Playfair_Display] mt-1">Manage Categories</h1>
            <p className="text-xs text-text-muted mt-0.5">{categories.length} artisan craft categories</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <HiOutlinePlus className="w-4 h-4" /> Add Category
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-2xl border border-border-light shadow-sm hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{cat.icon || '📦'}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface text-text-muted">
                    Order: {cat.sortOrder ?? 0}
                  </span>
                </div>
                <h3 className="font-bold text-text text-sm">{cat.name}</h3>
                <p className="text-[10px] text-accent font-mono mt-0.5">{cat.slug}</p>
                <p className="text-xs text-text-light mt-2 line-clamp-2 leading-relaxed">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-border-light text-xs">
                <span className="text-text-muted text-[10px]">
                  {cat._count?.products || 0} products
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                    title="Edit"
                  >
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    title="Delete"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <h3 className="font-bold text-lg text-text mb-4 font-[Playfair_Display]">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-text-light block mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 border border-border rounded-xl text-sm"
                    placeholder="e.g. Handmade Jewelry"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-text-light block mb-1">Emoji Icon</label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full p-2.5 border border-border rounded-xl text-sm"
                      placeholder="💎"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-text-light block mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                      className="w-full p-2.5 border border-border rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-text-light block mb-1">Slug (optional)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full p-2.5 border border-border rounded-xl text-sm"
                    placeholder="handmade-jewelry"
                  />
                </div>
                <div>
                  <label className="font-semibold text-text-light block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 border border-border rounded-xl text-sm resize-none"
                    placeholder="Brief overview of crafts in this category..."
                  />
                </div>
                <div className="flex gap-2 pt-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl text-xs"
                  >
                    Save Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 border border-border text-text font-semibold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
