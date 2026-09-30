import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePhotograph, HiOutlineX } from 'react-icons/hi';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

export const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    sortOrder: 0,
    isActive: true,
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await adminService.getBanners();
      setBanners(res.data?.data || []);
    } catch {
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      return toast.error('Title and Image URL are required');
    }
    try {
      await adminService.createBanner(formData);
      toast.success('Banner added');
      setShowModal(false);
      setFormData({ title: '', subtitle: '', imageUrl: '', linkUrl: '', sortOrder: 0, isActive: true });
      fetchBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create banner');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promotional banner?')) return;
    try {
      await adminService.deleteBanner(id);
      toast.success('Banner deleted');
      fetchBanners();
    } catch {
      toast.error('Failed to delete banner');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Homepage Banners</h1>
          <p className="text-sm text-slate-500">Manage promotional hero banners shown to customers.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading banners...</div>
        ) : banners.length > 0 ? (
          banners.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
              <div className="h-44 bg-slate-100 relative">
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&auto=format&fit=crop';
                  }}
                />
                <button
                  onClick={() => handleDelete(b.id)}
                  className="absolute top-3 right-3 p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md transition-colors cursor-pointer"
                  title="Delete banner"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-slate-900 text-sm">{b.title}</h4>
                {b.subtitle && <p className="text-slate-500 text-xs mt-1">{b.subtitle}</p>}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Link: {b.linkUrl || '/products'}</span>
                  <span>Order: #{b.sortOrder ?? 0}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            No banners configured yet.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Add New Banner</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Authentic Bhaktapur Pottery Festival"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subtitle / Callout</label>
                <input
                  type="text"
                  placeholder="e.g. Up to 30% off traditional earthenware"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Link URL</label>
                <input
                  type="text"
                  placeholder="/products?category=pottery"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 text-white rounded-lg font-semibold hover:bg-emerald-700"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
