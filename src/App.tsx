/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Store, Product, Order, Dispute, User } from './types';
import { 
  getStores, 
  getProducts, 
  getOrders, 
  getDisputes, 
  createStore as dbCreateStore,
  updateStore as dbUpdateStore,
  createProduct as dbCreateProduct,
  updateProduct as dbUpdateProduct,
  deleteProduct as dbDeleteProduct,
  createOrder as dbCreateOrder,
  updateOrderStatus as dbUpdateOrderStatus,
  createDispute as dbCreateDispute,
  updateDisputeStatus as dbUpdateDisputeStatus,
  isSandboxMode,
  getCurrentUser,
  signOutUser
} from './lib/db';

import Navbar from './components/Navbar';
import LandingHub from './components/LandingHub';
import Storefront from './components/Storefront';
import SellerDashboard from './components/SellerDashboard';
import BuyerProtection from './components/BuyerProtection';
import AuthModal from './components/AuthModal';
import TourGuide from './components/TourGuide';
import { Info, HelpCircle } from 'lucide-react';

export default function App() {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const isSandbox = isSandboxMode();

  // Load current user on mount
  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [fetchedStores, fetchedProducts, fetchedOrders, fetchedDisputes] = await Promise.all([
          getStores(),
          getProducts(),
          getOrders(),
          getDisputes()
        ]);
        setStores(fetchedStores);
        setProducts(fetchedProducts);
        setOrders(fetchedOrders);
        setDisputes(fetchedDisputes);
      } catch (err) {
        console.error('Failed to load Tradehub data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Set up standard popstate router
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Navigation router helper
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Derive current view & active store slug
  const getRouteInfo = () => {
    const path = currentPath;
    if (path.startsWith('/store/')) {
      const slug = path.split('/store/')[1]?.split('?')[0];
      return { view: 'storefront' as const, slug };
    }
    if (path === '/seller' || path === '/dashboard') {
      return { view: 'seller' as const };
    }
    if (path === '/tracker' || path === '/protection') {
      return { view: 'tracker' as const };
    }
    return { view: 'hub' as const };
  };

  const { view, slug: activeStoreSlug } = getRouteInfo();

  // STORES WRAPPERS
  const handleCreateStore = async (newStoreData: Omit<Store, 'id' | 'createdAt'>) => {
    const created = await dbCreateStore(newStoreData);
    setStores(prev => [created, ...prev]);
    return created;
  };

  const handleUpdateStore = async (id: string, updates: Partial<Omit<Store, 'id' | 'createdAt'>>) => {
    const updated = await dbUpdateStore(id, updates);
    if (updated) {
      setStores(prev => prev.map(s => s.id === id ? updated : s));
    }
    return updated;
  };

  // PRODUCTS WRAPPERS
  const handleAddProduct = async (newProductData: Omit<Product, 'id' | 'createdAt'>) => {
    const created = await dbCreateProduct(newProductData);
    setProducts(prev => [created, ...prev]);
    return created;
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'storeId' | 'createdAt'>>) => {
    const updated = await dbUpdateProduct(id, updates);
    if (updated) {
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
    }
    return updated;
  };

  const handleDeleteProduct = async (id: string) => {
    const success = await dbDeleteProduct(id);
    if (success) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
    return success;
  };

  // ORDERS WRAPPERS
  const handleCreateOrder = async (newOrderData: Omit<Order, 'id' | 'createdAt'>) => {
    const created = await dbCreateOrder(newOrderData);
    setOrders(prev => [created, ...prev]);
    
    // Refresh products to capture stock decreases
    const updatedProducts = await getProducts();
    setProducts(updatedProducts);
    
    return created;
  };

  const handleConfirmDelivery = async (orderId: string) => {
    const updated = await dbUpdateOrderStatus(orderId, 'delivered', 'released');
    if (updated) {
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    }
    return updated;
  };

  const handleShipOrder = async (orderId: string) => {
    const updated = await dbUpdateOrderStatus(orderId, 'shipped', 'held');
    if (updated) {
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    }
    return updated;
  };

  // DISPUTES WRAPPERS
  const handleFileDispute = async (newDisputeData: Omit<Dispute, 'id' | 'createdAt'>) => {
    const created = await dbCreateDispute(newDisputeData);
    setDisputes(prev => [created, ...prev]);

    // Dispute creation automatically marks order as disputed in local DB, so sync orders state
    const updatedOrders = await getOrders();
    setOrders(updatedOrders);
    
    return created;
  };

  const handleResolveDispute = async (disputeId: string, status: Dispute['status'], response: string) => {
    const updatedDispute = await dbUpdateDisputeStatus(disputeId, status, response);
    if (updatedDispute) {
      setDisputes(prev => prev.map(d => d.id === disputeId ? updatedDispute : d));
      
      // Update corresponding order status based on resolution type
      const orderStatus = status === 'resolved_refunded' ? 'refunded' as const : 'delivered' as const;
      const escrowStatus = status === 'resolved_refunded' ? 'returned' as const : 'released' as const;
      
      const updatedOrder = await dbUpdateOrderStatus(updatedDispute.orderId, orderStatus, escrowStatus);
      if (updatedOrder) {
        setOrders(prev => prev.map(o => o.id === updatedDispute.orderId ? updatedOrder : o));
      }
    }
    return updatedDispute;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-gray-500">Loading Tradehub-Ng ecosystem...</p>
        </div>
      </div>
    );
  }

  // Find active store for storefront view
  const activeStore = activeStoreSlug ? stores.find(s => s.slug.toLowerCase() === activeStoreSlug.toLowerCase()) : null;

  return (
    <div id="tradehub-app-root" className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        {/* Sandbox Indicator Warning */}
        {isSandbox && (
          <div id="sandbox-banner" className="bg-amber-500 text-white text-xs px-4 py-2.5 flex items-center justify-center gap-2 font-semibold">
            <Info className="h-4 w-4 flex-shrink-0 animate-bounce" />
            <span>
              👉 <strong>Sandbox LocalStorage Mode Active:</strong> Add your <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to secrets to connect your live Supabase SQL Database!
            </span>
          </div>
        )}

        {/* Global Navigation Header (hidden inside buyer storefront for clean immersion) */}
        {view !== 'storefront' && (
          <Navbar 
            currentView={view} 
            onNavigate={(v) => navigateTo(v === 'hub' ? '/' : `/${v}`)} 
            isSandbox={isSandbox}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onLogout={() => {
              signOutUser();
              setCurrentUser(null);
              navigateTo('/');
            }}
          />
        )}

        {/* Dynamic Route Switcher */}
        {view === 'storefront' ? (
          activeStore ? (
            <Storefront
              store={activeStore}
              products={products.filter(p => p.storeId === activeStore.id)}
              onBack={() => navigateTo('/')}
              onCreateOrder={handleCreateOrder}
              onUpdateStore={handleUpdateStore}
            />
          ) : (
            <div className="mx-auto max-w-md px-4 py-16 text-center">
              <h2 className="text-2xl font-black text-gray-900">Storefront Not Found</h2>
              <p className="text-gray-500 text-xs mt-1">The store URL path you visited does not match any hosted seller.</p>
              <button
                onClick={() => navigateTo('/')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
              >
                Go to Hub Homepage
              </button>
            </div>
          )
        ) : view === 'seller' ? (
          <SellerDashboard
            stores={stores}
            products={products}
            orders={orders}
            disputes={disputes}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onShipOrder={handleShipOrder}
            onResolveDispute={handleResolveDispute}
            onUpdateStore={handleUpdateStore}
            currentUser={currentUser}
          />
        ) : view === 'tracker' ? (
          <BuyerProtection
            orders={orders}
            onConfirmDelivery={handleConfirmDelivery}
            onFileDispute={handleFileDispute}
            currentUser={currentUser}
          />
        ) : (
          <LandingHub
            stores={stores}
            onSelectStore={(slug) => navigateTo(`/store/${slug}`)}
            onCreateStore={handleCreateStore}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            if (user.role === 'seller') {
              navigateTo('/seller');
            } else {
              navigateTo('/tracker');
            }
          }}
        />

        <TourGuide 
          currentView={view} 
          onNavigate={(targetView) => navigateTo(targetView === 'hub' ? '/' : `/${targetView}`)} 
          currentUser={currentUser} 
        />
      </div>

      {/* Global Simple Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        <p>© 2026 Tradehub-Ng. Secured automated payouts powered by Paystack API splitting. Guaranteed Buyer Protection Escrow.</p>
      </footer>
    </div>
  );
}
