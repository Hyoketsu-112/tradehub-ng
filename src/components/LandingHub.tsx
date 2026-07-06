/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Store, User } from '../types';
import { 
  Plus, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  Percent, 
  Zap, 
  Briefcase,
  HelpCircle,
  Building,
  DollarSign,
  UserCheck
} from 'lucide-react';

interface LandingHubProps {
  stores: Store[];
  onSelectStore: (slug: string) => void;
  onCreateStore: (store: Omit<Store, 'id' | 'createdAt'>) => Promise<Store>;
  currentUser?: User | null;
  onOpenAuth?: () => void;
}

export default function LandingHub({ 
  stores, 
  onSelectStore, 
  onCreateStore,
  currentUser,
  onOpenAuth
}: LandingHubProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Store creation form states
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Fashion');
  const [sellerEmail, setSellerEmail] = useState('');
  const [bankName, setBankName] = useState('Zenith Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [isSubaccountGenerating, setIsSubaccountGenerating] = useState(false);
  const [subaccountResult, setSubaccountResult] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync logged in email
  useEffect(() => {
    if (currentUser?.email) {
      setSellerEmail(currentUser.email);
    } else {
      setSellerEmail('');
    }
  }, [currentUser]);

  const handleOpenRegister = () => {
    if (!currentUser) {
      alert('Please sign in or create a Seller Account before launching your storefront. This secures your store and dashboard access!');
      if (onOpenAuth) onOpenAuth();
    } else if (currentUser.role !== 'seller') {
      alert('Your account is currently set as a Buyer. To launch a storefront, please Sign Out and register as a Seller.');
    } else {
      setIsRegisterOpen(true);
    }
  };

  // Handle live slug generation
  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStoreName(val);
    setStoreSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  // Simulate Paystack subaccount generation
  const handleGenerateSubaccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber || accountNumber.length !== 10) {
      alert('Please enter a valid 10-digit Nigerian NUBAN account number.');
      return;
    }
    setIsSubaccountGenerating(true);
    setTimeout(() => {
      const code = `ACCT_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      setSubaccountResult(code);
      setIsSubaccountGenerating(false);
    }, 1500);
  };

  // Handle submitting the whole store
  const handleSubmitStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !storeSlug || !description || !sellerEmail || !accountNumber) {
      alert('Please fill out all required fields.');
      return;
    }
    if (!subaccountResult) {
      alert('Please generate your Paystack Subaccount first to enable automated splits.');
      return;
    }

    setIsSubmitting(true);

    const bannerColors = [
      'from-pink-500 via-rose-500 to-amber-500',
      'from-emerald-500 via-teal-600 to-cyan-700',
      'from-indigo-600 via-purple-600 to-blue-700',
      'from-orange-500 via-amber-500 to-yellow-600',
      'from-violet-600 to-fuchsia-800'
    ];
    const randomColor = bannerColors[Math.floor(Math.random() * bannerColors.length)];

    try {
      await onCreateStore({
        name: storeName,
        slug: storeSlug,
        description,
        category,
        bannerColor: randomColor,
        bankName,
        accountNumber,
        paystackSubaccount: subaccountResult,
        sellerEmail,
      });

      // Clear states
      setStoreName('');
      setStoreSlug('');
      setDescription('');
      setCategory('Fashion');
      setSellerEmail('');
      setAccountNumber('');
      setSubaccountResult(null);
      setIsRegisterOpen(false);
      alert('Congratulations! Your storefront has been successfully hosted on Tradehub-Ng. Share your link to start selling!');
    } catch (err) {
      console.error(err);
      alert('Failed to register store. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['All', 'Fashion', 'Agriculture', 'Electronics', 'Home & Living', 'Services'];

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          store.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          store.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || store.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const NIGERIAN_BANKS = [
    'Zenith Bank',
    'Access Bank',
    'Guaranty Trust Bank (GTBank)',
    'United Bank for Africa (UBA)',
    'First Bank of Nigeria',
    'Sterling Bank',
    'Union Bank',
    'Fidelity Bank',
    'Wema Bank',
    'Stanbic IBTC Bank'
  ];

  return (
    <div className="bg-editorial-bg min-h-screen text-editorial-text">
      {/* Editorial Hero Banner Section */}
      <section className="relative overflow-hidden border-b border-editorial-text bg-editorial-bg py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-1.5 border border-editorial-text/30 bg-editorial-beige px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-editorial-text mb-8">
            <Zap className="h-3.5 w-3.5 text-editorial-accent" />
            Empowering Nigerian Commerce
          </span>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif italic leading-tight sm:leading-[0.85] tracking-tight mb-8">
            Host Your Storefront<span className="text-editorial-accent">.</span> <br />
            <span className="text-editorial-text not-italic font-bold font-sans tracking-tighter text-4xl sm:text-5xl lg:text-6xl block mt-4 uppercase">
              Automated Paystack Splits
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-sm sm:text-base italic font-serif text-editorial-text/70 mb-12 leading-relaxed">
            Create a lightweight storefront in 60 seconds. Share a direct shopping link with buyers. We handle payment processing, automatic 90/10 splits via Paystack subaccounts, and guarantee full buyer protection escrow.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              id="hero-create-store-btn"
              onClick={handleOpenRegister}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-editorial-text text-editorial-bg px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-editorial-accent hover:text-white transition-all border border-editorial-text"
            >
              <Plus className="h-4 w-4" />
              <span>Launch Your Storefront</span>
            </button>
            <a
              href="#explore-section"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-editorial-beige text-editorial-text px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-editorial-text hover:text-editorial-bg transition-all border border-editorial-text"
            >
              <span>Explore Active Stores</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Feature Highlights Grid (Editorial style) */}
        <div className="mx-auto max-w-5xl mt-20 grid grid-cols-1 md:grid-cols-3 border-t border-editorial-text">
          <div className="p-8 border-b md:border-b-0 md:border-r border-editorial-text/10 bg-editorial-beige/30 flex gap-4">
            <div className="w-8 h-8 flex-shrink-0 border border-editorial-text flex items-center justify-center font-mono font-bold text-xs bg-editorial-bg">01</div>
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest mb-2">90/10 Instant Splits</h3>
              <p className="text-xs text-editorial-text/70 leading-relaxed">
                When a buyer pays, Paystack processes and immediately forwards 90% of the sale price to your bank, and 10% to Tradehub. Completely automated, zero payout delay.
              </p>
            </div>
          </div>
          <div className="p-8 border-b md:border-b-0 md:border-r border-editorial-text/10 bg-editorial-beige/30 flex gap-4">
            <div className="w-8 h-8 flex-shrink-0 border border-editorial-text flex items-center justify-center font-mono font-bold text-xs bg-editorial-bg">02</div>
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest mb-2">Buyer Escrow Protection</h3>
              <p className="text-xs text-editorial-text/70 leading-relaxed">
                Payments are held securely in escrow until the customer confirms delivery, or 7 days elapse. Eliminates risk and builds bulletproof buyer trust for your brand.
              </p>
            </div>
          </div>
          <div className="p-8 bg-editorial-beige/30 flex gap-4">
            <div className="w-8 h-8 flex-shrink-0 border border-editorial-text flex items-center justify-center font-mono font-bold text-xs bg-editorial-bg">03</div>
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest mb-2">Direct Bio Links</h3>
              <p className="text-xs text-editorial-text/70 leading-relaxed">
                Each storefront receives a permanent clean URL path. Drop it into your WhatsApp, Instagram, or TikTok bio so buyers can complete purchases in one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Explore Section */}
      <section id="explore-section" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-editorial-text/10 pb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-editorial-text/50 mb-2 font-bold">The Marketplace</p>
            <h2 className="text-3xl sm:text-4xl font-serif italic tracking-tight">Active Storefronts<span className="text-editorial-accent">.</span></h2>
            <p className="text-editorial-text/60 text-xs mt-1">Browse trusted Nigerian sellers offering direct delivery protected by escrow.</p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 items-stretch">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-editorial-text/40" />
              <input
                type="text"
                placeholder="Search stores, categories, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-editorial-bg border border-editorial-text/20 text-xs focus:outline-none focus:border-editorial-text transition-all font-mono"
              />
            </div>

            {/* Launch CTA */}
            <button
              onClick={handleOpenRegister}
              className="inline-flex items-center justify-center gap-1.5 bg-editorial-text text-editorial-bg px-5 py-3 text-xs font-bold uppercase tracking-wider hover:bg-editorial-accent hover:text-white transition-all border border-editorial-text"
            >
              <Plus className="h-4 w-4" />
              <span>Host Store</span>
            </button>
          </div>
        </div>

        {/* Categories Filter (Editorial style pills) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-6 scrollbar-hide border-b border-editorial-text/10 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all border ${
                selectedCategory === cat
                  ? 'bg-editorial-text text-editorial-bg border-editorial-text'
                  : 'bg-editorial-bg text-editorial-text/60 border-editorial-text/10 hover:border-editorial-text/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stores Grid (Editorial Bento Grid style) */}
        {filteredStores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStores.map((store) => (
              <div 
                key={store.id} 
                className="bg-editorial-bg border border-editorial-text/15 hover:border-editorial-text transition-all duration-300 flex flex-col justify-between"
              >
                {/* Visual Header / Editorial Tag */}
                <div className="p-6 border-b border-editorial-text/10 bg-editorial-beige/40 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-editorial-text/60 border border-editorial-text/20 px-2 py-0.5 bg-editorial-bg">
                    {store.category}
                  </span>
                  
                  <span className="flex h-2 w-2 items-center">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-editorial-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-editorial-accent"></span>
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="mb-6">
                    <h3 className="text-2xl font-serif italic tracking-tight text-editorial-text mb-2 group-hover:text-editorial-accent transition-colors">
                      {store.name}
                    </h3>
                    <p className="text-editorial-text/70 text-xs leading-relaxed line-clamp-3">
                      {store.description}
                    </p>
                  </div>

                  <div className="border-t border-editorial-text/10 pt-4 flex items-center justify-between">
                    <div className="text-[10px] text-editorial-text/50 font-mono">
                      Subaccount: <span className="text-editorial-text font-bold">{store.paystackSubaccount}</span>
                    </div>

                    <button
                      onClick={() => onSelectStore(store.slug)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-editorial-accent hover:text-editorial-text transition-colors"
                    >
                      <span>Visit Store</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-editorial-beige/30 border border-dashed border-editorial-text/20 max-w-lg mx-auto">
            <Briefcase className="h-10 w-10 text-editorial-text/40 mx-auto mb-4" />
            <h3 className="font-serif italic text-xl">No storefronts found</h3>
            <p className="text-editorial-text/60 text-xs mt-2 max-w-sm mx-auto">Try tweaking your search or category filters, or launch your own curated store!</p>
            <button
              onClick={handleOpenRegister}
              className="mt-6 inline-flex items-center gap-1.5 bg-editorial-text text-editorial-bg px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-editorial-accent hover:text-white transition-all border border-editorial-text"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Launch First Store</span>
            </button>
          </div>
        )}
      </section>

      {/* Registration Modal Overlay */}
      {isRegisterOpen && (
        <div id="register-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-editorial-text/60 overflow-y-auto">
          <div className="bg-editorial-bg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-editorial-text shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-editorial-text/10 flex items-center justify-between sticky top-0 bg-editorial-bg z-10">
              <div>
                <h3 className="text-xl font-serif italic text-editorial-text">Host Your Storefront</h3>
                <p className="text-editorial-text/50 text-xs mt-1">Get an instant shareable link, automated payouts, and escrow protection.</p>
              </div>
              <button
                id="close-register-btn"
                onClick={() => setIsRegisterOpen(false)}
                className="text-editorial-text/50 hover:text-editorial-text p-2 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitStore} className="p-6 space-y-6">
              {/* Basic Details */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold tracking-widest text-editorial-text/40 uppercase">1. Storefront Details</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-editorial-text/70 mb-1 uppercase tracking-wider">Store Name *</label>
                    <input
                      id="tour-store-name"
                      type="text"
                      required
                      placeholder="e.g. Yemi's Fashion & Crafts"
                      value={storeName}
                      onChange={handleStoreNameChange}
                      className="w-full px-3 py-2.5 bg-editorial-bg border border-editorial-text/20 text-xs focus:outline-none focus:border-editorial-text transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-editorial-text/70 mb-1 uppercase tracking-wider">Store Link slug *</label>
                    <div className="flex border border-editorial-text/20 overflow-hidden bg-editorial-beige text-xs">
                      <span className="flex items-center px-3 text-editorial-text/50 bg-editorial-text/5 border-r border-editorial-text/10 font-mono text-[10px]">/store/</span>
                      <input
                        type="text"
                        required
                        placeholder="yemis-fashion"
                        value={storeSlug}
                        onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                        className="w-full px-3 py-2.5 bg-editorial-bg focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-editorial-text/70 mb-1 uppercase tracking-wider">Store Description *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Describe your store, products, and location so buyers know what they are getting."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2.5 bg-editorial-bg border border-editorial-text/20 text-xs focus:outline-none focus:border-editorial-text transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-editorial-text/70 mb-1 uppercase tracking-wider">Store Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-editorial-bg border border-editorial-text/20 text-xs focus:outline-none focus:border-editorial-text transition-all"
                    >
                      <option value="Fashion">Fashion</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Home & Living">Home & Living</option>
                      <option value="Services">Services</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-editorial-text/70 mb-1 uppercase tracking-wider">
                      Seller Email * {currentUser && <span className="text-[10px] text-emerald-700 font-bold normal-case lowercase">(securely verified)</span>}
                    </label>
                    <input
                      type="email"
                      required
                      disabled={!!currentUser}
                      placeholder="e.g. yemi@example.com"
                      value={sellerEmail}
                      onChange={(e) => setSellerEmail(e.target.value)}
                      className={`w-full px-3 py-2.5 border text-xs focus:outline-none focus:border-editorial-text transition-all font-mono ${
                        currentUser 
                          ? 'bg-neutral-100 border-neutral-300 text-neutral-500 cursor-not-allowed' 
                          : 'bg-editorial-bg border-editorial-text/20 text-editorial-text'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Paystack Split Settings */}
              <div className="space-y-4 border-t border-editorial-text/10 pt-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold tracking-widest text-editorial-text/40 uppercase">2. Bank Details & Paystack Subaccount</h4>
                  <span className="inline-flex items-center gap-1 border border-editorial-accent/30 bg-editorial-accent/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-editorial-accent">
                    <Check className="h-3 w-3" /> Split Payouts Live
                  </span>
                </div>

                <p className="text-xs text-editorial-text/60 leading-relaxed italic font-serif">
                  Provide your Nigerian bank account. Tradehub automatically generates a secure **Paystack Subaccount** linked to this account. When buyers purchase, Paystack will instantly split and pay you 90% and Tradehub 10%.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-editorial-text/70 mb-1 uppercase tracking-wider">Select Bank</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-editorial-bg border border-editorial-text/20 text-xs focus:outline-none focus:border-editorial-text transition-all"
                    >
                      {NIGERIAN_BANKS.map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-editorial-text/70 mb-1 uppercase tracking-wider">NUBAN Account Number *</label>
                    <div className="flex gap-2">
                      <input
                        id="tour-account-number"
                        type="text"
                        required
                        maxLength={10}
                        placeholder="e.g. 0123456789 (10 digits)"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-3 py-2.5 bg-editorial-bg border border-editorial-text/20 text-xs focus:outline-none focus:border-editorial-text transition-all font-mono"
                      />
                      <button
                        id="tour-link-paystack"
                        type="button"
                        onClick={handleGenerateSubaccount}
                        disabled={isSubaccountGenerating || accountNumber.length !== 10}
                        className="whitespace-nowrap px-4 py-2.5 bg-editorial-beige hover:bg-editorial-text hover:text-editorial-bg disabled:opacity-50 text-editorial-text font-bold text-[10px] uppercase tracking-wider border border-editorial-text transition-colors"
                      >
                        {isSubaccountGenerating ? 'Linking...' : 'Link Paystack'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subaccount generation feedback */}
                {subaccountResult ? (
                  <div className="bg-editorial-beige/50 border border-editorial-text/20 p-4 flex items-center space-x-3 text-editorial-text">
                    <div className="h-8 w-8 border border-editorial-text flex items-center justify-center flex-shrink-0 bg-editorial-bg">
                      <Building className="h-4 w-4" />
                    </div>
                    <div className="text-xs">
                      <p className="font-bold uppercase tracking-wider text-[10px]">Paystack Subaccount Linked Successfully</p>
                      <p className="font-mono text-[9px] text-editorial-text/60 mt-0.5">Code: <span className="font-bold underline">{subaccountResult}</span> (90/10 split ready)</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-editorial-beige/30 border border-editorial-text/10 p-4 flex items-center space-x-3 text-editorial-text/70">
                    <div className="h-8 w-8 border border-editorial-text/10 flex items-center justify-center flex-shrink-0 bg-editorial-bg">
                      <HelpCircle className="h-4 w-4" />
                    </div>
                    <p className="text-[11px] leading-relaxed italic font-serif">
                      Please enter your 10-digit account number and click **Link Paystack** to generate your subaccount and activate split payments on our server.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-editorial-text/10 pt-6 flex justify-end gap-3 sticky bottom-0 bg-editorial-bg">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-5 py-3 border border-editorial-text/20 text-xs font-bold uppercase tracking-wider hover:bg-editorial-beige text-editorial-text"
                >
                  Cancel
                </button>
                <button
                  id="tour-submit-store"
                  type="submit"
                  disabled={isSubmitting || !subaccountResult}
                  className="px-6 py-3 bg-editorial-text text-editorial-bg font-bold text-xs uppercase tracking-widest hover:bg-editorial-accent hover:text-white border border-editorial-text transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Publish Storefront'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
