/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Store, Product, Order, OrderItem } from '../types';
import { 
  ShoppingBag, 
  ArrowLeft, 
  Copy, 
  Check, 
  Trash2, 
  Plus, 
  Minus, 
  ShieldCheck,
  CreditCard,
  Building,
  CheckCircle2,
  Info,
  QrCode,
  Sparkles,
  Upload,
  X,
  Settings,
  Image,
  Sliders
} from 'lucide-react';

interface StorefrontProps {
  store: Store;
  products: Product[];
  onBack: () => void;
  onCreateOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<Order>;
  onUpdateStore?: (id: string, updates: Partial<Omit<Store, 'id' | 'createdAt'>>) => Promise<Store | null>;
}

export default function Storefront({ store, products, onBack, onCreateOrder, onUpdateStore }: StorefrontProps) {
  // Cart state
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Checkout & Paystack state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  
  const [paystackStep, setPaystackStep] = useState<'details' | 'payment_method' | 'card_entry' | 'processing' | 'success'>('details');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [createdOrderResult, setCreatedOrderResult] = useState<Order | null>(null);

  // Logo & Banner Customization States
  const [localLogo, setLocalLogo] = useState<string | undefined>(store.logoUrl);
  const [localBanner, setLocalBanner] = useState<string | undefined>(store.bannerUrl);
  const [localAccentColor, setLocalAccentColor] = useState<string>(store.accentColor || '#008751');
  const [localHeaderFont, setLocalHeaderFont] = useState<string>(store.headerFont || 'font-serif');
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  useEffect(() => {
    setLocalLogo(store.logoUrl);
    setLocalBanner(store.bannerUrl);
    setLocalAccentColor(store.accentColor || '#008751');
    setLocalHeaderFont(store.headerFont || 'font-serif');
  }, [store]);

  // Logo generator parameters
  const [logoInitials, setLogoInitials] = useState(store.name.substring(0, 2).toUpperCase());
  const [logoBgColor, setLogoBgColor] = useState('#008751'); // Tradehub Green
  const [logoTextColor, setLogoTextColor] = useState('#FFFFFF');
  const [logoShape, setLogoShape] = useState<'circle' | 'square' | 'rounded'>('circle');

  // Banner generator parameters
  const [bannerHeadline, setBannerHeadline] = useState(store.name);
  const [bannerSubline, setBannerSubline] = useState(store.description);
  const [bannerStyle, setBannerStyle] = useState<'gradient' | 'waves' | 'grid' | 'solid'>('gradient');
  const [bannerColorTheme, setBannerColorTheme] = useState<'green' | 'pine' | 'mint' | 'gold'>('green');

  const generateLogoPlaceholder = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 300, 300);

      // Draw background shape
      ctx.fillStyle = logoBgColor;
      if (logoShape === 'circle') {
        ctx.beginPath();
        ctx.arc(150, 150, 150, 0, Math.PI * 2);
        ctx.fill();
      } else if (logoShape === 'rounded') {
        const radius = 60;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(300 - radius, 0);
        ctx.quadraticCurveTo(300, 0, 300, radius);
        ctx.lineTo(300, 300 - radius);
        ctx.quadraticCurveTo(300, 300, 300 - radius, 300);
        ctx.lineTo(radius, 300);
        ctx.quadraticCurveTo(0, 300, 0, 300 - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(0, 0, 300, 300);
      }

      // Decorative inner ring
      ctx.strokeStyle = logoTextColor + '30';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(150, 150, 120, 0, Math.PI * 2);
      ctx.stroke();

      // Initials text
      ctx.fillStyle = logoTextColor;
      ctx.font = 'bold 90px "Playfair Display", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(logoInitials, 150, 155);

      const dataUrl = canvas.toDataURL('image/png');
      setLocalLogo(dataUrl);
    }
  };

  const generateBannerPlaceholder = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Pick theme colors
      let primary = '#008751'; // Emerald Green
      let secondary = '#0E1A12'; // Deep Forest
      let textColor = '#FFFFFF';

      if (bannerColorTheme === 'pine') {
        primary = '#143625';
        secondary = '#2D6A4F';
      } else if (bannerColorTheme === 'mint') {
        primary = '#40916C';
        secondary = '#74C69D';
      } else if (bannerColorTheme === 'gold') {
        primary = '#1B4332';
        secondary = '#D8973C';
      }

      // Background drawing
      if (bannerStyle === 'solid') {
        ctx.fillStyle = primary;
        ctx.fillRect(0, 0, 1200, 400);
      } else if (bannerStyle === 'gradient') {
        const grad = ctx.createLinearGradient(0, 0, 1200, 400);
        grad.addColorStop(0, primary);
        grad.addColorStop(1, secondary);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1200, 400);
      } else if (bannerStyle === 'waves') {
        const grad = ctx.createLinearGradient(0, 0, 1200, 400);
        grad.addColorStop(0, primary);
        grad.addColorStop(1, secondary);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1200, 400);

        // Wave overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.moveTo(0, 200);
        ctx.bezierCurveTo(300, 100, 600, 300, 1200, 150);
        ctx.lineTo(1200, 400);
        ctx.lineTo(0, 400);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.beginPath();
        ctx.moveTo(0, 150);
        ctx.bezierCurveTo(400, 300, 800, 100, 1200, 250);
        ctx.lineTo(1200, 400);
        ctx.lineTo(0, 400);
        ctx.closePath();
        ctx.fill();
      } else if (bannerStyle === 'grid') {
        ctx.fillStyle = primary;
        ctx.fillRect(0, 0, 1200, 400);

        // Technical Grid Line overlays
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        const spacing = 40;
        for (let x = 0; x < 1200; x += spacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 400);
          ctx.stroke();
        }
        for (let y = 0; y < 400; y += spacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(1200, y);
          ctx.stroke();
        }
      }

      // Elegant side bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(40, 40, 6, 320);

      // Text setup
      ctx.fillStyle = textColor;
      ctx.font = 'bold italic 60px "Playfair Display", Georgia, serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(bannerHeadline, 70, 80);

      // Subline
      ctx.font = 'normal 22px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      
      const maxTextWidth = 1000;
      const words = bannerSubline.split(' ');
      let line = '';
      let y = 170;
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxTextWidth && n > 0) {
          ctx.fillText(line, 70, y);
          line = words[n] + ' ';
          y += 32;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 70, y);

      // Escrow badge drawing
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      
      const badgeY = 320;
      // Polyfill rounded rect for compatibility
      ctx.fillRect(70, badgeY, 360, 40);
      ctx.strokeRect(70, badgeY, 360, 40);

      ctx.fillStyle = '#10B981'; // Green status indicator dot
      ctx.beginPath();
      ctx.arc(90, badgeY + 20, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText('90% PAYSTACK ESCROW ROUTING ACTIVE', 110, badgeY + 15);

      const dataUrl = canvas.toDataURL('image/png');
      setLocalBanner(dataUrl);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLocalLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLocalBanner(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAppearance = async () => {
    try {
      if (onUpdateStore) {
        await onUpdateStore(store.id, {
          logoUrl: localLogo,
          bannerUrl: localBanner,
          accentColor: localAccentColor,
          headerFont: localHeaderFont
        });
      }
      setIsCustomizeOpen(false);
      alert('Appearance settings successfully applied and saved!');
    } catch (err) {
      console.error(err);
      alert('Failed to save appearance settings.');
    }
  };

  // Link copy state
  const [linkCopied, setLinkCopied] = useState(false);

  // Store url
  const storefrontUrl = `${window.location.origin}/store/${store.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storefrontUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Cannot add more. Only ${product.stock} items left in stock.`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (!existing) return prev;
      
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((item) => item.product.id !== productId);
      }
      
      if (newQty > existing.product.stock) {
        alert(`Cannot exceed stock limits. Only ${existing.product.stock} items available.`);
        return prev;
      }

      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      );
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const platformFee = Math.round(cartTotal * 0.1);
  const sellerShare = cartTotal - platformFee;

  // Handle Paystack payment completion
  const handlePaystackPayment = async () => {
    if (!cardNumber || !cardExpiry || !cardCvv) {
      alert('Please fill out card details.');
      return;
    }
    setPaystackStep('processing');
    
    // Simulate Paystack processing delays
    setTimeout(async () => {
      try {
        const orderItems: OrderItem[] = cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        }));

        const orderData: Omit<Order, 'id' | 'createdAt'> = {
          storeId: store.id,
          storeName: store.name,
          buyerName,
          buyerEmail,
          buyerPhone,
          deliveryAddress,
          items: orderItems,
          totalAmount: cartTotal,
          platformFee,
          sellerShare,
          paystackSubaccount: store.paystackSubaccount,
          paystackReference: `PSTK_${Math.floor(100000000 + Math.random() * 900000000)}_LIVE`,
          status: 'paid', // Initial paid state which sets escrow
          escrowStatus: 'held', // Funds held in escrow
        };

        const result = await onCreateOrder(orderData);
        setCreatedOrderResult(result);
        setPaystackStep('success');
        setCart([]); // Clear cart
      } catch (err) {
        console.error(err);
        alert('Failed to place order. Payout was rolled back.');
        setPaystackStep('card_entry');
      }
    }, 2000);
  };

  const formatNaira = (num: number) => {
    return '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <div 
      className="bg-editorial-bg min-h-screen pb-16 text-editorial-text font-sans"
      style={{
        '--color-editorial-accent': store.accentColor || '#008751',
        '--font-serif': store.headerFont === 'font-sans' ? 'var(--font-sans)' :
                       store.headerFont === 'font-mono' ? 'var(--font-mono)' :
                       store.headerFont === 'font-grotesk' ? 'var(--font-grotesk)' :
                       store.headerFont === 'font-fraunces' ? 'var(--font-fraunces)' :
                       'var(--font-serif)'
      } as React.CSSProperties}
    >
      {/* Branded Store Hero Banner */}
      <div 
        className={`relative border-b border-editorial-text/20 text-white ${!localBanner ? 'bg-gradient-to-r ' + store.bannerColor : ''}`}
        style={localBanner ? { backgroundImage: `url(${localBanner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Back & Customize Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-white/15 hover:bg-white/25 px-4 py-2 border border-white/20 transition-all cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Tradehub Hub</span>
            </button>

            <button
              onClick={() => setIsCustomizeOpen(true)}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 border border-emerald-500 transition-all cursor-pointer shadow-sm"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Customize Storefront Appearance</span>
            </button>
          </div>
 
          {/* Store Info and Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="max-w-xl">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-4">
                {localLogo ? (
                  <img 
                    src={localLogo} 
                    alt={`${store.name} Logo`} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/85 shadow-md flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center font-bold font-serif text-lg text-white shadow-md flex-shrink-0">
                    {store.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <span className="inline-block border border-white/40 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider">
                    {store.category} Storefront
                  </span>
                  <h1 className="text-4xl sm:text-5xl font-serif italic tracking-tight mt-1">{store.name}</h1>
                </div>
              </div>
              <p className="text-white/80 text-xs mt-3 leading-relaxed font-serif italic">{store.description}</p>
            </div>
 
            {/* Split protection stats badge */}
            <div className="bg-white/10 border border-white/15 p-5 text-xs space-y-2.5 w-full md:w-auto min-w-[280px]">
              <div className="flex items-center justify-between text-white/90">
                <span className="uppercase tracking-wider text-[9px]">Payout Split:</span>
                <span className="font-bold text-emerald-300">90% Seller / 10% Hub</span>
              </div>
              <div className="flex items-center justify-between text-white/90">
                <span className="uppercase tracking-wider text-[9px]">Paystack Subaccount:</span>
                <span className="font-mono font-bold text-white bg-black/20 px-2 py-0.5 border border-white/10">{store.paystackSubaccount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300 text-[10px] font-bold border-t border-white/10 pt-2.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="uppercase tracking-widest text-[9px]">Buyer Protection Escrow Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {/* Share Link Widget & Navigation */}
      <div className="bg-editorial-bg border-b border-editorial-text/10 py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Link copier & Clickable QR Code */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            
            {/* Link copier box with Copy Shop Link Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-editorial-beige border border-editorial-text/15 p-2 sm:p-1 md:max-w-xl">
              <div className="flex items-center gap-2 px-3 py-1 text-xs">
                <span className="text-editorial-text/40 font-bold uppercase tracking-wider text-[10px] select-none flex-shrink-0">Shop Link:</span>
                <input
                  type="text"
                  readOnly
                  value={storefrontUrl}
                  className="bg-transparent text-editorial-text outline-none font-mono select-all text-xs w-48 sm:w-56"
                />
              </div>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-2 bg-editorial-text text-editorial-bg hover:bg-editorial-accent hover:text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
                title="Copy Shop Link"
              >
                {linkCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Shop Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Clickable QR Code Widget */}
            <div className="flex items-center gap-3 bg-editorial-beige border border-editorial-text/15 px-4 py-2">
              <a
                href={storefrontUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-1 bg-white border border-editorial-text/10 hover:border-editorial-accent transition-colors cursor-pointer"
                title="Click to visit storefront link"
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(storefrontUrl)}`}
                  alt="Storefront QR Code"
                  className="w-10 h-10 object-contain"
                />
              </a>
              <div className="text-[10px] leading-tight">
                <p className="font-bold uppercase tracking-wider text-editorial-text">Scan or Click QR</p>
                <a 
                  href={storefrontUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-editorial-accent hover:underline flex items-center gap-1 mt-1 font-bold uppercase tracking-widest text-[9px]"
                >
                  <QrCode className="h-3 w-3" />
                  <span>Open shop</span>
                </a>
              </div>
            </div>

          </div>
 
          {/* Cart triggers */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="inline-flex items-center gap-2 bg-editorial-text text-editorial-bg px-5 py-3 text-xs font-bold uppercase tracking-widest border border-editorial-text hover:bg-editorial-accent hover:text-white transition-all cursor-pointer w-full sm:w-auto justify-center"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>View Bag ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
            <span className="ml-1 pl-2 border-l border-editorial-bg/30">{formatNaira(cartTotal)}</span>
          </button>
        </div>
      </div>
 
      {/* Products list inside storefront */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 border-b border-editorial-text/10 pb-5">
          <h2 className="text-2xl font-serif italic text-editorial-text">Product Catalog</h2>
          <p className="text-editorial-text/60 text-xs mt-1">Direct purchases automatically route securely via Paystack splits.</p>
        </div>
 
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="bg-editorial-bg border border-editorial-text/15 overflow-hidden transition-all flex flex-col justify-between"
              >
                {/* Product Image */}
                <div className="h-56 bg-editorial-beige relative overflow-hidden group border-b border-editorial-text/15">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {product.stock <= 0 ? (
                    <span className="absolute top-3 right-3 bg-editorial-accent text-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider">
                      Sold out
                    </span>
                  ) : product.stock <= 5 ? (
                    <span className="absolute top-3 right-3 border border-amber-300 bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-800 uppercase tracking-wider animate-pulse">
                      Only {product.stock} left
                    </span>
                  ) : null}
                </div>
 
                {/* Info and Purchase */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold tracking-widest text-editorial-text/50 uppercase">
                      {product.category}
                    </span>
                    <h3 className="font-serif italic text-base text-editorial-text mt-1.5 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-editorial-text/60 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
 
                  <div className="mt-6 border-t border-editorial-text/10 pt-4 flex items-center justify-between">
                    <span className="text-base font-bold font-mono text-editorial-text">
                      {formatNaira(product.price)}
                    </span>
 
                    <button
                      disabled={product.stock <= 0}
                      onClick={() => addToCart(product)}
                      className="bg-editorial-bg hover:bg-editorial-text text-editorial-text hover:text-editorial-bg disabled:opacity-40 px-3.5 py-2 border border-editorial-text text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <span>Add to Bag</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-editorial-text/20 max-w-md mx-auto bg-editorial-beige/10">
            <ShoppingBag className="h-10 w-10 text-editorial-text/30 mx-auto mb-4" />
            <h3 className="text-lg font-serif italic text-editorial-text">No products posted yet</h3>
            <p className="text-editorial-text/50 text-xs mt-1">This storefront is active, but the seller hasn't posted any products yet.</p>
          </div>
        )}
      </main>
 
      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div id="cart-drawer" className="fixed inset-0 z-50 bg-editorial-text/60 flex justify-end">
          <div className="bg-editorial-bg w-full max-w-md h-full flex flex-col justify-between border-l border-editorial-text shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-editorial-text/10 flex items-center justify-between bg-editorial-beige/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-editorial-text" />
                <h3 className="text-lg font-serif italic text-editorial-text">Your Shopping Bag</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-editorial-text/50 hover:text-editorial-text font-bold uppercase tracking-widest text-[10px] cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
 
            {/* Cart Items */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4 bg-editorial-bg">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div key={item.product.id} className="flex gap-4 pb-4 border-b border-editorial-text/10">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="h-16 w-16 border border-editorial-text/10 object-cover flex-shrink-0"
                    />
 
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif italic text-sm text-editorial-text line-clamp-1">{item.product.name}</h4>
                        <p className="text-[10px] text-editorial-text/50 mt-1 font-mono">{formatNaira(item.product.price)} each</p>
                      </div>
 
                      {/* Quantity editors */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-editorial-text/20 h-7 bg-editorial-bg">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="px-2.5 bg-editorial-beige hover:bg-editorial-text hover:text-editorial-bg text-editorial-text h-full transition-colors cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 text-xs font-bold font-mono text-editorial-text">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="px-2.5 bg-editorial-beige hover:bg-editorial-text hover:text-editorial-bg text-editorial-text h-full transition-colors cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
 
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-editorial-accent hover:opacity-80 p-1 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <ShoppingBag className="h-8 w-8 text-editorial-text/30 mx-auto mb-3" />
                  <p className="text-editorial-text/50 text-xs italic font-serif">Your shopping bag is completely empty.</p>
                </div>
              )}
            </div>
 
            {/* Summary & Checkout Button */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-editorial-text/15 bg-editorial-beige/60 space-y-4">
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-editorial-text/60">
                    <span className="uppercase tracking-widest text-[9px] font-bold">Subtotal</span>
                    <span className="font-bold text-editorial-text text-sm font-mono">{formatNaira(cartTotal)}</span>
                  </div>
                  
                  {/* Split visualization indicator */}
                  <div className="border border-editorial-text/15 p-4 text-[11px] bg-editorial-bg leading-normal text-editorial-text space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-editorial-text uppercase tracking-widest text-[9px] border-b border-editorial-text/10 pb-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-editorial-accent" />
                      <span>Protected Split Transaction Details</span>
                    </div>
                    <div className="flex justify-between font-mono text-editorial-text/80 text-[10px]">
                      <span>90% Seller Payout (Direct to bank):</span>
                      <span className="font-bold">{formatNaira(sellerShare)}</span>
                    </div>
                    <div className="flex justify-between font-mono text-editorial-text/80 text-[10px]">
                      <span>10% Platform Commission:</span>
                      <span className="font-bold">{formatNaira(platformFee)}</span>
                    </div>
                    <div className="text-[10px] text-editorial-text/50 border-t border-dashed border-editorial-text/10 pt-2 font-serif italic leading-relaxed">
                      🔒 Escrow protection holds the 90% payout until you confirm delivery or 7 days elapse.
                    </div>
                  </div>
                </div>
 
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                    setPaystackStep('details');
                  }}
                  className="w-full bg-editorial-text text-editorial-bg py-4 text-xs font-bold uppercase tracking-widest border border-editorial-text hover:bg-editorial-accent hover:text-white transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
 
      {/* Checkout Modal & Paystack Simulation Sheet */}
      {isCheckoutOpen && (
        <div id="checkout-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-editorial-text/60 overflow-y-auto">
          <div className="bg-editorial-bg border border-editorial-text max-w-lg w-full shadow-2xl flex flex-col">
            {/* Paystack Branded Header */}
            <div className="bg-editorial-text text-editorial-bg p-5 flex items-center justify-between border-b border-editorial-text/10">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-editorial-bg text-editorial-text flex items-center justify-center text-xs font-black border border-editorial-text">
                  P
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest">Paystack Secure Split</h4>
                  <p className="text-[10px] text-editorial-bg/60">Paying {store.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-editorial-bg/50 font-bold uppercase tracking-wider">Total Due</p>
                <p className="text-sm font-bold font-mono text-editorial-accent bg-white px-2 py-0.5 border border-editorial-text/20">{formatNaira(cartTotal)}</p>
              </div>
            </div>
 
            {/* Steps router */}
            <div className="p-6 flex-1 overflow-y-auto bg-editorial-bg">
              {paystackStep === 'details' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-editorial-text/50 mb-2">1. Delivery & Buyer Details</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-editorial-text/50 mb-1 uppercase tracking-widest">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Chioma Obi"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className="w-full px-3 py-2 border border-editorial-text/20 bg-editorial-bg text-xs focus:outline-none focus:border-editorial-text"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-editorial-text/50 mb-1 uppercase tracking-widest">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 08012345678"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-editorial-text/20 bg-editorial-bg text-xs focus:outline-none focus:border-editorial-text font-mono"
                      />
                    </div>
                  </div>
 
                  <div>
                    <label className="block text-[9px] font-bold text-editorial-text/50 mb-1 uppercase tracking-widest">Email Address (For receipts)</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. chioma@example.com"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-editorial-text/20 bg-editorial-bg text-xs focus:outline-none focus:border-editorial-text font-mono"
                    />
                  </div>
 
                  <div>
                    <label className="block text-[9px] font-bold text-editorial-text/50 mb-1 uppercase tracking-widest">Detailed Delivery Address</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Street name, estate name, city, and state"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-editorial-text/20 bg-editorial-bg text-xs focus:outline-none focus:border-editorial-text font-serif italic"
                    />
                  </div>
 
                  <div className="pt-4 border-t border-editorial-text/10 flex justify-end gap-2">
                    <button
                      onClick={() => setIsCheckoutOpen(false)}
                      className="px-4 py-2 border border-editorial-text/20 text-xs font-bold uppercase tracking-wider text-editorial-text/70 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!buyerName || !buyerEmail || !buyerPhone || !deliveryAddress}
                      onClick={() => setPaystackStep('payment_method')}
                      className="px-5 py-2.5 bg-editorial-text text-editorial-bg hover:bg-editorial-accent hover:text-white disabled:opacity-40 text-xs font-bold uppercase tracking-widest border border-editorial-text transition-all cursor-pointer"
                    >
                      Proceed to Pay
                    </button>
                  </div>
                </div>
              )}
 
              {paystackStep === 'payment_method' && (
                <div className="space-y-4">
                  <div className="border border-editorial-text/15 text-editorial-text p-4 bg-editorial-beige/30 text-xs flex gap-2">
                    <Info className="h-5 w-5 text-editorial-accent flex-shrink-0" />
                    <div>
                      <p className="font-bold uppercase tracking-wider text-[9px]">Split Calculation Enabled:</p>
                      <p className="mt-1 font-serif italic text-editorial-text/80">
                        We will route **{formatNaira(sellerShare)}** to the seller's Subaccount ({store.paystackSubaccount}) and **{formatNaira(platformFee)}** to the Tradehub Platform account instantly upon authorization.
                      </p>
                    </div>
                  </div>
 
                  <h3 className="text-[10px] font-bold text-editorial-text/40 tracking-widest uppercase mt-4">Select Paystack Method</h3>
 
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => setPaystackStep('card_entry')}
                      className="flex items-center justify-between border border-editorial-text/20 hover:border-editorial-text p-4 text-left transition-all bg-editorial-bg cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-editorial-beige text-editorial-text border border-editorial-text/10 flex items-center justify-center">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-editorial-text uppercase tracking-wider">Pay with Debit Card</p>
                          <p className="text-[10px] text-editorial-text/50">Visa, Mastercard, Verve</p>
                        </div>
                      </div>
                      <span className="text-editorial-text group-hover:translate-x-1 transition-transform">➔</span>
                    </button>
 
                    <div className="opacity-40 flex items-center justify-between border border-editorial-text/10 p-4 text-left bg-editorial-beige/30 cursor-not-allowed">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-editorial-bg text-editorial-text/30 flex items-center justify-center border border-editorial-text/5">
                          <Building className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-editorial-text/50 uppercase tracking-wider">Pay via Bank Transfer</p>
                          <p className="text-[10px] text-editorial-text/30">All Nigerian Banks supported</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-editorial-text/10 px-2 py-0.5 border border-editorial-text/5 text-editorial-text/60">Demo Blocked</span>
                    </div>
                  </div>
 
                  <div className="pt-4 border-t border-editorial-text/10 flex justify-between">
                    <button
                      onClick={() => setPaystackStep('details')}
                      className="px-4 py-2 border border-editorial-text/20 text-xs font-bold uppercase tracking-wider text-editorial-text/70 cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
 
              {paystackStep === 'card_entry' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-editorial-text/50 mb-2 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-editorial-text" />
                    <span>Enter Card Details</span>
                  </h3>
 
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold text-editorial-text/50 uppercase tracking-widest mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="4000 1234 5678 9010 (Demo card)"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9]/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                        className="w-full px-3 py-2 border border-editorial-text/20 bg-editorial-bg text-xs focus:outline-none focus:border-editorial-text font-mono"
                      />
                    </div>
 
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-editorial-text/50 uppercase tracking-widest mb-1">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 border border-editorial-text/20 bg-editorial-bg text-xs focus:outline-none focus:border-editorial-text font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-editorial-text/50 uppercase tracking-widest mb-1">CVV</label>
                        <input
                          type="password"
                          placeholder="123"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full px-3 py-2 border border-editorial-text/20 bg-editorial-bg text-xs focus:outline-none focus:border-editorial-text font-mono"
                        />
                      </div>
                    </div>
                  </div>
 
                  <div className="border border-emerald-300 bg-emerald-50 text-emerald-800 p-3 text-[10px] leading-normal flex gap-1.5 items-center font-serif italic">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>Locked Escrow: Payment is secured by Tradehub Protection until order is confirmed.</span>
                  </div>
 
                  <div className="pt-4 border-t border-editorial-text/10 flex justify-between">
                    <button
                      onClick={() => setPaystackStep('payment_method')}
                      className="px-4 py-2 border border-editorial-text/20 text-xs font-bold uppercase tracking-wider text-editorial-text/70 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePaystackPayment}
                      className="px-5 py-2.5 bg-editorial-text text-editorial-bg hover:bg-editorial-accent hover:text-white text-xs font-bold uppercase tracking-widest border border-editorial-text transition-all cursor-pointer"
                    >
                      Authorize Payment
                    </button>
                  </div>
                </div>
              )}
 
              {paystackStep === 'processing' && (
                <div className="py-12 text-center space-y-4">
                  <div className="h-10 w-10 border-2 border-editorial-text border-t-transparent animate-spin mx-auto"></div>
                  <div>
                    <h3 className="font-serif italic text-base text-editorial-text">Authorizing Split Payment...</h3>
                    <p className="text-xs text-editorial-text/50 mt-1">Contacting Paystack API & validating subaccount splits.</p>
                  </div>
                </div>
              )}
 
              {paystackStep === 'success' && createdOrderResult && (
                <div className="py-6 text-center space-y-5 bg-editorial-bg">
                  <div className="h-12 w-12 border border-emerald-400 bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
 
                  <div>
                    <h3 className="font-serif italic text-xl text-editorial-text">Payment Authorized!</h3>
                    <p className="text-xs text-editorial-text/50 mt-1">Automatic split of 90% is locked safely in the seller's escrow wallet.</p>
                  </div>
 
                  {/* Order details display */}
                  <div className="bg-editorial-beige/30 border border-editorial-text/10 p-4 text-xs space-y-3 max-w-sm mx-auto text-left">
                    <div className="flex justify-between border-b border-editorial-text/10 pb-2">
                      <span className="text-editorial-text/50 uppercase tracking-widest text-[9px]">Order Reference:</span>
                      <span className="font-mono font-bold text-editorial-accent select-all">{createdOrderResult.id}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span>Total Price Paid:</span>
                      <span className="font-bold text-editorial-text">{formatNaira(createdOrderResult.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[10px] text-editorial-text/50">
                      <span>90% Seller Payout (Escrow):</span>
                      <span>{formatNaira(createdOrderResult.sellerShare)}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[10px] text-editorial-text/50">
                      <span>10% Platform (Tradehub):</span>
                      <span>{formatNaira(createdOrderResult.platformFee)}</span>
                    </div>
                  </div>
 
                  <p className="text-[11px] text-editorial-text/60 leading-normal max-w-xs mx-auto font-serif italic">
                    👉 **Write down your Order Reference ID!** Visit the **Buyer Protection & Tracker** tab at any time to check dispatch progress, release funds to the seller, or file an escrow dispute.
                  </p>
 
                  <div className="pt-4 border-t border-editorial-text/10 flex justify-center bg-editorial-bg">
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        onBack();
                      }}
                      className="px-6 py-2.5 bg-editorial-text text-editorial-bg hover:bg-editorial-accent hover:text-white text-xs font-bold uppercase tracking-widest border border-editorial-text transition-all cursor-pointer"
                    >
                      Done / Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Storefront Customization Drawer/Modal */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-editorial-text/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto border-l border-editorial-text/25 shadow-2xl flex flex-col font-sans text-editorial-text">
            {/* Header */}
            <div className="p-6 bg-[#008751] text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5" />
                <div>
                  <h3 className="font-serif italic text-lg font-bold">Appearance Settings</h3>
                  <p className="text-[10px] text-white/80 uppercase tracking-widest font-mono">Storefront Brand Panel</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCustomizeOpen(false)}
                className="text-white hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
                title="Close Customize Panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-8 flex-1">
              {/* Intro note */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Interactive Brand Customizer</span>
                </p>
                <p className="leading-relaxed">
                  Design a fully-customized visual experience for your storefront. Build modern high-resolution logo and banner placeholders using vector generators, or upload your own files instantly.
                </p>
              </div>

              {/* SECTION 1: LOGO GENERATOR & UPLOADER */}
              <div className="space-y-4 border-b border-editorial-text/10 pb-6">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold font-mono">1</span>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-editorial-text/70">Storefront Brand Logo</h4>
                </div>

                {/* Logo Preview */}
                <div className="flex items-center gap-4 bg-editorial-beige/40 p-4 border border-editorial-text/10 rounded-xs">
                  <div className="flex-shrink-0">
                    {localLogo ? (
                      <img src={localLogo} alt="Logo preview" className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600 shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#008751] text-white border-2 border-white flex items-center justify-center font-bold text-lg">
                        {logoInitials}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-editorial-text">Current Brand Logo</p>
                    <p className="text-[9px] text-editorial-text/50 leading-relaxed">Shown in header next to store name. Supported format: PNG/JPG or generated vectors.</p>
                  </div>
                </div>

                {/* Vector Generator controls */}
                <div className="border border-emerald-100 bg-emerald-50/20 p-4 space-y-4">
                  <p className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">🛠️ Vector Logo Generator Placeholder</p>
                  
                  {/* Initials */}
                  <div>
                    <label className="block text-[9px] font-bold text-editorial-text/50 uppercase tracking-widest mb-1">Initials or Monogram</label>
                    <input 
                      type="text" 
                      maxLength={3}
                      value={logoInitials}
                      onChange={(e) => setLogoInitials(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-white border border-editorial-text/20 text-xs focus:outline-none focus:border-emerald-600 font-mono"
                    />
                  </div>

                  {/* Bg & Text Preset Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-editorial-text/50 uppercase tracking-widest mb-1.5">Background Theme</label>
                      <div className="flex flex-wrap gap-2">
                        {['#008751', '#143625', '#40916C', '#1B4332', '#0E1A12', '#212529'].map((col) => (
                          <button
                            key={col}
                            onClick={() => setLogoBgColor(col)}
                            className={`h-6 w-6 rounded-full border-2 transition-all cursor-pointer ${logoBgColor === col ? 'border-emerald-600 scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: col }}
                            title={col}
                            type="button"
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-editorial-text/50 uppercase tracking-widest mb-1.5">Text Tint</label>
                      <div className="flex flex-wrap gap-2">
                        {['#FFFFFF', '#F4F1EA', '#FFEFA7', '#E2F0D9'].map((col) => (
                          <button
                            key={col}
                            onClick={() => setLogoTextColor(col)}
                            className={`h-6 w-6 rounded-full border-2 transition-all cursor-pointer ${logoTextColor === col ? 'border-emerald-600 scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: col }}
                            title={col}
                            type="button"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Shapes */}
                  <div>
                    <label className="block text-[9px] font-bold text-editorial-text/50 uppercase tracking-widest mb-1.5">Background Framing</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['circle', 'rounded', 'square'] as const).map((shape) => (
                        <button
                          key={shape}
                          onClick={() => setLogoShape(shape)}
                          type="button"
                          className={`px-3 py-1.5 text-[10px] uppercase font-bold border transition-all cursor-pointer ${logoShape === shape ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-editorial-text/25 text-editorial-text'}`}
                        >
                          {shape}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Trigger */}
                  <button
                    type="button"
                    onClick={generateLogoPlaceholder}
                    className="w-full py-2 bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Generate Logo Vector</span>
                  </button>
                </div>

                {/* Upload Section */}
                <div className="space-y-2">
                  <label className="block text-[9px] font-bold text-editorial-text/50 uppercase tracking-widest">Or upload raw logo file</label>
                  <div className="border border-dashed border-editorial-text/25 hover:border-emerald-500 transition-colors p-4 text-center cursor-pointer relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="h-5 w-5 mx-auto text-editorial-text/40 mb-1.5" />
                    <p className="text-[10px] font-bold text-editorial-text">Drag & Drop or Choose Image</p>
                    <p className="text-[8px] text-editorial-text/40 mt-1 font-mono">Max size 2MB (Any square image)</p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: HERO BANNER GENERATOR & UPLOADER */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold font-mono">2</span>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-editorial-text/70">Storefront Hero Banner</h4>
                </div>

                {/* Banner Preview */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-editorial-text uppercase tracking-widest mb-1.5">Current Banner Backdrop</p>
                  {localBanner ? (
                    <div 
                      className="h-28 border border-editorial-text/25 bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${localBanner})` }}
                    >
                      <div className="absolute inset-0 bg-black/40 flex items-center p-3 text-white">
                        <div>
                          <p className="font-serif italic text-xs font-bold">{bannerHeadline}</p>
                          <p className="text-[9px] opacity-80 line-clamp-1">{bannerSubline}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-24 border border-dashed border-editorial-text/25 flex items-center justify-center bg-editorial-beige/40 text-[10px] italic text-editorial-text/50">
                      Using standard fallback gradient ({store.bannerColor})
                    </div>
                  )}
                </div>

                {/* Vector Banner controls */}
                <div className="border border-emerald-100 bg-emerald-50/20 p-4 space-y-4">
                  <p className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">🎨 Vector Banner Backdrop Generator</p>
                  
                  {/* Headline */}
                  <div>
                    <label className="block text-[9px] font-bold text-editorial-text/50 uppercase tracking-widest mb-1">Banner Headline Title</label>
                    <input 
                      type="text" 
                      value={bannerHeadline}
                      onChange={(e) => setBannerHeadline(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-editorial-text/20 text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  {/* Subheadline */}
                  <div>
                    <label className="block text-[9px] font-bold text-editorial-text/50 uppercase tracking-widest mb-1">Banner Subheadline Tagline</label>
                    <textarea 
                      rows={2}
                      value={bannerSubline}
                      onChange={(e) => setBannerSubline(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-editorial-text/20 text-xs focus:outline-none focus:border-emerald-600 resize-none"
                    />
                  </div>

                  {/* Banner preset layout styles & color theme */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-editorial-text/50 uppercase tracking-widest mb-1.5">Art Pattern Style</label>
                      <select 
                        value={bannerStyle}
                        onChange={(e) => setBannerStyle(e.target.value as any)}
                        className="w-full px-2 py-2 bg-white border border-editorial-text/20 text-xs focus:outline-none focus:border-emerald-600 font-mono"
                      >
                        <option value="solid">Solid Background</option>
                        <option value="gradient">Gradient Flow</option>
                        <option value="waves">Abstract Waves</option>
                        <option value="grid">Mesh Grid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-editorial-text/50 uppercase tracking-widest mb-1.5">Theme Palette</label>
                      <select 
                        value={bannerColorTheme}
                        onChange={(e) => setBannerColorTheme(e.target.value as any)}
                        className="w-full px-2 py-2 bg-white border border-editorial-text/20 text-xs focus:outline-none focus:border-emerald-600 font-mono"
                      >
                        <option value="green">Tradehub Green</option>
                        <option value="pine">Pine forest</option>
                        <option value="mint">Soft Mint</option>
                        <option value="gold">Golden Harvest</option>
                      </select>
                    </div>
                  </div>

                  {/* Generate Banner trigger */}
                  <button
                    type="button"
                    onClick={generateBannerPlaceholder}
                    className="w-full py-2 bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Generate Banner Vector</span>
                  </button>
                </div>

                {/* Upload Banner Section */}
                <div className="space-y-2">
                  <label className="block text-[9px] font-bold text-editorial-text/50 uppercase tracking-widest">Or upload custom banner file</label>
                  <div className="border border-dashed border-editorial-text/25 hover:border-emerald-500 transition-colors p-4 text-center cursor-pointer relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="h-5 w-5 mx-auto text-editorial-text/40 mb-1.5" />
                    <p className="text-[10px] font-bold text-editorial-text">Drag & Drop or Choose Image</p>
                    <p className="text-[8px] text-editorial-text/40 mt-1 font-mono">Max size 4MB (Recommended: 1200x400)</p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: ACCENT COLOR & FONT STYLE */}
              <div className="space-y-4 pt-4 border-t border-editorial-text/10">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold font-mono">3</span>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-editorial-text/70">Storefront Theme Customizer</h4>
                </div>

                {/* Accent color picker dots */}
                <div className="space-y-2">
                  <label className="block text-[9px] font-bold text-editorial-text/50 uppercase tracking-widest">Brand Accent Color</label>
                  <div className="flex flex-wrap gap-2.5">
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
                        onClick={() => setLocalAccentColor(col.hex)}
                        type="button"
                        className={`h-7 w-7 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${localAccentColor === col.hex ? 'border-emerald-600 scale-110 shadow-sm' : 'border-neutral-200 hover:border-neutral-400'}`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      >
                        {localAccentColor === col.hex && <Check className="h-3 w-3 text-white mix-blend-difference" />}
                      </button>
                    ))}
                  </div>
                  {/* Custom Hex input */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-editorial-text/50">Custom Hex:</span>
                    <input 
                      type="text" 
                      value={localAccentColor}
                      onChange={(e) => setLocalAccentColor(e.target.value)}
                      className="w-24 px-2 py-1 bg-white border border-editorial-text/20 text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Font selection */}
                <div className="space-y-2">
                  <label className="block text-[9px] font-bold text-editorial-text/50 uppercase tracking-widest">Header Font Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'font-serif', name: 'Classic Serif', preview: 'Playfair Display' },
                      { id: 'font-fraunces', name: 'Warm Editorial', preview: 'Fraunces' },
                      { id: 'font-sans', name: 'Modern Sans', preview: 'Inter' },
                      { id: 'font-grotesk', name: 'Bold Grotesque', preview: 'Space Grotesk' },
                      { id: 'font-mono', name: 'Tech Mono', preview: 'JetBrains' }
                    ].map((font) => (
                      <button
                        key={font.id}
                        onClick={() => setLocalHeaderFont(font.id)}
                        type="button"
                        className={`px-3 py-2 border text-left transition-all cursor-pointer rounded-xs flex flex-col justify-between h-14 ${localHeaderFont === font.id ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-xs' : 'bg-white border-neutral-200 hover:border-neutral-300'}`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-text/40">{font.name}</span>
                        <span className={`text-xs mt-1 truncate ${font.id === 'font-sans' ? 'font-sans' : font.id === 'font-mono' ? 'font-mono' : font.id === 'font-grotesk' ? 'font-grotesk' : font.id === 'font-fraunces' ? 'font-fraunces' : 'font-serif'}`}>
                          {font.preview} Title
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-6 bg-neutral-50 border-t border-editorial-text/10 flex justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setLocalLogo(undefined);
                  setLocalBanner(undefined);
                  setLocalAccentColor('#008751');
                  setLocalHeaderFont('font-serif');
                }}
                className="px-4 py-2 border border-editorial-text/20 hover:bg-black/5 text-[10px] font-bold uppercase tracking-widest cursor-pointer text-editorial-text/75"
              >
                Clear Brands
              </button>

              <button
                type="button"
                onClick={handleSaveAppearance}
                className="px-5 py-2.5 bg-[#008751] hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-widest cursor-pointer flex items-center gap-1"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save & Apply Appearance</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
