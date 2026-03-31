const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

if (typeof window !== 'undefined') {
  accessToken = localStorage.getItem('access_token');
  refreshToken = localStorage.getItem('refresh_token');
}

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

export function getAccessToken() {
  return accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const data = await res.json();
    accessToken = data.access;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', data.access);
    }
    return data.access;
  } catch {
    clearTokens();
    return null;
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, { ...options, headers });

  // If 401, try refreshing
  if (res.status === 401 && refreshToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || error.message || JSON.stringify(error));
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

// === Auth ===
export const authAPI = {
  login: (username: string, password: string) =>
    apiFetch<{ access: string; refresh: string; user: any }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  register: (data: { username: string; email: string; password: string; password2: string }) =>
    apiFetch<{ access: string; refresh: string; user: any }>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getProfile: () => apiFetch<any>('/auth/profile/'),
  updateProfile: (data: any) =>
    apiFetch<any>('/auth/profile/', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data: { old_password: string; new_password: string }) =>
    apiFetch<any>('/auth/change-password/', { method: 'POST', body: JSON.stringify(data) }),
};

// === Products ===
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  compare_price: string | null;
  product_type: string;
  condition: string | null;
  grade: string | null;
  grading_company: string | null;
  set_name: string;
  rarity: string;
  card_number: string | null;
  language: string;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  in_stock: boolean;
  stock_quantity: number;
  category: number;
  category_name?: string;
  image: string | null;
  image_2: string | null;
  image_3: string | null;
  images: { id: number; image: string; alt_text: string }[];
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
}

export const productsAPI = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch<PaginatedResponse<Product>>(`/products/${query}`);
  },
  get: (slug: string) => apiFetch<Product>(`/products/${slug}/`),
  featured: () => apiFetch<PaginatedResponse<Product>>('/products/?is_featured=true'),
  newArrivals: () => apiFetch<PaginatedResponse<Product>>('/products/?ordering=-created_at&is_new=true'),
  search: (q: string) => apiFetch<PaginatedResponse<Product>>(`/products/?search=${encodeURIComponent(q)}`),
  categories: () => apiFetch<Category[]>('/categories/'),
};

// === Favorites ===
export const favoritesAPI = {
  list: () => apiFetch<PaginatedResponse<{ id: number; product: Product; created_at: string }>>('/favorites/'),
  toggle: (productId: number) =>
    apiFetch<{ status: string }>(`/favorites/${productId}/toggle/`, { method: 'POST' }),
};

// === Cart ===
export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: string;
  item_count: number;
}

export const cartAPI = {
  get: () => apiFetch<Cart>('/cart/'),
  addItem: (productId: number, quantity: number = 1) =>
    apiFetch<Cart>('/cart/add/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    }),
  updateItem: (itemId: number, quantity: number) =>
    apiFetch<Cart>(`/cart/update/${itemId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),
  removeItem: (itemId: number) =>
    apiFetch<Cart>(`/cart/remove/${itemId}/`, { method: 'DELETE' }),
  clear: () => apiFetch<Cart>('/cart/clear/', { method: 'POST' }),
};

// === Orders ===
export interface Order {
  id: number;
  order_number: string;
  status: string;
  status_display?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  subtotal: string;
  shipping_cost: string;
  total: string;
  payment_status: string;
  payment_status_display?: string;
  stripe_payment_intent_id?: string;
  coupon_code?: string;
  discount_amount?: string;
  notes?: string;
  created_at: string;
  items: { id: number; product_name: string; product_price: string; quantity: number }[];
}

export const ordersAPI = {
  list: () => apiFetch<PaginatedResponse<Order>>('/orders/'),
  get: (id: number) => apiFetch<Order>(`/orders/${id}/`),
  checkout: (data: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    shipping_address: string;
    shipping_city: string;
    shipping_postal_code: string;
    shipping_country: string;
    shipping_method?: string;
    payment_method?: string;
    notes?: string;
  }) => apiFetch<Order>('/checkout/', { method: 'POST', body: JSON.stringify(data) }),
  createPaymentIntent: (data: any) =>
    apiFetch<{ client_secret: string; order: Order }>('/checkout/create-payment-intent/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// === Reviews ===
export interface Review {
  id: number;
  product: number;
  user: number;
  username: string;
  rating: number;
  title: string;
  comment: string;
  status: string;
  status_display: string;
  created_at: string;
}

export const reviewsAPI = {
  list: (productId: number) =>
    apiFetch<PaginatedResponse<Review>>(`/reviews/?product=${productId}`),
  create: (data: { product: number; rating: number; title: string; comment: string }) =>
    apiFetch<Review>('/reviews/', { method: 'POST', body: JSON.stringify(data) }),
};

// === Coupons ===
export interface CouponValidation {
  coupon: {
    id: number;
    code: string;
    discount_type: string;
    discount_value: string;
  };
  discount_amount: string;
  new_total: string;
}

export const couponsAPI = {
  validate: (code: string, orderTotal: number) =>
    apiFetch<CouponValidation>('/coupons/validate/', {
      method: 'POST',
      body: JSON.stringify({ code, order_total: orderTotal }),
    }),
};

// === Submissions ===
export const submissionsAPI = {
  create: (formData: FormData) =>
    apiFetch<any>('/submissions/', {
      method: 'POST',
      body: formData,
    }),
};

// === Admin API ===
export interface DashboardData {
  orders: { total: number; today: number; pending: number };
  revenue: { total: string; today: string; monthly: string };
  products: { total: number; low_stock: number; out_of_stock: number };
  customers: { total: number; new_today: number };
  pending: { reviews: number; submissions: number };
  recent_orders: Order[];
  low_stock_products: Product[];
}

export interface Customer {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_active: boolean;
  order_count: number;
  total_spent: string;
}

export const adminAPI = {
  // Dashboard
  dashboard: () => apiFetch<DashboardData>('/admin/dashboard/'),

  // Products
  products: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch<PaginatedResponse<Product>>(`/admin/products/${query}`);
  },
  productDetail: (id: number) => apiFetch<Product>(`/admin/products/${id}/`),
  createProduct: (formData: FormData) =>
    apiFetch<Product>('/admin/products/create/', { method: 'POST', body: formData }),
  updateProduct: (id: number, formData: FormData) =>
    apiFetch<Product>(`/admin/products/${id}/`, { method: 'PUT', body: formData }),
  deleteProduct: (id: number) =>
    apiFetch<void>(`/admin/products/${id}/`, { method: 'DELETE' }),

  // Orders
  orders: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch<PaginatedResponse<Order>>(`/admin/orders/${query}`);
  },
  orderDetail: (id: number) => apiFetch<Order>(`/admin/orders/${id}/`),
  updateOrder: (id: number, data: any) =>
    apiFetch<Order>(`/admin/orders/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Customers
  customers: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch<PaginatedResponse<Customer>>(`/admin/customers/${query}`);
  },

  // Reviews
  reviews: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch<PaginatedResponse<Review>>(`/admin/reviews/${query}`);
  },
  updateReview: (id: number, data: { status: string }) =>
    apiFetch<Review>(`/admin/reviews/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Coupons
  coupons: () => apiFetch<PaginatedResponse<any>>('/admin/coupons/'),
  createCoupon: (data: any) =>
    apiFetch<any>('/admin/coupons/create/', { method: 'POST', body: JSON.stringify(data) }),
  updateCoupon: (id: number, data: any) =>
    apiFetch<any>(`/admin/coupons/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCoupon: (id: number) =>
    apiFetch<void>(`/admin/coupons/${id}/`, { method: 'DELETE' }),

  // Submissions
  submissions: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch<PaginatedResponse<any>>(`/admin/submissions/${query}`);
  },
  submissionDetail: (id: number) => apiFetch<any>(`/admin/submissions/${id}/`),
  updateSubmission: (id: number, data: any) =>
    apiFetch<any>(`/admin/submissions/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
};
