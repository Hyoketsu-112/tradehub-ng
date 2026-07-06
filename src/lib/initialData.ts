/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Store, Product, Order, Dispute } from '../types';

export const INITIAL_STORES: Store[] = [
  {
    id: 'store-1',
    name: "Yinka's Fashion & Beads",
    slug: 'yinka-fashion',
    description: 'Handmade African beads, Ankara fabrics, and modern traditional wears designed for premium comfort and style.',
    category: 'Fashion',
    bannerColor: 'from-pink-500 via-rose-500 to-amber-500',
    bankName: 'Access Bank',
    accountNumber: '0123456789',
    paystackSubaccount: 'ACCT_yinka3429',
    sellerEmail: 'yinka@example.com',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
  },
  {
    id: 'store-2',
    name: "Aliko's Agro Traders",
    slug: 'aliko-agro',
    description: 'Direct farm-fresh produce including premium Nigerian ofada rice, organic cocoa powder, and wholesale spices.',
    category: 'Agriculture',
    bannerColor: 'from-emerald-500 via-teal-600 to-cyan-700',
    bankName: 'Zenith Bank',
    accountNumber: '9876543210',
    paystackSubaccount: 'ACCT_aliko7821',
    sellerEmail: 'aliko@example.com',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
  },
  {
    id: 'store-3',
    name: "Kunle's Tech Hub",
    slug: 'kunle-tech',
    description: 'Premium electronics accessories, phone mounts, and ergonomic desk accessories with full buyer warranty.',
    category: 'Electronics',
    bannerColor: 'from-indigo-600 via-purple-600 to-blue-700',
    bankName: 'Guaranty Trust Bank',
    accountNumber: '0456123789',
    paystackSubaccount: 'ACCT_kunle9184',
    sellerEmail: 'kunle@example.com',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // Yinka's Fashion & Beads (store-1)
  {
    id: 'prod-1-1',
    storeId: 'store-1',
    name: 'Handmade Ankara Bead Neckpiece',
    description: 'Stunning premium layered bead collar crafted meticulously with authentic Ankara fabric wraps and gold-plated alloy details.',
    price: 12500,
    imageUrl: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=600&q=80',
    stock: 12,
    category: 'Necklaces',
    createdAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-1-2',
    storeId: 'store-1',
    name: 'Royal Coral Wedding Beads Set',
    description: 'Traditional Nigerian bride bead set including heavy coral neckpiece, wristbands, and earrings. Perfect for traditional weddings (Igbankwu/Edo).',
    price: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    stock: 5,
    category: 'Bead Sets',
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-1-3',
    storeId: 'store-1',
    name: 'Premium Handwoven Aso Oke Cap (Fila)',
    description: 'Finely-textured handwoven Aso-Oke cap with exquisite stitching. Flexible, durable, and matches all traditional wears.',
    price: 8000,
    imageUrl: 'https://images.unsplash.com/photo-1534215754734-18e55d13ce35?auto=format&fit=crop&w=600&q=80',
    stock: 20,
    category: 'Caps',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Aliko's Agro Traders (store-2)
  {
    id: 'prod-2-1',
    storeId: 'store-2',
    name: 'Premium Ofada Rice - Stone-Free (5kg)',
    description: 'Delicious, highly aromatic traditional brown Ofada rice. Carefully parboiled, cleaned, and packed. Completely stone-free.',
    price: 18500,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    stock: 50,
    category: 'Grains',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-2-2',
    storeId: 'store-2',
    name: 'Organic Nigerian Cocoa Powder (1kg)',
    description: '100% pure unsweetened organic cocoa powder sourced from selected cocoa farms in Western Nigeria. Rich in antioxidants and deep chocolate taste.',
    price: 9500,
    imageUrl: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=600&q=80',
    stock: 35,
    category: 'Beverages',
    createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-2-3',
    storeId: 'store-2',
    name: 'Dried Hibiscus Flowers (Zobo) - Large Pack',
    description: 'Sun-dried high-quality deep red calyces of Hibiscus Sabdariffa. Yields thick, rich, flavorful zobo juice without additives.',
    price: 6000,
    imageUrl: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80',
    stock: 100,
    category: 'Herbs',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Kunle's Tech Hub (store-3)
  {
    id: 'prod-3-1',
    storeId: 'store-3',
    name: '15W Fast Wireless Desktop Charger',
    description: 'Sleek aluminum base with dual coil technology. Supports fast charging for iPhone, Samsung, and AirPods with automatic temperature cut-off.',
    price: 22000,
    imageUrl: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&w=600&q=80',
    stock: 15,
    category: 'Chargers',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-3-2',
    storeId: 'store-3',
    name: 'Mechanical RGB Hot-Swappable Keyboard',
    description: '60% layout mechanical keyboard with pre-lubed brown switches, double-shot PBT keycaps, and dynamic per-key customization.',
    price: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    stock: 8,
    category: 'Keyboards',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'TH-59821-NG',
    storeId: 'store-1',
    storeName: "Yinka's Fashion & Beads",
    buyerName: 'Chioma Nze',
    buyerEmail: 'chioma.nze@example.com',
    buyerPhone: '08031234567',
    deliveryAddress: '24, Isaac John Street, Ikeja, Lagos State',
    items: [
      {
        productId: 'prod-1-1',
        productName: 'Handmade Ankara Bead Neckpiece',
        price: 12500,
        quantity: 2
      }
    ],
    totalAmount: 25000,
    platformFee: 2500,
    sellerShare: 22500,
    paystackSubaccount: 'ACCT_yinka3429',
    paystackReference: 'PSTK_783149817_LIVE',
    status: 'delivered',
    escrowStatus: 'released',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'TH-92184-NG',
    storeId: 'store-2',
    storeName: "Aliko's Agro Traders",
    buyerName: 'Babajide Sanwo',
    buyerEmail: 'jide.sanwo@example.com',
    buyerPhone: '09055566778',
    deliveryAddress: 'Block B, Court Estate, Lekki Phase 1, Lagos State',
    items: [
      {
        productId: 'prod-2-1',
        productName: 'Premium Ofada Rice - Stone-Free (5kg)',
        price: 18500,
        quantity: 1
      },
      {
        productId: 'prod-2-3',
        productName: 'Dried Hibiscus Flowers (Zobo) - Large Pack',
        price: 6000,
        quantity: 2
      }
    ],
    totalAmount: 30500,
    platformFee: 3050,
    sellerShare: 27450,
    paystackSubaccount: 'ACCT_aliko7821',
    paystackReference: 'PSTK_918471204_LIVE',
    status: 'shipped',
    escrowStatus: 'held',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'TH-10824-NG',
    storeId: 'store-3',
    storeName: "Kunle's Tech Hub",
    buyerName: 'Emeka Obi',
    buyerEmail: 'emeka@example.com',
    buyerPhone: '08122334455',
    deliveryAddress: '15, Port Harcourt Crescent, Garki, Abuja FCT',
    items: [
      {
        productId: 'prod-3-1',
        productName: '15W Fast Wireless Desktop Charger',
        price: 22000,
        quantity: 1
      }
    ],
    totalAmount: 22000,
    platformFee: 2200,
    sellerShare: 19800,
    paystackSubaccount: 'ACCT_kunle9184',
    paystackReference: 'PSTK_31481024_LIVE',
    status: 'disputed',
    escrowStatus: 'locked_dispute',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_DISPUTES: Dispute[] = [
  {
    id: 'disp-1',
    orderId: 'TH-10824-NG',
    buyerEmail: 'emeka@example.com',
    reason: 'Defective Product / Damaged',
    description: 'The wireless desktop charger does not charge my device when plugged in. It has a visible dent on the base. I would like a refund or replacement.',
    status: 'open',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];
