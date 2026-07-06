/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  HelpCircle,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface TourStep {
  id: number;
  title: string;
  description: string;
  targetId: string;
  view: 'hub' | 'seller' | 'tracker' | 'storefront';
  placement: 'top' | 'bottom' | 'left' | 'right';
  actionPrompt: string;
}

interface TourGuideProps {
  currentView: 'hub' | 'seller' | 'tracker' | 'storefront';
  onNavigate: (view: 'hub' | 'seller' | 'tracker' | 'storefront') => void;
  currentUser: any;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: "1. Start Your Storefront",
    description: "Welcome to Tradehub! Let's get started by creating your custom storefront. Click 'Create a Storefront' in the hero section to open the builder panel.",
    targetId: "hero-create-store-btn",
    view: "hub",
    placement: "bottom",
    actionPrompt: "Click the 'Create a Storefront' button on the homepage."
  },
  {
    id: 2,
    title: "2. Storefront Identity",
    description: "Give your store an elegant, catchy name. Your live URL slug is generated automatically right below it in real-time!",
    targetId: "tour-store-name",
    view: "hub",
    placement: "right",
    actionPrompt: "Open the 'Create a Storefront' panel to see this field."
  },
  {
    id: 3,
    title: "3. NUBAN Bank Details",
    description: "Enter your 10-digit Nigerian bank account number. Secure split-payout technology splits funds at checkout automatically.",
    targetId: "tour-account-number",
    view: "hub",
    placement: "top",
    actionPrompt: "Open the 'Create a Storefront' panel and find the NUBAN input."
  },
  {
    id: 4,
    title: "4. Link Paystack Split",
    description: "Click 'Link Paystack' to instantly verify your account details. This generates a Paystack Split Account (90% straight to you, 10% to Escrow/Fees).",
    targetId: "tour-link-paystack",
    view: "hub",
    placement: "top",
    actionPrompt: "Make sure you have entered a valid 10-digit account number, then click the Link button."
  },
  {
    id: 5,
    title: "5. Launch Storefront",
    description: "Ready to launch? Click 'Launch Storefront' to publish your brand new online shop live on the Tradehub-Ng ecosystem!",
    targetId: "tour-submit-store",
    view: "hub",
    placement: "top",
    actionPrompt: "Fill out all required details and click the 'Launch Storefront' submit button."
  },
  {
    id: 6,
    title: "6. Welcome to Your Console!",
    description: "Fantastic job! Now let's list your first product. Click 'Add Product' to open the stock inventory creator.",
    targetId: "dashboard-add-product-btn",
    view: "seller",
    placement: "bottom",
    actionPrompt: "Click 'Add Product' inside the Product Catalog section of your Seller Dashboard."
  },
  {
    id: 7,
    title: "7. Product Details",
    description: "Enter your product's title (e.g. Royal Handwoven Agbada), along with its pricing and current stock quantities.",
    targetId: "tour-product-title",
    view: "seller",
    placement: "right",
    actionPrompt: "Open the 'Add Product' modal to enter details."
  },
  {
    id: 8,
    title: "8. Photo Upload & Capture",
    description: "Drag & drop your product photo here, click to upload, or capture a live item snapshot using your device's camera!",
    targetId: "tour-product-upload",
    view: "seller",
    placement: "top",
    actionPrompt: "Look for the Drag & Drop area or camera option inside the form."
  },
  {
    id: 9,
    title: "9. Publish Product",
    description: "You're all set! Click 'Publish Product' to list this item live in your storefront. Buyers can now purchase it securely with Escrow protection.",
    targetId: "tour-submit-product",
    view: "seller",
    placement: "top",
    actionPrompt: "Click 'Publish Product' to save your listing."
  }
];

export default function TourGuide({ currentView, onNavigate, currentUser }: TourGuideProps) {
  const [isActive, setIsActive] = useState<boolean>(() => {
    // Check if the user completed the tour before
    return localStorage.getItem('tradehub_tour_completed') !== 'true';
  });
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [targetFound, setTargetFound] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);

  const activeStep = TOUR_STEPS[currentStepIdx];
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Position updates on screen resizes, scrolls, and step changes
  useEffect(() => {
    if (!isActive) {
      setCoords(null);
      return;
    }

    const updatePosition = () => {
      const el = document.getElementById(activeStep.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
        setTargetFound(true);
      } else {
        setCoords(null);
        setTargetFound(false);
      }
    };

    // Run immediately
    updatePosition();

    // Check periodically for DOM changes (modal openings, etc)
    const interval = setInterval(updatePosition, 500);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isActive, currentStepIdx, activeStep]);

  // Sync view if step belongs to a different view
  const syncViewForStep = (step: TourStep) => {
    if (currentView !== step.view) {
      onNavigate(step.view);
    }
  };

  const handleNext = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      const nextStep = TOUR_STEPS[currentStepIdx + 1];
      setCurrentStepIdx(prev => prev + 1);
      syncViewForStep(nextStep);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      const prevStep = TOUR_STEPS[currentStepIdx - 1];
      setCurrentStepIdx(prev => prev - 1);
      syncViewForStep(prevStep);
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    localStorage.setItem('tradehub_tour_completed', 'true');
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const handleRestartTour = () => {
    setCurrentStepIdx(0);
    setIsActive(true);
    syncViewForStep(TOUR_STEPS[0]);
  };

  const handleSkip = () => {
    setIsActive(false);
    localStorage.setItem('tradehub_tour_completed', 'true');
  };

  // Helper to construct tooltip coordinates
  const getTooltipStyle = () => {
    if (!coords) return { display: 'none' };

    const padding = 12;
    const tooltipWidth = 320;
    
    let top = 0;
    let left = 0;

    switch (activeStep.placement) {
      case 'bottom':
        top = coords.top + coords.height + padding;
        left = coords.left + (coords.width / 2) - (tooltipWidth / 2);
        break;
      case 'top':
        top = coords.top - 210; // estimate tooltip height
        left = coords.left + (coords.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = coords.top + (coords.height / 2) - 100;
        left = coords.left - tooltipWidth - padding;
        break;
      case 'right':
        top = coords.top + (coords.height / 2) - 100;
        left = coords.left + coords.width + padding;
        break;
    }

    // Keep within window bounds
    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10;
    }

    return {
      position: 'absolute' as const,
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
      zIndex: 100
    };
  };

  return (
    <>
      {/* Persistent floating launcher for the Tour */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 pointer-events-none">
        {/* Active Tooltip Banner if target is not visible on page */}
        {isActive && !targetFound && (
          <div className="pointer-events-auto bg-editorial-text text-editorial-bg p-4 border border-editorial-text shadow-2xl max-w-sm mb-3 rounded-none animate-pulse">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-editorial-accent flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-editorial-accent">Next Action Required</p>
                <p className="text-xs font-serif italic text-editorial-bg/90">
                  {activeStep.actionPrompt}
                </p>
                <p className="text-[9px] text-editorial-bg/60 font-mono">
                  Currently on Step {activeStep.id} of {TOUR_STEPS.length}
                </p>
              </div>
              <button 
                onClick={handleSkip}
                className="text-editorial-bg/40 hover:text-editorial-bg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mt-3 flex justify-between items-center border-t border-editorial-bg/10 pt-2.5">
              <button
                onClick={handlePrev}
                disabled={currentStepIdx === 0}
                className="text-[9px] font-bold uppercase tracking-wider text-editorial-bg/60 hover:text-editorial-bg disabled:opacity-30"
              >
                Back
              </button>
              
              <div className="flex items-center gap-2">
                {currentView !== activeStep.view && (
                  <button
                    onClick={() => onNavigate(activeStep.view)}
                    className="bg-editorial-accent text-white px-2 py-1 text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1 hover:brightness-110"
                  >
                    Go to Page <ArrowRight className="h-3 w-3" />
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="bg-editorial-bg text-editorial-text px-2 py-1 text-[9px] font-bold uppercase tracking-wider hover:bg-editorial-accent hover:text-white"
                >
                  Skip Step
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          id="tour-launcher-btn"
          onClick={isActive ? handleSkip : handleRestartTour}
          className="pointer-events-auto group inline-flex items-center gap-2 bg-editorial-text text-editorial-bg px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-editorial-accent hover:text-white transition-all shadow-xl border border-editorial-text"
        >
          <Sparkles className="h-4 w-4 text-editorial-accent animate-spin" style={{ animationDuration: '3s' }} />
          <span>{isActive ? 'Quit Guide' : '📖 Getting Started Tour'}</span>
        </button>
      </div>

      {/* Floating Dynamic Tooltip Box */}
      {isActive && targetFound && coords && (
        <div 
          ref={tooltipRef}
          style={getTooltipStyle()} 
          className="bg-editorial-bg text-editorial-text border-2 border-editorial-text p-5 shadow-2xl rounded-none animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Pulsing indicator on the target element */}
          <div 
            style={{
              position: 'absolute',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              height: `${coords.height}px`,
              pointerEvents: 'none',
              zIndex: 99,
              boxShadow: '0 0 0 4px rgba(0, 135, 81, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.35)'
            }}
            className="rounded-sm animate-pulse"
          />

          <div className="flex justify-between items-start mb-2">
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-editorial-accent bg-editorial-accent/5 px-2 py-0.5 border border-editorial-accent/20">
              <Sparkles className="h-3 w-3" /> Step {activeStep.id} of {TOUR_STEPS.length}
            </span>
            <button 
              onClick={handleSkip}
              className="text-editorial-text/40 hover:text-editorial-text p-1 transition-colors"
              title="Skip Tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <h4 className="text-sm font-bold uppercase tracking-wider mb-1.5 font-sans text-editorial-text">
            {activeStep.title}
          </h4>
          
          <p className="text-xs text-editorial-text/75 leading-relaxed font-serif italic mb-4">
            {activeStep.description}
          </p>

          <div className="flex justify-between items-center border-t border-editorial-text/10 pt-3">
            <button
              onClick={handlePrev}
              disabled={currentStepIdx === 0}
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-editorial-text/50 hover:text-editorial-text disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3 w-3" /> Back
            </button>

            <button
              onClick={handleNext}
              className="bg-editorial-text text-editorial-bg hover:bg-editorial-accent hover:text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1"
            >
              {currentStepIdx === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next'} <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Elegant Complete Notification Toast */}
      {showNotification && (
        <div className="fixed top-20 right-6 z-50 max-w-sm bg-editorial-bg border-2 border-emerald-600 p-4 shadow-2xl rounded-none animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0" />
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-editorial-text">Onboarding Complete!</h5>
              <p className="text-xs text-editorial-text/70 font-serif italic mt-0.5">
                Excellent! You now know how to launch your storefront and publish products with split payouts. Happy selling!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
