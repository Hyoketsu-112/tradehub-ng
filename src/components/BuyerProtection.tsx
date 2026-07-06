/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Order, Dispute, User } from '../types';
import { 
  ShieldCheck, 
  Search, 
  HelpCircle, 
  Truck, 
  CheckCircle2, 
  Lock, 
  AlertTriangle,
  Mail,
  User as UserIcon,
  ShieldAlert,
  ArrowRight,
  FileText,
  Printer,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  Check
} from 'lucide-react';

interface BuyerProtectionProps {
  orders: Order[];
  onConfirmDelivery: (orderId: string) => Promise<Order | null>;
  onFileDispute: (dispute: Omit<Dispute, 'id' | 'createdAt'>) => Promise<Dispute>;
  currentUser?: User | null;
}

export default function BuyerProtection({ 
  orders, 
  onConfirmDelivery, 
  onFileDispute,
  currentUser
}: BuyerProtectionProps) {
  // Tracker States
  const [searchMethod, setSearchMethod] = useState<'id' | 'email'>('id');
  const [orderIdInput, setOrderIdInput] = useState('');
  const [buyerEmailInput, setBuyerEmailInput] = useState('');
  
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-load orders if buyer is logged in
  useEffect(() => {
    if (currentUser?.email) {
      setSearchMethod('email');
      setBuyerEmailInput(currentUser.email);
      const found = orders.filter(o => o.buyerEmail.toLowerCase() === currentUser.email.toLowerCase());
      setBuyerOrders(found);
      setHasSearched(true);
    }
  }, [currentUser, orders]);

  // Receipt Modal and Order History Filtering
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'held' | 'shipped' | 'delivered' | 'refunded' | 'disputed'>('all');
  const [receiptPrinted, setReceiptPrinted] = useState(false);

  // Dispute Filing states
  const [isFileDisputeOpen, setIsFileDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Item Not Received');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  // Search execution
  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setTrackedOrder(null);
    setBuyerOrders([]);

    if (searchMethod === 'id') {
      if (!orderIdInput.trim()) return;
      const found = orders.find(o => o.id.toLowerCase() === orderIdInput.trim().toLowerCase());
      if (found) {
        setTrackedOrder(found);
      }
    } else {
      if (!buyerEmailInput.trim()) return;
      const found = orders.filter(o => o.buyerEmail.toLowerCase() === buyerEmailInput.trim().toLowerCase());
      setBuyerOrders(found);
    }
  };

  const handleQuickFill = (type: 'id' | 'email', value: string) => {
    setSearchMethod(type);
    setHasSearched(true);
    setTrackedOrder(null);
    setBuyerOrders([]);
    if (type === 'id') {
      setOrderIdInput(value);
      const found = orders.find(o => o.id.toLowerCase() === value.toLowerCase());
      if (found) {
        setTrackedOrder(found);
      }
    } else {
      setBuyerEmailInput(value);
      const found = orders.filter(o => o.buyerEmail.toLowerCase() === value.toLowerCase());
      setBuyerOrders(found);
    }
  };

  // Escrow delivery confirmation
  const handleConfirmReceipt = async (orderId: string) => {
    if (confirm('Confirm order receipt? This will instantly release 90% of the funds from escrow to the seller’s bank account.')) {
      try {
        const updated = await onConfirmDelivery(orderId);
        if (updated) {
          if (trackedOrder && trackedOrder.id === orderId) {
            setTrackedOrder(updated);
          }
          setBuyerOrders(prev => prev.map(o => o.id === orderId ? updated : o));
          alert('Congratulations! Order Receipt Confirmed. ₦' + updated.sellerShare.toLocaleString() + ' has been transferred automatically to the seller’s Paystack Subaccount.');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to release escrow.');
      }
    }
  };

  // Dispute Filing execution
  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackedOrder) return;
    if (!disputeDescription.trim()) {
      alert('Please explain the details of the problem.');
      return;
    }

    setIsSubmittingDispute(true);
    try {
      await onFileDispute({
        orderId: trackedOrder.id,
        buyerEmail: trackedOrder.buyerEmail,
        reason: disputeReason,
        description: disputeDescription,
        status: 'open',
      });

      // Reload tracked order status
      const updated = orders.find(o => o.id === trackedOrder.id);
      if (updated) {
        setTrackedOrder(updated);
      }

      setIsFileDisputeOpen(false);
      setDisputeDescription('');
      alert('Your Dispute has been successfully filed and logged with Tradehub. Payout splits have been frozen in escrow. The seller has been alerted to resolve this.');
    } catch (err) {
      console.error(err);
      alert('Failed to file dispute.');
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const formatNaira = (num: number) => {
    return '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-editorial-bg min-h-screen py-12 px-4 sm:px-6 lg:px-8 text-editorial-text font-sans">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Tracker Panel (Left 2-parts) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Main Tracker Search card */}
          <div className="bg-editorial-bg border border-editorial-text/15 p-6 sm:p-8">
            <span className="inline-flex items-center gap-1.5 border border-editorial-text/30 bg-editorial-beige px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-editorial-text mb-6">
              <ShieldCheck className="h-3.5 w-3.5 text-editorial-accent animate-pulse" />
              Tradehub Secure Escrow Protection
            </span>

            <h1 className="text-3xl sm:text-4xl font-serif italic tracking-tight text-editorial-text font-medium">Order Protection Hub<span className="text-editorial-accent">.</span></h1>
            <p className="text-editorial-text/70 text-xs mt-2 leading-relaxed">
              Enter your unique Order Reference Number (e.g. `TH-92184-NG`) or registered buyer email address to check shipment status, confirm delivery, or open disputes.
            </p>

            {/* Toggle Search Method */}
            <div className="flex border-b border-editorial-text/10 mt-8 mb-6">
              <button
                onClick={() => setSearchMethod('id')}
                className={`pb-3 text-xs font-bold uppercase tracking-widest border-b-2 px-4 transition-colors ${
                  searchMethod === 'id' ? 'border-editorial-text text-editorial-text' : 'border-transparent text-editorial-text/40 hover:text-editorial-text'
                }`}
              >
                Order Reference
              </button>
              <button
                onClick={() => setSearchMethod('email')}
                className={`pb-3 text-xs font-bold uppercase tracking-widest border-b-2 px-4 transition-colors ${
                  searchMethod === 'email' ? 'border-editorial-text text-editorial-text' : 'border-transparent text-editorial-text/40 hover:text-editorial-text'
                }`}
              >
                Buyer Email
              </button>
            </div>

            {/* Search Input Forms */}
            <form onSubmit={handleTrackSearch} className="flex flex-col sm:flex-row gap-3">
              {searchMethod === 'id' ? (
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-editorial-text/40" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. TH-92184-NG"
                    value={orderIdInput}
                    onChange={(e) => setOrderIdInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-editorial-bg border border-editorial-text/20 text-xs focus:outline-none focus:border-editorial-text font-mono"
                  />
                </div>
              ) : (
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-editorial-text/40" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. chioma@example.com"
                    value={buyerEmailInput}
                    onChange={(e) => setBuyerEmailInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-editorial-bg border border-editorial-text/20 text-xs focus:outline-none focus:border-editorial-text font-mono"
                  />
                </div>
              )}

              <button
                type="submit"
                className="bg-editorial-text text-editorial-bg px-6 py-3 text-xs font-bold uppercase tracking-widest border border-editorial-text hover:bg-editorial-accent hover:text-white transition-all cursor-pointer"
              >
                Search Ledger
              </button>
            </form>

            {/* Quick Demo Fills */}
            <div className="mt-5 pt-4 border-t border-editorial-text/5 flex flex-wrap items-center gap-2 text-[11px] text-editorial-text/50">
              <span className="font-bold uppercase tracking-widest text-[9px]">Demo shortcuts:</span>
              <button 
                onClick={() => handleQuickFill('email', 'chioma.nze@example.com')}
                className="bg-editorial-beige border border-editorial-text/10 hover:border-editorial-text px-2.5 py-1 text-editorial-text font-serif italic transition-colors cursor-pointer"
              >
                📧 Chioma's History (Multiple Orders)
              </button>
              <button 
                onClick={() => handleQuickFill('email', 'jide.sanwo@example.com')}
                className="bg-editorial-beige border border-editorial-text/10 hover:border-editorial-text px-2.5 py-1 text-editorial-text font-serif italic transition-colors cursor-pointer"
              >
                📧 Babajide's History
              </button>
              <button 
                onClick={() => handleQuickFill('id', 'TH-92184-NG')}
                className="bg-editorial-beige border border-editorial-text/10 hover:border-editorial-text px-2.5 py-1 text-editorial-text font-mono transition-colors cursor-pointer"
              >
                🎫 TH-92184-NG
              </button>
            </div>
          </div>

          {/* Search Result display */}
          {hasSearched && (
            <div id="tracker-results-container">
              {/* Single order tracker (By ID) */}
              {searchMethod === 'id' && trackedOrder && (
                <div className="bg-editorial-bg border border-editorial-text/15 p-6 sm:p-8 space-y-8">
                  {/* Title Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-editorial-text/10 pb-4">
                    <div>
                      <span className="text-[10px] text-editorial-text/50 font-bold uppercase tracking-widest">Tracking Reference</span>
                      <h3 className="text-2xl font-serif italic text-editorial-text select-all mt-1">{trackedOrder.id}</h3>
                    </div>
                    
                    <div className="text-[11px] font-bold text-editorial-text uppercase tracking-widest border border-editorial-text/15 bg-editorial-beige/40 px-3 py-1.5">
                      Merchant: <span className="text-editorial-text font-black">{trackedOrder.storeName}</span>
                    </div>
                  </div>

                  {/* Stepper Timeline Tracker */}
                  <div className="relative py-4">
                    <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-editorial-text/10 hidden sm:block"></div>
                    
                    <div className="space-y-8 relative">
                      {/* Step 1: Paid */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="h-12 w-12 border border-editorial-text bg-editorial-beige text-editorial-text flex items-center justify-center flex-shrink-0 z-10">
                          <Lock className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-editorial-text flex items-center gap-2">
                            <span>Step 1: Payment Secured (Escrow Held)</span>
                            <span className="inline-flex items-center border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 uppercase tracking-wider">Complete</span>
                          </p>
                          <p className="text-xs text-editorial-text/60 mt-1 leading-relaxed">Paystack split authorized successfully. {formatNaira(trackedOrder.sellerShare)} (90%) is locked safely in Tradehub's secure buyer protection vault.</p>
                        </div>
                      </div>

                      {/* Step 2: Shipped */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className={`h-12 w-12 border flex items-center justify-center flex-shrink-0 z-10 ${
                          trackedOrder.status === 'shipped' || trackedOrder.status === 'delivered'
                            ? 'bg-editorial-beige text-editorial-text border-editorial-text'
                            : 'bg-editorial-bg text-editorial-text/20 border-editorial-text/10'
                        }`}>
                          <Truck className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-editorial-text flex items-center gap-2">
                            <span>Step 2: Dispatched by Merchant</span>
                            {trackedOrder.status === 'shipped' || trackedOrder.status === 'delivered' ? (
                              <span className="inline-flex items-center border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 uppercase tracking-wider">Complete</span>
                            ) : (
                              <span className="inline-flex items-center border border-editorial-text/30 bg-editorial-beige px-1.5 py-0.5 text-[9px] font-bold text-editorial-text/60 uppercase tracking-wider">Pending</span>
                            )}
                          </p>
                          <p className="text-xs text-editorial-text/60 mt-1 leading-relaxed">
                            {trackedOrder.status === 'shipped' || trackedOrder.status === 'delivered'
                              ? 'Seller has shipped your parcel. It is currently in dispatch transit.'
                              : 'Waiting for merchant to pack, ship, and input package tracking.'}
                          </p>
                        </div>
                      </div>

                      {/* Step 3: Delivered */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className={`h-12 w-12 border flex items-center justify-center flex-shrink-0 z-10 ${
                          trackedOrder.status === 'delivered'
                            ? 'bg-editorial-beige text-editorial-text border-editorial-text'
                            : 'bg-editorial-bg text-editorial-text/20 border-editorial-text/10'
                        }`}>
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-editorial-text flex items-center gap-2">
                            <span>Step 3: Delivered & Payout Released</span>
                            {trackedOrder.status === 'delivered' ? (
                              <span className="inline-flex items-center border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 uppercase tracking-wider">Complete</span>
                            ) : (
                              <span className="inline-flex items-center border border-editorial-text/10 bg-editorial-beige/30 px-1.5 py-0.5 text-[9px] font-bold text-editorial-text/40 uppercase tracking-wider">Pending Receipt</span>
                            )}
                          </p>
                          <p className="text-xs text-editorial-text/60 mt-1 leading-relaxed">
                            {trackedOrder.status === 'delivered'
                              ? `Buyer confirmed receipt. Escrow split complete: 90% payout released to merchant subaccount.`
                              : 'Awaiting buyer confirmation of delivery or automatic 7-day release rule expiration.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-editorial-beige/30 border border-editorial-text/10 p-5 text-xs space-y-3 leading-relaxed">
                    <p className="font-bold text-editorial-text uppercase tracking-wider text-[10px] border-b border-editorial-text/10 pb-2">Purchase Summary</p>
                    <div className="flex justify-between font-mono">
                      <span className="text-editorial-text/60">Buyer:</span>
                      <span className="font-bold text-editorial-text">{trackedOrder.buyerName}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-editorial-text/60">Delivery Address:</span>
                      <span className="font-bold text-editorial-text font-serif italic">{trackedOrder.deliveryAddress}</span>
                    </div>
                    <div className="flex justify-between font-mono text-editorial-accent font-bold">
                      <span>Total Price Paid:</span>
                      <span>{formatNaira(trackedOrder.totalAmount)}</span>
                    </div>
                    <div className="pt-2 border-t border-dashed border-editorial-text/10 text-[10px] text-editorial-text/50 flex justify-between font-mono">
                      <span>Paystack Split (90%): {formatNaira(trackedOrder.sellerShare)}</span>
                      <span>Tradehub split (10%): {formatNaira(trackedOrder.platformFee)}</span>
                    </div>
                  </div>

                  {/* Escrow Release & Disputes Controllers */}
                  {trackedOrder.escrowStatus === 'held' && (
                    <div className="pt-4 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleConfirmReceipt(trackedOrder.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-editorial-text text-editorial-bg py-4 text-xs font-bold uppercase tracking-widest border border-editorial-text hover:bg-editorial-accent hover:text-white transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Confirm Delivery (Release Funds)</span>
                      </button>

                      <button
                        onClick={() => setIsFileDisputeOpen(true)}
                        className="sm:w-auto px-6 py-4 border border-editorial-accent text-editorial-accent text-xs font-bold uppercase tracking-widest hover:bg-editorial-accent hover:text-white transition-all cursor-pointer"
                      >
                        File Escrow Dispute
                      </button>
                    </div>
                  )}

                  {trackedOrder.status === 'disputed' && (
                    <div className="border border-editorial-accent/30 p-4 text-xs bg-editorial-accent/5 space-y-2 flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-editorial-accent flex-shrink-0" />
                      <div>
                        <p className="font-bold uppercase tracking-wider text-[10px] text-editorial-accent">🚨 Dispute Active - Escrow Locked</p>
                        <p className="leading-relaxed mt-1 text-editorial-text/80 font-serif italic">
                          You filed a dispute for this order. Payout splits are frozen. The merchant cannot retrieve the 90% share. Tradehub dispute managers will resolve this or issue a refund shortly.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Multiple buyer orders (By Email) - Chronological Order History Hub */}
              {searchMethod === 'email' && buyerOrders.length > 0 && (() => {
                const sortedHistory = [...buyerOrders].sort(
                  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                
                const filteredHistory = sortedHistory.filter(o => {
                  if (historyFilter === 'all') return true;
                  if (historyFilter === 'held') return o.escrowStatus === 'held';
                  if (historyFilter === 'shipped') return o.status === 'shipped';
                  if (historyFilter === 'delivered') return o.status === 'delivered';
                  if (historyFilter === 'disputed') return o.status === 'disputed';
                  if (historyFilter === 'refunded') return o.status === 'refunded';
                  return true;
                });

                return (
                  <div className="space-y-6">
                    {/* Header bar */}
                    <div className="bg-editorial-beige/30 border border-editorial-text/15 p-5 sm:p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-text/10 pb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-editorial-accent" />
                          <div>
                            <h3 className="text-base font-serif italic text-editorial-text">Chronological Purchase Ledger</h3>
                            <p className="text-[10px] text-editorial-text/50 uppercase tracking-wider mt-0.5">{buyerEmailInput}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-editorial-text bg-editorial-text/5 border border-editorial-text/10 px-2.5 py-1 uppercase tracking-widest font-mono">
                          {sortedHistory.length} Total Orders
                        </span>
                      </div>

                      {/* Filter pill selectors */}
                      <div className="space-y-2">
                        <p className="text-[9px] font-bold text-editorial-text/40 uppercase tracking-widest">Filter by transaction status:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { key: 'all', label: 'All Purchases' },
                            { key: 'held', label: '🔒 Held in Escrow' },
                            { key: 'shipped', label: '🚚 Shipped' },
                            { key: 'delivered', label: '✅ Delivered' },
                            { key: 'disputed', label: '🚨 Disputed' },
                            { key: 'refunded', label: '💸 Refunded' }
                          ].map(pill => (
                            <button
                              key={pill.key}
                              onClick={() => setHistoryFilter(pill.key as any)}
                              className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                historyFilter === pill.key
                                  ? 'bg-editorial-text text-editorial-bg border-editorial-text'
                                  : 'bg-editorial-bg border-editorial-text/15 text-editorial-text/60 hover:text-editorial-text hover:border-editorial-text/30'
                              }`}
                            >
                              {pill.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Empty view for selected filter */}
                    {filteredHistory.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-editorial-text/20 bg-editorial-beige/5">
                        <Clock className="h-6 w-6 text-editorial-text/20 mx-auto mb-2" />
                        <p className="text-xs text-editorial-text/60 font-serif italic">No orders match the selected filter status.</p>
                      </div>
                    ) : (
                      /* Chronological List */
                      <div className="space-y-4">
                        {filteredHistory.map((o) => (
                          <div key={o.id} className="bg-editorial-bg border border-editorial-text/15 p-5 sm:p-6 space-y-4">
                            {/* Card Header */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-editorial-text/10 pb-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-editorial-text text-sm select-all">{o.id}</span>
                                  <span className="text-[10px] text-editorial-text/40 font-mono">|</span>
                                  <span className="text-[10px] text-editorial-text/60 font-serif italic">{formatDate(o.createdAt)}</span>
                                </div>
                                <p className="text-[11px] font-bold text-editorial-text/70 uppercase tracking-widest">
                                  Storefront: <span className="text-editorial-accent">{o.storeName}</span>
                                </p>
                              </div>

                              {/* Status Badge */}
                              <div>
                                <span className={`inline-block px-3 py-1 border text-[10px] font-black uppercase tracking-wider ${
                                  o.status === 'paid' ? 'bg-editorial-beige text-editorial-text border-editorial-text' :
                                  o.status === 'shipped' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                                  o.status === 'delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                                  o.status === 'refunded' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                                  'bg-editorial-accent text-white border-editorial-accent'
                                }`}>
                                  {o.status === 'paid' ? '🔒 Held in Escrow' : o.status}
                                </span>
                              </div>
                            </div>

                            {/* Card Items */}
                            <div className="space-y-2">
                              <p className="text-[9px] font-bold text-editorial-text/40 uppercase tracking-widest">Purchased Items</p>
                              <div className="divide-y divide-editorial-text/5 bg-editorial-beige/10 border border-editorial-text/10 px-3 py-2 text-xs">
                                {o.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between py-1.5 font-mono">
                                    <span className="text-editorial-text/80">{item.productName} (x{item.quantity})</span>
                                    <span className="font-bold text-editorial-text">{formatNaira(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between pt-2 border-t border-dashed border-editorial-text/10 font-bold">
                                  <span className="font-serif italic text-editorial-text/70">Transaction Total</span>
                                  <span className="text-sm text-editorial-accent font-mono">{formatNaira(o.totalAmount)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Delivery Address */}
                            <div className="text-[11px] text-editorial-text/70 font-serif italic bg-editorial-beige/10 border border-editorial-text/10 px-3 py-2 flex items-start gap-1.5">
                              <Truck className="h-3.5 w-3.5 text-editorial-text/40 mt-0.5 flex-shrink-0" />
                              <span>Shipped to: <strong className="text-editorial-text not-italic">{o.buyerName}</strong> - {o.deliveryAddress}</span>
                            </div>

                            {/* Card Footer actions */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-editorial-text/5">
                              {/* Open Official Receipt */}
                              <button
                                onClick={() => {
                                  setSelectedReceiptOrder(o);
                                  setReceiptPrinted(false);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-editorial-beige hover:bg-editorial-text hover:text-editorial-bg border border-editorial-text/15 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                <span>Official Receipt</span>
                              </button>

                              {/* Escrow confirms */}
                              {o.escrowStatus === 'held' ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      // Put order in state for dispute file reference
                                      setTrackedOrder(o);
                                      setIsFileDisputeOpen(true);
                                    }}
                                    className="px-3 py-1.5 border border-editorial-accent text-editorial-accent hover:bg-editorial-accent hover:text-white text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                                  >
                                    File Dispute
                                  </button>
                                  <button
                                    onClick={() => handleConfirmReceipt(o.id)}
                                    className="px-3.5 py-1.5 bg-editorial-text text-editorial-bg hover:bg-editorial-accent hover:text-white text-[11px] font-bold uppercase tracking-widest border border-editorial-text transition-all cursor-pointer"
                                  >
                                    Confirm Receipt
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-editorial-text/40 font-mono italic">
                                  Escrow split: {o.escrowStatus === 'released' ? 'Released to seller subaccount' : o.escrowStatus === 'returned' ? 'Refunded to buyer card' : 'Locked in dispute hold'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* No results */}
              {((searchMethod === 'id' && !trackedOrder) || (searchMethod === 'email' && buyerOrders.length === 0)) && (
                <div className="text-center py-12 border border-dashed border-editorial-text/20 bg-editorial-beige/10">
                  <ShieldAlert className="h-8 w-8 text-editorial-text/30 mx-auto mb-3" />
                  <h3 className="font-serif italic text-lg text-editorial-text">No transaction records found</h3>
                  <p className="text-editorial-text/50 text-xs mt-1">Please double-check the characters or search with a different criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tradehub FAQ (Right Column) */}
        <div className="space-y-8">
          <div className="bg-editorial-bg border border-editorial-text/15 p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-serif italic text-editorial-text flex items-center gap-2 border-b border-editorial-text/10 pb-4">
              <HelpCircle className="h-5 w-5 text-editorial-text/60" />
              <span>Escrow Protection FAQ</span>
            </h2>

            <div className="space-y-5 text-xs leading-relaxed text-editorial-text/75 font-serif italic">
              <div className="space-y-1">
                <h4 className="font-bold text-editorial-text not-italic uppercase tracking-widest text-[9px] text-editorial-text/50">
                  Q: What is automatic escrow?
                </h4>
                <p>
                  When you buy from any storefront, Paystack handles the payment. However, the merchant’s 90% payout is locked in escrow immediately. It is only cleared and released to their bank once you confirm delivery.
                </p>
              </div>

              <div className="space-y-1 border-t border-editorial-text/10 pt-4">
                <h4 className="font-bold text-editorial-text not-italic uppercase tracking-widest text-[9px] text-editorial-text/50">
                  Q: When do escrow payouts expire?
                </h4>
                <p>
                  To protect sellers from malicious buyers who receive items but forget to click "Confirm Receipt", funds are automatically released 7 days after shipment if no active dispute is filed.
                </p>
              </div>

              <div className="space-y-1 border-t border-editorial-text/10 pt-4">
                <h4 className="font-bold text-editorial-text not-italic uppercase tracking-widest text-[9px] text-editorial-text/50">
                  Q: How do disputes work?
                </h4>
                <p>
                  If your package is damaged, incorrect, or never shipped, click "File Escrow Dispute" on this hub. This completely freezes the escrow fund indefinitely. The merchant cannot claim the payout, and Tradehub admins step in to audit shipping tracking or issue a refund.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Dispute Modal */}
      {isFileDisputeOpen && trackedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-editorial-text/60 overflow-y-auto">
          <div className="bg-editorial-bg max-w-md w-full border border-editorial-text shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-editorial-text/10 flex justify-between items-center bg-editorial-beige/50">
              <div>
                <h3 className="text-lg font-serif italic text-editorial-text">File Escrow Dispute</h3>
                <p className="text-xs text-editorial-text/50 mt-1">Suspend merchant's payout share in secure protection hold.</p>
              </div>
              <button
                onClick={() => setIsFileDisputeOpen(false)}
                className="text-editorial-text/50 hover:text-editorial-text font-bold"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleDisputeSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-editorial-text/50 mb-1 uppercase tracking-widest">Reason for Dispute</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3 py-2.5 bg-editorial-bg border border-editorial-text/20 text-xs focus:outline-none focus:border-editorial-text"
                >
                  <option value="Item Not Received">Item Not Received / Delayed</option>
                  <option value="Wrong Item Delivered">Wrong Item / Incorrect Spec</option>
                  <option value="Damaged or Defective Product">Damaged or Defective Product</option>
                  <option value="Counterfeit or Fraudulent listing">Counterfeit or Fraudulent listing</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-editorial-text/50 mb-1 uppercase tracking-widest">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain exactly what happened. Provide delivery delays, damages, or mismatch descriptions..."
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  className="w-full px-3 py-2.5 bg-editorial-bg border border-editorial-text/20 text-xs focus:outline-none focus:border-editorial-text font-serif italic"
                />
              </div>

              <div className="border border-editorial-accent/30 text-editorial-accent p-3 text-[10px] leading-normal flex gap-1.5 items-center bg-editorial-accent/5 font-serif italic">
                <ShieldAlert className="h-4 w-4 text-editorial-accent flex-shrink-0" />
                <span>Caution: Filing a dispute suspends payout splits immediately. Abuse is punishable.</span>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-editorial-text/10 pt-4 flex justify-end gap-2 bg-editorial-bg">
                <button
                  type="button"
                  onClick={() => setIsFileDisputeOpen(false)}
                  className="px-4 py-2 border border-editorial-text/20 text-xs font-bold uppercase tracking-wider text-editorial-text/70 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDispute}
                  className="px-5 py-2.5 bg-editorial-accent text-white font-bold text-xs uppercase tracking-widest disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingDispute ? 'Logging Dispute...' : 'File Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Transaction Receipt Modal */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-editorial-text/75 overflow-y-auto backdrop-blur-sm">
          <div className="bg-[#FAF9F6] text-black max-w-lg w-full border border-black shadow-2xl relative font-sans">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedReceiptOrder(null)}
              className="absolute top-4 right-4 text-black hover:text-red-600 font-bold text-sm bg-black/5 hover:bg-black/10 h-7 w-7 rounded-full flex items-center justify-center transition-all cursor-pointer z-10"
              title="Close Receipt"
            >
              ✕
            </button>

            {/* Receipt Body */}
            <div className="p-8 space-y-6 select-all">
              {/* Receipt Visual Header */}
              <div className="text-center space-y-2 border-b border-dashed border-black/20 pb-5">
                <div className="inline-flex items-center gap-1 bg-black text-[#FAF9F6] px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em]">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  Tradehub Escrow Secured
                </div>
                <h2 className="text-2xl font-serif italic tracking-tight font-black mt-2">TRADEHUB</h2>
                <p className="text-[10px] text-black/50 font-mono tracking-widest uppercase">Verified Payout Split Receipt</p>
                <p className="text-[11px] font-mono text-black/70 mt-1">Ref: {selectedReceiptOrder.id}</p>
              </div>

              {/* Transaction Metadata Grid */}
              <div className="grid grid-cols-2 gap-y-3 text-[11px] font-mono border-b border-black/10 pb-4">
                <div>
                  <span className="block text-black/40 text-[9px] uppercase tracking-wider">Date Created</span>
                  <span className="font-bold">{formatDate(selectedReceiptOrder.createdAt)}</span>
                </div>
                <div>
                  <span className="block text-black/40 text-[9px] uppercase tracking-wider">Payment Reference</span>
                  <span className="font-bold select-all text-[10px]">{selectedReceiptOrder.paystackReference || 'PSTK-MOCK-LIVE'}</span>
                </div>
                <div>
                  <span className="block text-black/40 text-[9px] uppercase tracking-wider">Store / Merchant</span>
                  <span className="font-bold font-serif italic text-xs">{selectedReceiptOrder.storeName}</span>
                </div>
                <div>
                  <span className="block text-black/40 text-[9px] uppercase tracking-wider">Merchant Subaccount</span>
                  <span className="font-bold text-[10px]">{selectedReceiptOrder.paystackSubaccount || 'N/A'}</span>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-black/[0.03] border border-black/10 p-3.5 text-[11px] font-mono space-y-1">
                <p className="font-bold uppercase tracking-wider text-[9px] text-black/40 border-b border-black/5 pb-1 mb-1">Customer / Shipping Address</p>
                <div><span className="text-black/50">Name:</span> <strong>{selectedReceiptOrder.buyerName}</strong></div>
                <div><span className="text-black/50">Email:</span> <strong>{selectedReceiptOrder.buyerEmail}</strong></div>
                <div><span className="text-black/50">Phone:</span> <strong>{selectedReceiptOrder.buyerPhone}</strong></div>
                <div><span className="text-black/50">Address:</span> <strong className="font-serif italic font-normal text-black/90">{selectedReceiptOrder.deliveryAddress}</strong></div>
              </div>

              {/* Product Line Items */}
              <div className="space-y-2">
                <p className="font-bold uppercase tracking-widest text-[9px] text-black/40">Itemized Purchases</p>
                <div className="border border-black/15 bg-white divide-y divide-black/5 text-xs font-mono">
                  <div className="flex justify-between bg-black/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black/60">
                    <span>Item Description</span>
                    <span>Total</span>
                  </div>
                  {selectedReceiptOrder.items.map((it, i) => (
                    <div key={i} className="flex justify-between px-3 py-2">
                      <div>
                        <p className="font-bold">{it.productName}</p>
                        <p className="text-[10px] text-black/50">{formatNaira(it.price)} × {it.quantity}</p>
                      </div>
                      <span className="font-bold">{formatNaira(it.price * it.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between px-3 py-2.5 bg-black/[0.02] font-bold text-sm border-t border-black/15">
                    <span className="font-serif italic">Total Charged Paid</span>
                    <span className="text-emerald-700">{formatNaira(selectedReceiptOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Paystack Automated Escrow Split Visualizer */}
              <div className="border border-dashed border-black/20 p-4 text-[10px] font-mono space-y-2.5 bg-yellow-50/40">
                <p className="font-black uppercase tracking-wider text-[9px] text-yellow-800 flex items-center gap-1 border-b border-black/5 pb-1.5">
                  <span>⚙️ Automated Paystack Split Ledger</span>
                </p>
                <div className="flex justify-between text-black/70">
                  <span>Merchant Settlement Share (90%):</span>
                  <span className="font-bold text-black">{formatNaira(selectedReceiptOrder.sellerShare)}</span>
                </div>
                <div className="flex justify-between text-black/70">
                  <span>Tradehub Escrow Commission (10%):</span>
                  <span className="font-bold text-black">{formatNaira(selectedReceiptOrder.platformFee)}</span>
                </div>
                <p className="text-[9px] text-black/40 pt-1 leading-normal italic">
                  Escrow settlement is automatically routed via Paystack subaccounts. Merchant share is released instantly upon delivery confirmation.
                </p>
              </div>

              {/* Receipt Stamp */}
              <div className="flex justify-center pt-2">
                <div className={`border-2 px-6 py-2 uppercase font-black tracking-widest text-xs rounded rotate-[-2deg] select-none ${
                  selectedReceiptOrder.status === 'delivered' ? 'border-emerald-700 text-emerald-700 bg-emerald-50' :
                  selectedReceiptOrder.status === 'refunded' ? 'border-rose-700 text-rose-700 bg-rose-50' :
                  selectedReceiptOrder.status === 'disputed' ? 'border-amber-700 text-amber-700 bg-amber-50' :
                  'border-blue-700 text-blue-700 bg-blue-50'
                }`}>
                  {selectedReceiptOrder.status === 'delivered' ? '✓ ESCROW RELEASED' :
                   selectedReceiptOrder.status === 'refunded' ? '✗ FUNDS REFUNDED' :
                   selectedReceiptOrder.status === 'disputed' ? '⚠️ ESCROW FROZEN' :
                   '🔒 HELD IN ESCROW'}
                </div>
              </div>
            </div>

            {/* Receipt Modal Footer Actions */}
            <div className="p-6 bg-black/[0.04] border-t border-black/10 flex justify-between items-center">
              <span className="text-[10px] text-black/50 font-mono">Powered by Paystack API</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setReceiptPrinted(true);
                    window.print();
                  }}
                  className="bg-black text-[#FAF9F6] hover:bg-black/80 px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  onClick={() => setSelectedReceiptOrder(null)}
                  className="border border-black/30 hover:bg-black/5 text-black px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Close Receipt
                </button>
              </div>
            </div>

            {/* Print Confirmation Indicator */}
            {receiptPrinted && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded shadow-lg animate-fade-in flex items-center gap-1 z-20 font-mono">
                <Check className="h-3.5 w-3.5" />
                <span>Receipt sent to system printer / local file</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
