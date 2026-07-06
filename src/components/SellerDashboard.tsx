/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Store, Product, Order, Dispute, User } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  DollarSign, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  ShieldAlert,
  Clock,
  CheckCircle2,
  Users,
  Eye,
  FileText,
  Copy,
  Check,
  QrCode,
  Camera,
  CameraOff,
  Sliders,
  Upload
} from 'lucide-react';

interface SellerDashboardProps {
  stores: Store[];
  products: Product[];
  orders: Order[];
  disputes: Dispute[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<Product>;
  onUpdateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'storeId' | 'createdAt'>>) => Promise<Product | null>;
  onDeleteProduct: (id: string) => Promise<boolean>;
  onShipOrder: (orderId: string) => Promise<Order | null>;
  onResolveDispute: (disputeId: string, status: Dispute['status'], response: string) => Promise<Dispute | null>;
  onUpdateStore?: (id: string, updates: Partial<Omit<Store, 'id' | 'createdAt'>>) => Promise<Store | null>;
  currentUser?: User | null;
}

export default function SellerDashboard({
  stores,
  products,
  orders,
  disputes,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onShipOrder,
  onResolveDispute,
  onUpdateStore,
  currentUser
}: SellerDashboardProps) {
  // Store selector
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // Modal / Form States
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState<Product | null>(null);

  // Form inputs
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pStock, setPStock] = useState('');
  const [pCategory, setPCategory] = useState('Fashion');
  const [pImgUrl, setPImgUrl] = useState('');

  // Dispute feedback state
  const [resolvingDisputeId, setResolvingDisputeId] = useState<string | null>(null);
  const [sellerResponseText, setSellerResponseText] = useState('');
  const [dashboardLinkCopied, setDashboardLinkCopied] = useState(false);

  // Store customization form inputs
  const [sAccentColor, setSAccentColor] = useState('#008751');
  const [sHeaderFont, setSHeaderFont] = useState('font-serif');

  // Device Camera States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // File Upload states and refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, etc.).');
      return;
    }
    // Limit file size to 3MB for localStorage capability
    if (file.size > 3 * 1024 * 1024) {
      alert('Image is too large. Please select an image under 3MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPImgUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } }
      });
      mediaStreamRef.current = stream;
      // Small timeout to ensure videoRef element is rendered and bound in DOM
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setCameraError('Could not access device camera. Please verify permission settings.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 640;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPImgUrl(dataUrl);
        stopCamera();
      }
    }
  };

  // Clean up camera when modal closes
  useEffect(() => {
    if (!isAddProductOpen && !isEditProductOpen) {
      stopCamera();
    }
  }, [isAddProductOpen, isEditProductOpen]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Set default store on load
  useEffect(() => {
    if (stores.length > 0 && !selectedStore) {
      if (currentUser?.role === 'seller') {
        const matchingStore = stores.find(s => s.sellerEmail.toLowerCase() === currentUser.email.toLowerCase());
        if (matchingStore) {
          setSelectedStore(matchingStore);
          return;
        }
      }
      setSelectedStore(stores[0]);
    }
  }, [stores, selectedStore, currentUser]);

  if (stores.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <ShieldAlert className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-gray-900">No Stores Registered Under Your Console</h2>
        <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
          Please go back to the homepage and register your first storefront. Tradehub automatically configures your Paystack Subaccount split upon registration!
        </p>
      </div>
    );
  }

  const activeStore = selectedStore || stores[0];

  useEffect(() => {
    if (activeStore) {
      setSAccentColor(activeStore.accentColor || '#008751');
      setSHeaderFont(activeStore.headerFont || 'font-serif');
    }
  }, [activeStore?.id, activeStore?.accentColor, activeStore?.headerFont]);

  const storefrontUrl = `${window.location.origin}/store/${activeStore.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storefrontUrl);
    setDashboardLinkCopied(true);
    setTimeout(() => setDashboardLinkCopied(false), 2000);
  };

  // Filters
  const storeProducts = products.filter(p => p.storeId === activeStore.id);
  const storeOrders = orders.filter(o => o.storeId === activeStore.id);
  const storeDisputes = disputes.filter(d => {
    const matchedOrder = orders.find(o => o.id === d.orderId);
    return matchedOrder && matchedOrder.storeId === activeStore.id;
  });

  // Calculate Financials
  const totalVolume = storeOrders
    .filter(o => o.status !== 'pending' && o.status !== 'refunded')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingEscrow = storeOrders
    .filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'disputed')
    .filter(o => o.escrowStatus === 'held' || o.escrowStatus === 'locked_dispute')
    .reduce((sum, o) => sum + o.sellerShare, 0);

  const clearedPayouts = storeOrders
    .filter(o => o.escrowStatus === 'released')
    .reduce((sum, o) => sum + o.sellerShare, 0);

  const feesCollected = storeOrders
    .filter(o => o.status !== 'pending' && o.status !== 'refunded')
    .reduce((sum, o) => sum + o.platformFee, 0);

  // Handlers
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pDesc || !pPrice || !pStock || !pImgUrl) {
      alert('All fields are required.');
      return;
    }

    try {
      await onAddProduct({
        storeId: activeStore.id,
        name: pName,
        description: pDesc,
        price: parseFloat(pPrice),
        stock: parseInt(pStock),
        category: pCategory,
        imageUrl: pImgUrl,
      });

      // Clear
      setPName('');
      setPDesc('');
      setPPrice('');
      setPStock('');
      setPImgUrl('');
      setIsAddProductOpen(false);
      alert('Product created and listed successfully on your storefront!');
    } catch (err) {
      console.error(err);
      alert('Failed to list product.');
    }
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditProductOpen) return;

    try {
      await onUpdateProduct(isEditProductOpen.id, {
        name: pName,
        description: pDesc,
        price: parseFloat(pPrice),
        stock: parseInt(pStock),
        category: pCategory,
        imageUrl: pImgUrl,
      });

      setIsEditProductOpen(null);
      setPName('');
      setPDesc('');
      setPPrice('');
      setPStock('');
      setPImgUrl('');
      alert('Product updated successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to update product.');
    }
  };

  const handleCloseModal = () => {
    setIsAddProductOpen(false);
    setIsEditProductOpen(null);
    setPName('');
    setPDesc('');
    setPPrice('');
    setPStock('');
    setPImgUrl('');
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerEdit = (product: Product) => {
    setIsEditProductOpen(product);
    setPName(product.name);
    setPDesc(product.description);
    setPPrice(product.price.toString());
    setPStock(product.stock.toString());
    setPCategory(product.category);
    setPImgUrl(product.imageUrl);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to remove this product from your catalog?')) {
      await onDeleteProduct(id);
    }
  };

  const handleShip = async (id: string) => {
    const updated = await onShipOrder(id);
    if (updated) {
      alert(`Order ${id} marked as SHIPPED! Customer has been notified. Funds are held safely in escrow.`);
    }
  };

  const handleDisputeResolution = async (dId: string, resolution: Dispute['status']) => {
    if (!sellerResponseText) {
      alert('Please provide a message or response details for the resolution.');
      return;
    }
    
    try {
      await onResolveDispute(dId, resolution, sellerResponseText);
      setResolvingDisputeId(null);
      setSellerResponseText('');
      alert(`Dispute resolved. Payout has been updated.`);
    } catch (err) {
      console.error(err);
      alert('Error saving dispute response.');
    }
  };

  const handleSaveCustomization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateStore) return;

    try {
      await onUpdateStore(activeStore.id, {
        accentColor: sAccentColor,
        headerFont: sHeaderFont
      });
      alert('Storefront customization saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save storefront customization.');
    }
  };

  const formatNaira = (num: number) => {
    return '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <div className="bg-editorial-bg min-h-screen py-12 px-4 sm:px-6 lg:px-8 text-editorial-text">
      {/* Console Header */}
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12 border-b border-editorial-text/20 pb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-editorial-text/50 mb-2 font-bold">Control Room</p>
          <h1 className="text-4xl sm:text-5xl font-serif italic tracking-tight">Seller Control Console<span className="text-editorial-accent">.</span></h1>
          <p className="text-editorial-text/60 text-xs mt-1">Manage stock, track direct payouts, and handle buyer protection escrow.</p>
        </div>

        {/* Store Switcher Selector */}
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-bold text-editorial-text/50 uppercase tracking-widest whitespace-nowrap">Active Storefront:</label>
          <select
            value={activeStore.id}
            onChange={(e) => {
              const matched = stores.find(s => s.id === e.target.value);
              if (matched) setSelectedStore(matched);
            }}
            className="px-3 py-2 border border-editorial-text/20 bg-editorial-bg text-xs font-bold text-editorial-text focus:outline-none focus:border-editorial-text"
          >
            {stores.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Board Section */}
      <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-editorial-beige border border-editorial-text/10 p-6 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-editorial-text/50 uppercase tracking-wider">Total Sales Volume</span>
            <DollarSign className="h-4 w-4 text-editorial-text/40" />
          </div>
          <div>
            <p className="text-3xl font-serif text-editorial-text">{formatNaira(totalVolume)}</p>
            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-editorial-accent font-bold mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>Includes splits</span>
            </span>
          </div>
        </div>

        <div className="bg-editorial-beige border border-editorial-text/10 p-6 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-editorial-text/50 uppercase tracking-wider">Held In Escrow 🔒</span>
            <Clock className="h-4 w-4 text-editorial-accent" />
          </div>
          <div>
            <p className="text-3xl font-serif text-editorial-accent">{formatNaira(pendingEscrow)}</p>
            <span className="text-[9px] uppercase tracking-wider text-editorial-text/50 mt-1 block">In delivery / dispute</span>
          </div>
        </div>

        <div className="bg-editorial-beige border border-editorial-text/10 p-6 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-editorial-text/50 uppercase tracking-wider">Cleared Payouts (90%)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-3xl font-serif text-emerald-700">{formatNaira(clearedPayouts)}</p>
            <span className="text-[9px] uppercase tracking-wider text-emerald-600 font-bold mt-1 block">Direct to bank</span>
          </div>
        </div>

        <div className="bg-editorial-beige border border-editorial-text/10 p-6 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-editorial-text/50 uppercase tracking-wider">Hub Splits Paid (10%)</span>
            <Users className="h-4 w-4 text-editorial-text/40" />
          </div>
          <div>
            <p className="text-3xl font-serif text-editorial-text/60">{formatNaira(feesCollected)}</p>
            <span className="text-[9px] uppercase tracking-wider text-editorial-text/40 mt-1 block">Platform cut</span>
          </div>
        </div>
      </div>

      {/* Multi-Section Workspace Grid */}
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Inventory Column (Left 2-parts) */}
        <div className="lg:col-span-2 space-y-12">
          {/* Inventory Manager */}
          <div className="bg-editorial-bg border border-editorial-text/15 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-editorial-text/10 pb-6">
              <div>
                <h2 className="text-xl font-serif italic text-editorial-text flex items-center gap-2">
                  <Package className="h-5 w-5 text-editorial-text/70" />
                  <span>Product Catalog ({storeProducts.length})</span>
                </h2>
                <p className="text-xs text-editorial-text/50 mt-1">Control storefront listings, item attributes, and stock quantities.</p>
              </div>

              <button
                id="dashboard-add-product-btn"
                onClick={() => {
                  setPName('');
                  setPDesc('');
                  setPPrice('');
                  setPStock('');
                  setPImgUrl('');
                  setIsAddProductOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-editorial-text text-editorial-bg px-4 py-2.5 text-xs font-bold uppercase tracking-wider border border-editorial-text hover:bg-editorial-accent hover:text-white transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Products Table/Grid */}
            {storeProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-editorial-text/10 text-xs">
                  <thead>
                    <tr className="text-left font-bold text-editorial-text/50 uppercase tracking-widest text-[10px]">
                      <th className="py-3 px-2">Product</th>
                      <th className="py-3 px-2">Category</th>
                      <th className="py-3 px-2 text-right">Price</th>
                      <th className="py-3 px-2 text-center">Stock</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-editorial-text/10">
                    {storeProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-editorial-beige/30 transition-colors">
                        <td className="py-4 px-2 flex items-center gap-4">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="h-12 w-12 object-cover border border-editorial-text/10"
                          />
                          <div>
                            <p className="font-bold text-editorial-text text-sm">{p.name}</p>
                            <p className="text-[10px] text-editorial-text/50 line-clamp-1 mt-0.5">{p.description}</p>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className="border border-editorial-text/20 bg-editorial-beige px-2.5 py-0.5 text-[10px] font-semibold text-editorial-text uppercase tracking-wider">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right font-serif font-bold text-editorial-text text-sm">
                          {formatNaira(p.price)}
                        </td>
                        <td className="py-4 px-2 text-center font-mono">
                          <span className={`font-bold ${p.stock <= 5 ? 'text-editorial-accent' : 'text-editorial-text/70'}`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right space-x-1">
                          <button
                            onClick={() => triggerEdit(p)}
                            className="p-1.5 text-editorial-text/60 hover:text-editorial-text hover:bg-editorial-beige transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-editorial-text/60 hover:text-editorial-accent hover:bg-editorial-accent/5 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-editorial-text/20 bg-editorial-beige/10">
                <Package className="h-8 w-8 text-editorial-text/30 mx-auto mb-3" />
                <p className="text-editorial-text/50 text-xs italic font-serif">Catalog is empty. Add your first product to go live!</p>
              </div>
            )}
          </div>

          {/* Store Orders Ledger */}
          <div className="bg-editorial-bg border border-editorial-text/15 p-6 sm:p-8">
            <div className="mb-8 border-b border-editorial-text/10 pb-6">
              <h2 className="text-xl font-serif italic text-editorial-text flex items-center gap-2">
                <FileText className="h-5 w-5 text-editorial-text/70" />
                <span>Orders Ledger ({storeOrders.length})</span>
              </h2>
              <p className="text-xs text-editorial-text/50 mt-1">Direct payout monitoring, automatic splitting rules, and transit tracking.</p>
            </div>

            {storeOrders.length > 0 ? (
              <div className="space-y-6">
                {storeOrders.map((o) => (
                  <div key={o.id} className="border border-editorial-text/15 p-5 bg-editorial-beige/20 space-y-4">
                    {/* Top Row */}
                    <div className="flex justify-between items-start gap-2 border-b border-editorial-text/10 pb-3">
                      <div>
                        <span className="font-mono font-bold text-editorial-text text-sm select-all">{o.id}</span>
                        <span className="text-[10px] text-editorial-text/40 block mt-1 font-bold uppercase tracking-wider">{new Date(o.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex gap-2">
                        {/* Status chip */}
                        <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider ${
                          o.status === 'paid' ? 'bg-editorial-bg text-editorial-text border-editorial-text' :
                          o.status === 'shipped' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                          o.status === 'delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          o.status === 'disputed' ? 'bg-editorial-accent text-white border-editorial-accent animate-pulse' :
                          'bg-gray-100 text-gray-800 border-gray-300'
                        }`}>
                          {o.status}
                        </span>

                        {/* Escrow chip */}
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                          o.escrowStatus === 'held' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          o.escrowStatus === 'released' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {o.escrowStatus === 'held' ? '🔒 Held in Escrow' :
                           o.escrowStatus === 'released' ? '✓ Escrow Released' :
                           '🚨 Payout Locked'}
                        </span>
                      </div>
                    </div>

                    {/* Middle Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-editorial-text/80 leading-normal text-xs">
                      <div>
                        <p className="font-bold text-editorial-text uppercase tracking-wider text-[9px] mb-1 text-editorial-text/50">Buyer Details:</p>
                        <p className="font-bold">{o.buyerName}</p>
                        <p className="font-mono text-[10px] text-editorial-text/60 mt-0.5">{o.buyerEmail}</p>
                        <p>{o.buyerPhone}</p>
                      </div>

                      <div>
                        <p className="font-bold text-editorial-text uppercase tracking-wider text-[9px] mb-1 text-editorial-text/50">Delivery Address:</p>
                        <p className="font-serif italic">{o.deliveryAddress}</p>
                      </div>

                      <div>
                        <p className="font-bold text-editorial-text uppercase tracking-wider text-[9px] mb-1 text-editorial-text/50">Purchased Items:</p>
                        <ul className="list-disc pl-4 space-y-0.5 italic">
                          {o.items.map((it, idx) => (
                            <li key={idx}>
                              {it.productName} (x{it.quantity})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Financial split details */}
                    <div className="bg-editorial-bg border border-editorial-text/10 p-3.5 flex justify-between font-mono text-[10px] text-editorial-text/60">
                      <span>Total: <strong className="text-editorial-text font-bold">{formatNaira(o.totalAmount)}</strong></span>
                      <span>Your Split (90%): <strong className="text-emerald-700 font-bold">{formatNaira(o.sellerShare)}</strong></span>
                      <span>Tradehub Cut (10%): <strong className="text-editorial-text font-bold">{formatNaira(o.platformFee)}</strong></span>
                    </div>

                    {/* Order action button */}
                    {o.status === 'paid' && (
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => handleShip(o.id)}
                          className="bg-editorial-text text-editorial-bg px-5 py-2.5 text-xs font-bold uppercase tracking-wider border border-editorial-text hover:bg-editorial-accent hover:text-white transition-all"
                        >
                          Ship / Dispatch Order
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-editorial-text/20 bg-editorial-beige/10">
                <FileText className="h-8 w-8 text-editorial-text/30 mx-auto mb-3" />
                <p className="text-editorial-text/50 text-xs italic font-serif">No customer orders yet. Transactions will list here once sales occur!</p>
              </div>
            )}
          </div>
        </div>

        {/* Dispute Resolution center (Right Column) */}
        <div className="space-y-8">
          {/* Storefront Sharing & QR Code Card */}
          <div className="bg-editorial-bg border border-editorial-text/15 p-6 sm:p-8 space-y-6">
            <div className="border-b border-editorial-text/10 pb-4">
              <h2 className="text-xl font-serif italic text-editorial-text flex items-center gap-2">
                <QrCode className="h-5 w-5 text-editorial-text/70" />
                <span>Share Storefront</span>
              </h2>
              <p className="text-xs text-editorial-text/50 mt-1">Share your unique storefront link or QR code with customers.</p>
            </div>

            <div className="space-y-4">
              {/* Copy Shop Link widget */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-editorial-text/50 uppercase tracking-widest">Storefront URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={storefrontUrl}
                    className="flex-1 px-3 py-2 border border-editorial-text/20 bg-editorial-beige text-xs font-mono text-editorial-text/80 outline-none select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-editorial-text text-editorial-bg hover:bg-editorial-accent hover:text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {dashboardLinkCopied ? 'Copied!' : 'Copy Shop Link'}
                  </button>
                </div>
              </div>

              {/* QR Code Segment */}
              <div className="bg-editorial-beige border border-editorial-text/10 p-4 flex flex-col sm:flex-row items-center gap-4">
                <a
                  href={storefrontUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 bg-white border border-editorial-text/10 hover:border-editorial-accent transition-colors cursor-pointer flex-shrink-0"
                  title="Click to visit storefront"
                >
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(storefrontUrl)}`}
                    alt="Storefront QR Code"
                    className="w-24 h-24 object-contain"
                  />
                </a>
                <div className="text-center sm:text-left space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-editorial-text">Interactive QR Code</p>
                  <p className="text-[11px] text-editorial-text/60 leading-normal font-serif italic">
                    Scan with a phone camera to visit your live shop, or click to preview.
                  </p>
                  <a
                    href={storefrontUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-editorial-accent hover:underline text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <Eye className="h-3 w-3" />
                    <span>View Live Storefront</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Storefront Theme Settings Card */}
          <div className="bg-editorial-bg border border-editorial-text/15 p-6 sm:p-8 space-y-6">
            <div className="border-b border-editorial-text/10 pb-4">
              <h2 className="text-xl font-serif italic text-editorial-text flex items-center gap-2">
                <Sliders className="h-5 w-5 text-editorial-text/70" />
                <span>Customize Storefront Theme</span>
              </h2>
              <p className="text-xs text-editorial-text/50 mt-1">Configure your active store's brand accent color and typography theme.</p>
            </div>

            <form onSubmit={handleSaveCustomization} className="space-y-6">
              {/* Accent Color Selection */}
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-editorial-text/50 uppercase tracking-widest">Storefront Accent Color</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Tradehub Green', hex: '#008751' },
                    { name: 'Emerald', hex: '#10B981' },
                    { name: 'Indigo', hex: '#6366F1' },
                    { name: 'Rose Red', hex: '#F43F5E' },
                    { name: 'Purple', hex: '#8B5CF6' },
                    { name: 'Amber Gold', hex: '#F59E0B' },
                    { name: 'Slate Gray', hex: '#475569' },
                    { name: 'Crimson', hex: '#DC2626' }
                  ].map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setSAccentColor(col.hex)}
                      className={`h-7 w-7 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${sAccentColor === col.hex ? 'border-editorial-text scale-110 shadow-sm' : 'border-neutral-200 hover:border-neutral-400'}`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {sAccentColor === col.hex && (
                        <Check className="h-3.5 w-3.5 text-white mix-blend-difference" />
                      )}
                    </button>
                  ))}
                </div>
                {/* Custom HEX input */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-editorial-text/50">Custom Hex:</span>
                  <input
                    type="text"
                    value={sAccentColor}
                    onChange={(e) => setSAccentColor(e.target.value)}
                    className="w-24 px-2.5 py-1.5 bg-white border border-editorial-text/20 text-xs font-mono uppercase focus:outline-none focus:border-emerald-600 text-editorial-text"
                  />
                  <div className="w-5 h-5 border border-editorial-text/10" style={{ backgroundColor: sAccentColor }}></div>
                </div>
              </div>

              {/* Header Font Style Selection */}
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-[#008751] uppercase tracking-widest">Header Font Style</label>
                <div className="space-y-2">
                  {[
                    { id: 'font-serif', name: 'Classic Serif', fontClass: 'font-serif', preview: 'Playfair Display' },
                    { id: 'font-fraunces', name: 'Warm Editorial Serif', fontClass: 'font-fraunces', preview: 'Fraunces' },
                    { id: 'font-sans', name: 'Modern Sans-Serif', fontClass: 'font-sans', preview: 'Inter Sans' },
                    { id: 'font-grotesk', name: 'Bold Tech Grotesque', fontClass: 'font-grotesk', preview: 'Space Grotesk' },
                    { id: 'font-mono', name: 'Technical Monospace', fontClass: 'font-mono', preview: 'JetBrains Mono' }
                  ].map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setSHeaderFont(font.id)}
                      className={`w-full px-4 py-3 border text-left transition-all cursor-pointer rounded-xs flex items-center justify-between ${sHeaderFont === font.id ? 'bg-[#008751]/5 border-[#008751] text-emerald-950' : 'bg-white border-neutral-200 hover:border-neutral-300 text-editorial-text'}`}
                    >
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-editorial-text/40">{font.name}</p>
                        <p className={`text-sm mt-0.5 ${font.fontClass}`}>
                          {font.preview} Header
                        </p>
                      </div>
                      {sHeaderFont === font.id && (
                        <Check className="h-4 w-4 text-[#008751]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#008751] hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest py-3 transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-sans"
              >
                <Check className="h-4 w-4" />
                <span>Save Storefront Customize</span>
              </button>
            </form>
          </div>

          <div className="bg-editorial-bg border border-editorial-text/15 p-6 sm:p-8">
            <div className="mb-8 border-b border-editorial-text/10 pb-6">
              <h2 className="text-xl font-serif italic text-editorial-text flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-editorial-accent" />
                <span>Buyer Protection ({storeDisputes.length})</span>
              </h2>
              <p className="text-xs text-editorial-text/50 mt-1">Safety escrow locks. Resolve customer complaints to release funds.</p>
            </div>

            {storeDisputes.length > 0 ? (
              <div className="space-y-4">
                {storeDisputes.map((d) => (
                  <div key={d.id} className="border border-editorial-accent/30 p-4 bg-editorial-accent/5 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-editorial-text/10">
                      <span className="font-bold text-editorial-accent text-[11px] uppercase tracking-wider">🚨 {d.reason}</span>
                      <span className={`px-2 py-0.5 text-[9px] border font-bold uppercase tracking-wider ${
                        d.status === 'open' ? 'bg-editorial-accent text-white border-editorial-accent' : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      }`}>
                        {d.status}
                      </span>
                    </div>

                    <div className="text-xs">
                      <p className="text-editorial-text/50 uppercase tracking-widest text-[9px] mb-0.5">Order Reference:</p>
                      <p className="font-mono font-bold text-editorial-text">{d.orderId}</p>
                    </div>

                    <div className="text-xs leading-relaxed bg-editorial-bg p-3 border border-editorial-accent/15">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-editorial-accent mb-1">Buyer Complaint:</p>
                      <p className="italic text-editorial-text/80">"{d.description}"</p>
                    </div>

                    {d.sellerResponse && (
                      <div className="text-xs leading-relaxed bg-editorial-bg p-3 border border-editorial-text/10">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-editorial-text/50 mb-1">Your Resolution Response:</p>
                        <p className="text-editorial-text/70 italic">"{d.sellerResponse}"</p>
                      </div>
                    )}

                    {d.status === 'open' && (
                      <div className="pt-2">
                        {resolvingDisputeId === d.id ? (
                          <div className="space-y-3">
                            <textarea
                              required
                              rows={2}
                              placeholder="Write details of replacement shipping, refund authorization, or explain resolution terms..."
                              value={sellerResponseText}
                              onChange={(e) => setSellerResponseText(e.target.value)}
                              className="w-full px-3 py-2 border border-editorial-text/20 bg-editorial-bg text-xs focus:outline-none focus:border-editorial-text font-serif italic"
                            />
                            <div className="flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={() => handleDisputeResolution(d.id, 'resolved_refunded')}
                                className="w-full text-center py-2 border border-editorial-accent bg-editorial-accent text-white font-bold text-[10px] uppercase tracking-wider"
                              >
                                Authorize Refund
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDisputeResolution(d.id, 'resolved_released')}
                                className="w-full text-center py-2 bg-editorial-text text-editorial-bg font-bold text-[10px] uppercase tracking-wider border border-editorial-text"
                              >
                                Authorize Payout Release
                              </button>
                              <button
                                type="button"
                                onClick={() => setResolvingDisputeId(null)}
                                className="w-full text-center py-1.5 border border-editorial-text/20 text-editorial-text/60 text-[10px]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setResolvingDisputeId(d.id)}
                            className="w-full text-center py-2.5 bg-editorial-bg border border-editorial-text text-[10px] font-bold uppercase tracking-wider hover:bg-editorial-beige transition-colors"
                          >
                            Resolve Complaint
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-editorial-text/20 bg-editorial-beige/10">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-3 animate-pulse" />
                <p className="text-editorial-text/60 text-xs italic font-serif">100% healthy transactions! No active buyer protection logs.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {(isAddProductOpen || isEditProductOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-editorial-text/60 overflow-y-auto">
          <div className="bg-editorial-bg max-w-md w-full border border-editorial-text shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-editorial-text/10 flex justify-between items-center bg-editorial-beige/50">
              <h3 className="text-lg font-serif italic text-editorial-text">
                {isEditProductOpen ? 'Modify Product Details' : 'List New Product'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-editorial-text/50 hover:text-editorial-text font-bold"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={isEditProductOpen ? handleEditProductSubmit : handleAddProductSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[9px] font-bold text-editorial-text/50 mb-1 uppercase tracking-widest">Product Title *</label>
                <input
                  id="tour-product-title"
                  type="text"
                  required
                  placeholder="e.g. Royal Silk Handwoven Agbada"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-editorial-bg border border-editorial-text/20 text-xs focus:outline-none focus:border-editorial-text"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-editorial-text/50 mb-1 uppercase tracking-widest">Product Description *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Provide fabric specs, sizes, quality guarantees..."
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  className="w-full px-3 py-2.5 bg-editorial-bg border border-editorial-text/20 text-xs focus:outline-none focus:border-editorial-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-editorial-text/50 mb-1 uppercase tracking-widest">Price (NGN ₦) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15000"
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full px-3 py-2.5 bg-editorial-bg border border-editorial-text/20 text-xs focus:outline-none focus:border-editorial-text font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-editorial-text/50 mb-1 uppercase tracking-widest">Available Stock *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 10"
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    className="w-full px-3 py-2.5 bg-editorial-bg border border-editorial-text/20 text-xs focus:outline-none focus:border-editorial-text font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-editorial-text/50 mb-1 uppercase tracking-widest">Category</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-editorial-bg border border-editorial-text/20 text-xs focus:outline-none focus:border-editorial-text"
                  >
                    <option value="Necklaces">Necklaces</option>
                    <option value="Bead Sets">Bead Sets</option>
                    <option value="Caps">Caps</option>
                    <option value="Grains">Grains</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Herbs">Herbs</option>
                    <option value="Chargers">Chargers</option>
                    <option value="Keyboards">Keyboards</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-editorial-text/50 mb-1 uppercase tracking-widest">Image URL / Reference *</label>
                  <input
                    type="text"
                    required
                    placeholder="Unsplash URL or use camera below"
                    value={pImgUrl}
                    onChange={(e) => setPImgUrl(e.target.value)}
                    className="w-full px-3 py-2.5 bg-editorial-bg border border-editorial-text/20 text-xs focus:outline-none focus:border-editorial-text font-mono"
                  />
                </div>
              </div>

              {/* Product Image File Upload & Drag-and-Drop */}
              <div 
                id="tour-product-upload"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border border-dashed p-5 text-center cursor-pointer transition-all rounded-sm flex flex-col items-center justify-center ${
                  isDragging 
                    ? 'border-editorial-accent bg-editorial-accent/5 scale-[1.01]' 
                    : 'border-editorial-text/20 bg-editorial-beige/30 hover:border-editorial-text/40 hover:bg-editorial-beige/50'
                }`}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Upload className="h-5 w-5 text-editorial-text/60 mb-2 animate-bounce" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-editorial-text">
                  Drag & Drop Product Image
                </p>
                <p className="text-[9px] text-editorial-text/50 font-serif italic mt-0.5">
                  or <span className="underline font-sans not-italic font-bold text-editorial-accent text-[10px]">click to upload file</span>
                </p>
                <p className="text-[8px] text-editorial-text/40 font-mono mt-1 uppercase">
                  PNG, JPG, WEBP, GIF up to 3MB
                </p>
              </div>

              {/* Device Camera Capture Integration */}
              <div className="border border-editorial-text/10 bg-editorial-beige p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-text/70 flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-editorial-accent" />
                    <span>Product Camera Capture</span>
                  </span>
                  {!isCameraActive ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-2.5 py-1 bg-editorial-accent text-white hover:opacity-90 transition-opacity text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="h-3 w-3" />
                      <span>Start Camera</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-2.5 py-1 bg-neutral-600 text-white hover:opacity-90 transition-opacity text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <CameraOff className="h-3 w-3" />
                      <span>Stop Feed</span>
                    </button>
                  )}
                </div>

                {isCameraActive && (
                  <div className="space-y-3">
                    <div className="relative aspect-video bg-black border border-black overflow-hidden flex items-center justify-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 right-2 flex justify-center">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="px-4 py-2 bg-editorial-accent text-white hover:bg-emerald-700 transition-colors text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer"
                        >
                          <Camera className="h-4 w-4" />
                          <span>Capture Photo</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-[9px] text-editorial-text/50 font-mono text-center">
                      Align the product in the live frame and tap Capture.
                    </p>
                  </div>
                )}

                {cameraError && (
                  <div className="text-[10px] text-rose-600 font-serif italic bg-rose-50 border border-rose-200 p-2 text-center">
                    {cameraError}
                  </div>
                )}

                {pImgUrl && (
                  <div className="flex items-center gap-3 bg-white p-2.5 border border-editorial-text/15">
                    <img 
                      src={pImgUrl} 
                      alt="Product preview" 
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-cover border border-editorial-text/10 flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase text-editorial-accent">✓ Product Image Selected</p>
                      <p className="text-[9px] text-editorial-text/50 font-mono truncate">
                        {pImgUrl.startsWith('data:') ? 'Base64 Encoded Image' : pImgUrl}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPImgUrl('');
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-editorial-accent cursor-pointer pr-1"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Suggestions Helper */}
              {!pImgUrl && (
                <div className="text-[10px] text-editorial-accent flex justify-end gap-1.5">
                  <span className="font-semibold select-none text-editorial-text/40">Quick Images:</span>
                  <button
                    type="button"
                    onClick={() => setPImgUrl('https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80')}
                    className="underline hover:text-editorial-text"
                  >
                    Beads
                  </button>
                  <button
                    type="button"
                    onClick={() => setPImgUrl('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80')}
                    className="underline hover:text-editorial-text"
                  >
                    Shoe
                  </button>
                  <button
                    type="button"
                    onClick={() => setPImgUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80')}
                    className="underline hover:text-editorial-text"
                  >
                    Gadget
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-editorial-text/10 pt-4 flex justify-end gap-2 bg-editorial-bg">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-editorial-text/20 text-xs font-bold uppercase tracking-wider text-editorial-text/70"
                >
                  Cancel
                </button>
                <button
                  id="tour-submit-product"
                  type="submit"
                  className="px-5 py-2 bg-editorial-text text-editorial-bg font-bold text-xs uppercase tracking-wider border border-editorial-text"
                >
                  {isEditProductOpen ? 'Save Changes' : 'List Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
