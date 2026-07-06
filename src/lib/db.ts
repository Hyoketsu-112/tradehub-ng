/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { Store, Product, Order, Dispute, User } from '../types';
import { INITIAL_STORES, INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_DISPUTES } from './initialData';

// Retrieve Supabase credentials from environment
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Lazy initialize Supabase client
const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const supabase = isSupabaseConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * DATABASE ABSTRACTION LAYER
 * Uses Supabase if configured, otherwise falls back to highly robust LocalStorage state.
 */

const LOCAL_STORAGE_KEYS = {
  STORES: 'tradehub_stores_v1',
  PRODUCTS: 'tradehub_products_v1',
  ORDERS: 'tradehub_orders_v1',
  DISPUTES: 'tradehub_disputes_v1',
};

// Local storage helpers
function getLocalData<T>(key: string, initial: T[]): T[] {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return initial;
  }
}

function setLocalData<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function isSandboxMode(): boolean {
  return !isSupabaseConfigured;
}

// STORES OPERATIONS
export async function getStores(): Promise<Store[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('tradehub_stores')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      // Map database snake_case to camelCase
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        category: item.category,
        bannerColor: item.banner_color,
        bankName: item.bank_name,
        accountNumber: item.account_number,
        paystackSubaccount: item.paystack_subaccount,
        sellerEmail: item.seller_email,
        createdAt: item.created_at,
        logoUrl: item.logo_url,
        bannerUrl: item.banner_url,
        accentColor: item.accent_color,
        headerFont: item.header_font,
      }));
    }
    console.warn('Supabase getStores error, falling back to local storage:', error);
  }
  return getLocalData<Store>(LOCAL_STORAGE_KEYS.STORES, INITIAL_STORES);
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('tradehub_stores')
      .select('*')
      .eq('slug', slug)
      .single();
    if (!error && data) {
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        category: data.category,
        bannerColor: data.banner_color,
        bankName: data.bank_name,
        accountNumber: data.account_number,
        paystackSubaccount: data.paystack_subaccount,
        sellerEmail: data.seller_email,
        createdAt: data.created_at,
        logoUrl: data.logo_url,
        bannerUrl: data.banner_url,
        accentColor: data.accent_color,
        headerFont: data.header_font,
      };
    }
  }
  const stores = getLocalData<Store>(LOCAL_STORAGE_KEYS.STORES, INITIAL_STORES);
  return stores.find(s => s.slug.toLowerCase() === slug.toLowerCase()) || null;
}

export async function createStore(store: Omit<Store, 'id' | 'createdAt'>): Promise<Store> {
  const newStore: Store = {
    ...store,
    id: `store-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('tradehub_stores')
      .insert([{
        name: newStore.name,
        slug: newStore.slug.toLowerCase(),
        description: newStore.description,
        category: newStore.category,
        banner_color: newStore.bannerColor,
        bank_name: newStore.bankName,
        account_number: newStore.accountNumber,
        paystack_subaccount: newStore.paystackSubaccount,
        seller_email: newStore.sellerEmail,
        logo_url: newStore.logoUrl,
        banner_url: newStore.bannerUrl,
        accent_color: newStore.accentColor,
        header_font: newStore.headerFont,
      }])
      .select()
      .single();
    if (!error && data) {
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        category: data.category,
        bannerColor: data.banner_color,
        bankName: data.bank_name,
        accountNumber: data.account_number,
        paystackSubaccount: data.paystack_subaccount,
        sellerEmail: data.seller_email,
        createdAt: data.created_at,
        logoUrl: data.logo_url,
        bannerUrl: data.banner_url,
        accentColor: data.accent_color,
        headerFont: data.header_font,
      };
    }
    console.warn('Supabase createStore error, using LocalStorage:', error);
  }

  const stores = getLocalData<Store>(LOCAL_STORAGE_KEYS.STORES, INITIAL_STORES);
  stores.push(newStore);
  setLocalData(LOCAL_STORAGE_KEYS.STORES, stores);
  return newStore;
}

export async function updateStore(id: string, updates: Partial<Omit<Store, 'id' | 'createdAt'>>): Promise<Store | null> {
  if (supabase) {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.bannerColor !== undefined) dbUpdates.banner_color = updates.bannerColor;
    if (updates.bankName !== undefined) dbUpdates.bank_name = updates.bankName;
    if (updates.accountNumber !== undefined) dbUpdates.account_number = updates.accountNumber;
    if (updates.paystackSubaccount !== undefined) dbUpdates.paystack_subaccount = updates.paystackSubaccount;
    if (updates.sellerEmail !== undefined) dbUpdates.seller_email = updates.sellerEmail;
    if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
    if (updates.bannerUrl !== undefined) dbUpdates.banner_url = updates.bannerUrl;
    if (updates.accentColor !== undefined) dbUpdates.accent_color = updates.accentColor;
    if (updates.headerFont !== undefined) dbUpdates.header_font = updates.headerFont;

    const { data, error } = await supabase
      .from('tradehub_stores')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        category: data.category,
        bannerColor: data.banner_color,
        bankName: data.bank_name,
        accountNumber: data.account_number,
        paystackSubaccount: data.paystack_subaccount,
        sellerEmail: data.seller_email,
        createdAt: data.created_at,
        logoUrl: data.logo_url,
        bannerUrl: data.banner_url,
        accentColor: data.accent_color,
        headerFont: data.header_font,
      };
    }
    console.warn('Supabase updateStore error, using LocalStorage:', error);
  }

  const stores = getLocalData<Store>(LOCAL_STORAGE_KEYS.STORES, INITIAL_STORES);
  const idx = stores.findIndex(s => s.id === id);
  if (idx !== -1) {
    stores[idx] = { ...stores[idx], ...updates };
    setLocalData(LOCAL_STORAGE_KEYS.STORES, stores);
    return stores[idx];
  }
  return null;
}

// PRODUCTS OPERATIONS
export async function getProducts(storeId?: string): Promise<Product[]> {
  if (supabase) {
    let query = supabase.from('tradehub_products').select('*');
    if (storeId) {
      query = query.eq('store_id', storeId);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error && data) {
      return data.map((item: any) => ({
        id: item.id,
        storeId: item.store_id,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        imageUrl: item.image_url,
        stock: item.stock,
        category: item.category,
        createdAt: item.created_at,
      }));
    }
    console.warn('Supabase getProducts error:', error);
  }

  const products = getLocalData<Product>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  return storeId ? products.filter(p => p.storeId === storeId) : products;
}

export async function getProductById(id: string): Promise<Product | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('tradehub_products')
      .select('*')
      .eq('id', id)
      .single();
    if (!error && data) {
      return {
        id: data.id,
        storeId: data.store_id,
        name: data.name,
        description: data.description,
        price: Number(data.price),
        imageUrl: data.image_url,
        stock: data.stock,
        category: data.category,
        createdAt: data.created_at,
      };
    }
  }
  const products = getLocalData<Product>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  return products.find(p => p.id === id) || null;
}

export async function createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  const newProduct: Product = {
    ...product,
    id: `prod-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('tradehub_products')
      .insert([{
        store_id: newProduct.storeId,
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        image_url: newProduct.imageUrl,
        stock: newProduct.stock,
        category: newProduct.category,
      }])
      .select()
      .single();
    if (!error && data) {
      return {
        id: data.id,
        storeId: data.store_id,
        name: data.name,
        description: data.description,
        price: Number(data.price),
        imageUrl: data.image_url,
        stock: data.stock,
        category: data.category,
        createdAt: data.created_at,
      };
    }
  }

  const products = getLocalData<Product>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  products.push(newProduct);
  setLocalData(LOCAL_STORAGE_KEYS.PRODUCTS, products);
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'storeId' | 'createdAt'>>): Promise<Product | null> {
  if (supabase) {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
    if (updates.category !== undefined) dbUpdates.category = updates.category;

    const { data, error } = await supabase
      .from('tradehub_products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (!error && data) {
      return {
        id: data.id,
        storeId: data.store_id,
        name: data.name,
        description: data.description,
        price: Number(data.price),
        imageUrl: data.image_url,
        stock: data.stock,
        category: data.category,
        createdAt: data.created_at,
      };
    }
  }

  const products = getLocalData<Product>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const idx = products.findIndex(p => p.id === id);
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...updates };
    setLocalData(LOCAL_STORAGE_KEYS.PRODUCTS, products);
    return products[idx];
  }
  return null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (supabase) {
    const { error } = await supabase
      .from('tradehub_products')
      .delete()
      .eq('id', id);
    if (!error) return true;
  }
  const products = getLocalData<Product>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length !== products.length) {
    setLocalData(LOCAL_STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  }
  return false;
}

// ORDERS OPERATIONS
export async function createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const randomId = `TH-${Math.floor(10000 + Math.random() * 90000)}-NG`;
  const newOrder: Order = {
    ...order,
    id: randomId,
    createdAt: new Date().toISOString(),
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('tradehub_orders')
      .insert([{
        id: newOrder.id,
        store_id: newOrder.storeId,
        store_name: newOrder.storeName,
        buyer_name: newOrder.buyerName,
        buyer_email: newOrder.buyerEmail,
        buyer_phone: newOrder.buyerPhone,
        delivery_address: newOrder.deliveryAddress,
        items: newOrder.items,
        total_amount: newOrder.totalAmount,
        platform_fee: newOrder.platformFee,
        seller_share: newOrder.sellerShare,
        paystack_subaccount: newOrder.paystackSubaccount,
        paystack_reference: newOrder.paystackReference,
        status: newOrder.status,
        escrow_status: newOrder.escrowStatus,
      }])
      .select()
      .single();
    
    if (!error && data) {
      return {
        id: data.id,
        storeId: data.store_id,
        storeName: data.store_name,
        buyerName: data.buyer_name,
        buyerEmail: data.buyer_email,
        buyerPhone: data.buyer_phone,
        deliveryAddress: data.delivery_address,
        items: data.items,
        totalAmount: Number(data.total_amount),
        platformFee: Number(data.platform_fee),
        sellerShare: Number(data.seller_share),
        paystackSubaccount: data.paystack_subaccount,
        paystackReference: data.paystack_reference,
        status: data.status,
        escrowStatus: data.escrow_status,
        createdAt: data.created_at,
      };
    }
  }

  const orders = getLocalData<Order>(LOCAL_STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  orders.push(newOrder);
  setLocalData(LOCAL_STORAGE_KEYS.ORDERS, orders);

  // Decrement products stock local-only fallback
  const products = getLocalData<Product>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  for (const item of newOrder.items) {
    const pIdx = products.findIndex(p => p.id === item.productId);
    if (pIdx !== -1) {
      products[pIdx].stock = Math.max(0, products[pIdx].stock - item.quantity);
    }
  }
  setLocalData(LOCAL_STORAGE_KEYS.PRODUCTS, products);

  return newOrder;
}

export async function getOrders(storeId?: string): Promise<Order[]> {
  if (supabase) {
    let query = supabase.from('tradehub_orders').select('*');
    if (storeId) {
      query = query.eq('store_id', storeId);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error && data) {
      return data.map((item: any) => ({
        id: item.id,
        storeId: item.store_id,
        storeName: item.store_name,
        buyerName: item.buyer_name,
        buyerEmail: item.buyer_email,
        buyerPhone: item.buyer_phone,
        deliveryAddress: item.delivery_address,
        items: item.items,
        totalAmount: Number(item.total_amount),
        platformFee: Number(item.platform_fee),
        sellerShare: Number(item.seller_share),
        paystackSubaccount: item.paystack_subaccount,
        paystackReference: item.paystack_reference,
        status: item.status,
        escrowStatus: item.escrow_status,
        createdAt: item.created_at,
      }));
    }
  }
  const orders = getLocalData<Order>(LOCAL_STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  return storeId ? orders.filter(o => o.storeId === storeId) : orders;
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('tradehub_orders')
      .select('*')
      .eq('id', id)
      .single();
    if (!error && data) {
      return {
        id: data.id,
        storeId: data.store_id,
        storeName: data.store_name,
        buyerName: data.buyer_name,
        buyerEmail: data.buyer_email,
        buyerPhone: data.buyer_phone,
        deliveryAddress: data.delivery_address,
        items: data.items,
        totalAmount: Number(data.total_amount),
        platformFee: Number(data.platform_fee),
        sellerShare: Number(data.seller_share),
        paystackSubaccount: data.paystack_subaccount,
        paystackReference: data.paystack_reference,
        status: data.status,
        escrowStatus: data.escrow_status,
        createdAt: data.created_at,
      };
    }
  }
  const orders = getLocalData<Order>(LOCAL_STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  return orders.find(o => o.id.toLowerCase() === id.toLowerCase()) || null;
}

export async function getOrdersByBuyerEmail(email: string): Promise<Order[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('tradehub_orders')
      .select('*')
      .eq('buyer_email', email)
      .order('created_at', { ascending: false });
    if (!error && data) {
      return data.map((item: any) => ({
        id: item.id,
        storeId: item.store_id,
        storeName: item.store_name,
        buyerName: item.buyer_name,
        buyerEmail: item.buyer_email,
        buyerPhone: item.buyer_phone,
        deliveryAddress: item.delivery_address,
        items: item.items,
        totalAmount: Number(item.total_amount),
        platformFee: Number(item.platform_fee),
        sellerShare: Number(item.seller_share),
        paystackSubaccount: item.paystack_subaccount,
        paystackReference: item.paystack_reference,
        status: item.status,
        escrowStatus: item.escrow_status,
        createdAt: item.created_at,
      }));
    }
  }
  const orders = getLocalData<Order>(LOCAL_STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  return orders.filter(o => o.buyerEmail.toLowerCase() === email.toLowerCase());
}

export async function updateOrderStatus(
  orderId: string, 
  status: Order['status'], 
  escrowStatus: Order['escrowStatus']
): Promise<Order | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('tradehub_orders')
      .update({ status, escrow_status: escrowStatus })
      .eq('id', orderId)
      .select()
      .single();
    if (!error && data) {
      return {
        id: data.id,
        storeId: data.store_id,
        storeName: data.store_name,
        buyerName: data.buyer_name,
        buyerEmail: data.buyer_email,
        buyerPhone: data.buyer_phone,
        deliveryAddress: data.delivery_address,
        items: data.items,
        totalAmount: Number(data.total_amount),
        platformFee: Number(data.platform_fee),
        sellerShare: Number(data.seller_share),
        paystackSubaccount: data.paystack_subaccount,
        paystackReference: data.paystack_reference,
        status: data.status,
        escrowStatus: data.escrow_status,
        createdAt: data.created_at,
      };
    }
  }

  const orders = getLocalData<Order>(LOCAL_STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx !== -1) {
    orders[idx].status = status;
    orders[idx].escrowStatus = escrowStatus;
    setLocalData(LOCAL_STORAGE_KEYS.ORDERS, orders);
    return orders[idx];
  }
  return null;
}

// DISPUTES OPERATIONS
export async function createDispute(dispute: Omit<Dispute, 'id' | 'createdAt'>): Promise<Dispute> {
  const newDispute: Dispute = {
    ...dispute,
    id: `disp-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('tradehub_disputes')
      .insert([{
        order_id: newDispute.orderId,
        buyer_email: newDispute.buyerEmail,
        reason: newDispute.reason,
        description: newDispute.description,
        status: newDispute.status,
      }])
      .select()
      .single();
    if (!error && data) {
      return {
        id: data.id,
        orderId: data.order_id,
        buyerEmail: data.buyer_email,
        reason: data.reason,
        description: data.description,
        status: data.status,
        sellerResponse: data.seller_response,
        createdAt: data.created_at,
      };
    }
  }

  const disputes = getLocalData<Dispute>(LOCAL_STORAGE_KEYS.DISPUTES, INITIAL_DISPUTES);
  disputes.push(newDispute);
  setLocalData(LOCAL_STORAGE_KEYS.DISPUTES, disputes);

  // Set corresponding order status to disputed, locking escrow
  await updateOrderStatus(dispute.orderId, 'disputed', 'locked_dispute');

  return newDispute;
}

export async function getDisputes(storeId?: string): Promise<Dispute[]> {
  if (supabase) {
    let query = supabase.from('tradehub_disputes').select(`
      *,
      tradehub_orders!inner(store_id)
    `);
    if (storeId) {
      query = query.eq('tradehub_orders.store_id', storeId);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error && data) {
      return data.map((item: any) => ({
        id: item.id,
        orderId: item.order_id,
        buyerEmail: item.buyer_email,
        reason: item.reason,
        description: item.description,
        status: item.status,
        sellerResponse: item.seller_response,
        createdAt: item.created_at,
      }));
    }
  }

  const disputes = getLocalData<Dispute>(LOCAL_STORAGE_KEYS.DISPUTES, INITIAL_DISPUTES);
  if (storeId) {
    // Filter disputes whose order belongs to the store
    const orders = getLocalData<Order>(LOCAL_STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const storeOrderIds = new Set(orders.filter(o => o.storeId === storeId).map(o => o.id));
    return disputes.filter(d => storeOrderIds.has(d.orderId));
  }
  return disputes;
}

export async function updateDisputeStatus(
  disputeId: string, 
  status: Dispute['status'], 
  sellerResponse?: string
): Promise<Dispute | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('tradehub_disputes')
      .update({ status, seller_response: sellerResponse })
      .eq('id', disputeId)
      .select()
      .single();
    if (!error && data) {
      return {
        id: data.id,
        orderId: data.order_id,
        buyerEmail: data.buyer_email,
        reason: data.reason,
        description: data.description,
        status: data.status,
        sellerResponse: data.seller_response,
        createdAt: data.created_at,
      };
    }
  }

  const disputes = getLocalData<Dispute>(LOCAL_STORAGE_KEYS.DISPUTES, INITIAL_DISPUTES);
  const idx = disputes.findIndex(d => d.id === disputeId);
  if (idx !== -1) {
    disputes[idx].status = status;
    if (sellerResponse !== undefined) {
      disputes[idx].sellerResponse = sellerResponse;
    }
    setLocalData(LOCAL_STORAGE_KEYS.DISPUTES, disputes);
    return disputes[idx];
  }
  return null;
}

// AUTHENTICATION OPERATIONS
const AUTH_USERS_KEY = 'tradehub_auth_users_v1';
const CURRENT_USER_KEY = 'tradehub_current_user_v1';

export async function signUpUser(email: string, name: string, role: 'seller' | 'buyer'): Promise<User> {
  const newUser: User = {
    id: `usr-${Math.random().toString(36).substr(2, 9)}`,
    email: email.trim().toLowerCase(),
    name: name.trim(),
    role,
    createdAt: new Date().toISOString()
  };

  // If seller, try to find an existing store with this sellerEmail to link them up
  if (role === 'seller') {
    const stores = await getStores();
    const matchingStore = stores.find(s => s.sellerEmail.toLowerCase() === newUser.email);
    if (matchingStore) {
      newUser.storeSlug = matchingStore.slug;
    }
  }

  // Handle Supabase Auth sync (simplified sync or database mapping)
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('tradehub_users')
        .insert([{
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          store_slug: newUser.storeSlug || null
        }])
        .select()
        .single();
      
      if (!error && data) {
        newUser.id = data.id;
      }
    } catch (e) {
      console.warn('Supabase save user failed, using local fallback:', e);
    }
  }

  const users = getLocalData<User>(AUTH_USERS_KEY, []);
  const exists = users.some(u => u.email === newUser.email);
  if (exists) {
    throw new Error('This email is already registered with an account.');
  }

  users.push(newUser);
  setLocalData(AUTH_USERS_KEY, users);
  
  // Log them in immediately
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  return newUser;
}

export async function signInUser(email: string): Promise<User> {
  const emailLower = email.trim().toLowerCase();
  const users = getLocalData<User>(AUTH_USERS_KEY, []);
  let foundUser = users.find(u => u.email === emailLower);

  if (!foundUser && supabase) {
    try {
      const { data, error } = await supabase
        .from('tradehub_users')
        .select('*')
        .eq('email', emailLower)
        .single();
      
      if (!error && data) {
        foundUser = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role as 'seller' | 'buyer',
          createdAt: data.created_at,
          storeSlug: data.store_slug || undefined
        };
      }
    } catch (e) {
      console.warn('Supabase fetch user failed:', e);
    }
  }

  if (!foundUser) {
    // Check if they are already in the system as a seller of any store
    const stores = await getStores();
    const matchingStore = stores.find(s => s.sellerEmail.toLowerCase() === emailLower);
    
    // Auto-create a guest/simulation account to make exploration frictionless!
    foundUser = {
      id: `usr-${Math.random().toString(36).substr(2, 9)}`,
      email: emailLower,
      name: emailLower.split('@')[0].replace(/[^a-zA-Z]/g, ' '),
      role: matchingStore ? 'seller' : 'buyer',
      createdAt: new Date().toISOString()
    };
    
    if (matchingStore) {
      foundUser.storeSlug = matchingStore.slug;
    }

    users.push(foundUser);
    setLocalData(AUTH_USERS_KEY, users);
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(foundUser));
  return foundUser;
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function signOutUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

/**
 * SQL SCHEMA FOR SUPABASE REFERENCE:
 * Make sure to run this SQL block in your Supabase SQL Editor to establish tables!
 * 
 * -- Enable UUID generation extension
 * CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
 * 
 * -- 0. USERS TABLE
 * CREATE TABLE tradehub_users (
 *   id TEXT PRIMARY KEY,
 *   email TEXT NOT NULL UNIQUE,
 *   name TEXT NOT NULL,
 *   role TEXT CHECK (role IN ('seller', 'buyer')) NOT NULL,
 *   store_slug TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
 * );
 * 
 * -- 1. STORES TABLE
 * CREATE TABLE tradehub_stores (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   name TEXT NOT NULL,
 *   slug TEXT NOT NULL UNIQUE,
 *   description TEXT NOT NULL,
 *   category TEXT NOT NULL,
 *   banner_color TEXT NOT NULL,
 *   bank_name TEXT NOT NULL,
 *   account_number TEXT NOT NULL,
 *   paystack_subaccount TEXT NOT NULL,
 *   seller_email TEXT NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
 * );
 * 
 * -- 2. PRODUCTS TABLE
 * CREATE TABLE tradehub_products (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   store_id UUID REFERENCES tradehub_stores(id) ON DELETE CASCADE NOT NULL,
 *   name TEXT NOT NULL,
 *   description TEXT NOT NULL,
 *   price NUMERIC NOT NULL,
 *   image_url TEXT NOT NULL,
 *   stock INT NOT NULL DEFAULT 0,
 *   category TEXT NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
 * );
 * 
 * -- 3. ORDERS TABLE
 * CREATE TABLE tradehub_orders (
 *   id TEXT PRIMARY KEY, -- e.g. TH-12345-NG
 *   store_id UUID REFERENCES tradehub_stores(id) ON DELETE CASCADE NOT NULL,
 *   store_name TEXT NOT NULL,
 *   buyer_name TEXT NOT NULL,
 *   buyer_email TEXT NOT NULL,
 *   buyer_phone TEXT NOT NULL,
 *   delivery_address TEXT NOT NULL,
 *   items JSONB NOT NULL,
 *   total_amount NUMERIC NOT NULL,
 *   platform_fee NUMERIC NOT NULL,
 *   seller_share NUMERIC NOT NULL,
 *   paystack_subaccount TEXT NOT NULL,
 *   paystack_reference TEXT NOT NULL,
 *   status TEXT CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'disputed', 'refunded')) NOT NULL,
 *   escrow_status TEXT CHECK (escrow_status IN ('held', 'released', 'locked_dispute', 'returned')) NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
 * );
 * 
 * -- 4. DISPUTES TABLE
 * CREATE TABLE tradehub_disputes (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   order_id TEXT REFERENCES tradehub_orders(id) ON DELETE CASCADE NOT NULL,
 *   buyer_email TEXT NOT NULL,
 *   reason TEXT NOT NULL,
 *   description TEXT NOT NULL,
 *   status TEXT CHECK (status IN ('open', 'resolved_refunded', 'resolved_released')) NOT NULL,
 *   seller_response TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
 * );
 */
