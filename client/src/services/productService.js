import api from './api';

/**
 * Product API service
 */
const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProductBySlug: (slug) => api.get(`/products/detail/${slug}`),
  getRelatedProducts: (id) => api.get(`/products/${id}/related`),
  getSellerProducts: (params) => api.get('/products/seller/my-products', { params }),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  uploadImages: (id, formData) =>
    api.post(`/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default productService;
