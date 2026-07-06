/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  bannerColor: string;
  bankName: string;
  accountNumber: string;
  paystackSubaccount: string; // e.g. ACCT_xxxxx
  sellerEmail: string;
  createdAt: string;
  logoUrl?: string;
  bannerUrl?: string;
  accentColor?: string;
  headerFont?: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string; // e.g. TH-XXXX-NG
  storeId: string;
  storeName: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  totalAmount: number;
  platformFee: number; // 10%
  sellerShare: number; // 90%
  paystackSubaccount: string;
  paystackReference: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'disputed' | 'refunded';
  escrowStatus: 'held' | 'released' | 'locked_dispute' | 'returned';
  createdAt: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  buyerEmail: string;
  reason: string;
  description: string;
  status: 'open' | 'resolved_refunded' | 'resolved_released';
  sellerResponse?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'seller' | 'buyer';
  createdAt: string;
  // Seller-specific details can be linked
  storeSlug?: string;
}

