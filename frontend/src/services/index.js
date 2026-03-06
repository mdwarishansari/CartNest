import api from "./api";

export const authService = {
  createSession: (idToken) => api.post("/auth/session", { idToken }),
  refreshToken: () => api.post("/auth/refresh-token"),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

export const userService = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  addAddress: (data) => api.post("/users/address", data),
  updateAddress: (id, data) => api.put(`/users/address/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/address/${id}`),
};

export const sellerService = {
  register: (data) => api.post("/seller/register", data),
  getDashboard: () => api.get("/seller/dashboard"),
  getProducts: (params) => api.get("/seller/products", { params }),
  createProduct: (data) => api.post("/seller/product", data),
  updateProduct: (id, data) => api.put(`/seller/product/${id}`, data),
  deleteProduct: (id) => api.delete(`/seller/product/${id}`),
  getOrders: (params) => api.get("/seller/orders", { params }),
  updateOrderStatus: (orderId, status) =>
    api.put(`/seller/order/${orderId}/status`, { status }),
  updateProfile: (data) => api.put("/seller/profile", data),
};

export const productService = {
  getAll: (params) => api.get("/products", { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  deleteImage: (productId, publicId) =>
    api.delete(`/products/${productId}/images/${encodeURIComponent(publicId)}`),
};

export const categoryService = {
  getAll: () => api.get("/categories"),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const cartService = {
  get: () => api.get("/cart"),
  add: (productId, qty) => api.post("/cart", { productId, qty }),
  update: (productId, qty) => api.put("/cart", { productId, qty }),
  remove: (productId) => api.delete(`/cart/${productId}`),
  clear: () => api.delete("/cart/clear"),
};

export const orderService = {
  checkout: (shippingAddress) =>
    api.post("/orders/checkout", { shippingAddress }),
  getAll: (params) => api.get("/orders", { params }),
  getMyOrders: () => api.get("/orders"),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
};

export const paymentService = {
  verify: (data) => api.post("/payments/verify", data),
};

export const contactService = {
  submit: (data) => api.post("/contact", data),
};

export const cloudinaryService = {
  getSignature: (type = "product") => api.get(`/cloudinary/sign?type=${type}`),
  getFolders: () => api.get("/cloudinary/folders"),
};

export const adminService = {
  getDashboard: () => api.get("/admin/dashboard"),
  getProducts: (params) => api.get("/admin/products", { params }),
  verifyProduct: (id, data) => api.put(`/admin/products/${id}/verify`, data),
  getOrders: (params) => api.get("/admin/orders", { params }),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  getUsers: (params) => api.get("/admin/users", { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  createVerifier: (data) => api.post("/admin/verifier", data),
  getReports: (params) => api.get("/admin/reports", { params }),
  getContacts: (params) => api.get("/admin/contacts", { params }),
  updateContactStatus: (id, data) =>
    api.put(`/admin/contacts/${id}/status`, data),
  replyToContact: (id, data) => api.post(`/admin/contacts/${id}/reply`, data),
  deleteContact: (id) => api.delete(`/admin/contacts/${id}`),
};
