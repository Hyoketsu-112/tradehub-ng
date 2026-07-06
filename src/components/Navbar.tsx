/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Store, LayoutDashboard, Search, HelpCircle, User as UserIcon, LogOut } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentView: 'hub' | 'storefront' | 'seller' | 'tracker';
  onNavigate: (view: 'hub' | 'seller' | 'tracker') => void;
  isSandbox: boolean;
  currentUser?: User | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export default function Navbar({ 
  currentView, 
  onNavigate, 
  isSandbox, 
  currentUser, 
  onOpenAuth, 
  onLogout 
}: NavbarProps) {
  return (
    <header id="main-header" className="sticky top-0 z-50 w-full border-b border-editorial-text/10 bg-editorial-bg">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div 
          id="nav-logo-btn"
          className="flex cursor-pointer items-center space-x-2 animate-fade-in" 
          onClick={() => onNavigate('hub')}
        >
          <div>
            <span className="text-2xl font-black tracking-tighter text-editorial-text uppercase">
              TRADEHUB<span className="text-editorial-accent">.</span>NG
            </span>
            {isSandbox && (
              <span className="ml-2 inline-flex items-center border border-editorial-accent/30 bg-editorial-accent/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-editorial-accent">
                Sandbox
              </span>
            )}
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav id="desktop-nav" className="hidden md:flex items-center space-x-6 text-[11px] uppercase tracking-[0.2em] font-bold">
          <button
            id="nav-btn-explore"
            onClick={() => onNavigate('hub')}
            className={`flex items-center space-x-1.5 py-2 transition-colors border-b-2 cursor-pointer ${
              currentView === 'hub'
                ? 'border-editorial-accent text-editorial-text'
                : 'border-transparent text-editorial-text/60 hover:text-editorial-text'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Explore Stores</span>
          </button>
          <button
            id="nav-btn-dashboard"
            onClick={() => onNavigate('seller')}
            className={`flex items-center space-x-1.5 py-2 transition-colors border-b-2 cursor-pointer ${
              currentView === 'seller'
                ? 'border-editorial-accent text-editorial-text'
                : 'border-transparent text-editorial-text/60 hover:text-editorial-text'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Seller Console</span>
          </button>
          <button
            id="nav-btn-escrow"
            onClick={() => onNavigate('tracker')}
            className={`flex items-center space-x-1.5 py-2 transition-colors border-b-2 cursor-pointer ${
              currentView === 'tracker'
                ? 'border-editorial-accent text-editorial-text'
                : 'border-transparent text-editorial-text/60 hover:text-editorial-text'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Buyer Protection & Tracker</span>
          </button>
        </nav>

        {/* Right Info Section */}
        <div id="nav-info-section" className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-2 border border-editorial-text/10 bg-editorial-beige px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-editorial-text/70">
            <span className="h-1.5 w-1.5 bg-editorial-accent animate-pulse"></span>
            <span>Paystack splits (90/10)</span>
          </div>

          {/* User Account State */}
          {currentUser ? (
            <div className="flex items-center space-x-3 bg-editorial-beige/40 border border-editorial-text/10 pl-3 pr-2.5 py-1.5 rounded-xs">
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-bold text-editorial-text max-w-[120px] truncate leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[8px] uppercase tracking-wider text-editorial-text/40 font-mono">
                  {currentUser.role === 'seller' ? 'Seller Console' : 'Buyer Escrow'}
                </span>
              </div>
              
              <div className="h-6 w-6 border border-editorial-text/25 bg-white text-editorial-text flex items-center justify-center font-bold text-xs uppercase font-mono">
                {currentUser.name.charAt(0)}
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 text-editorial-text/40 hover:text-red-600 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 bg-editorial-text hover:bg-editorial-accent text-editorial-bg hover:text-white transition-all text-[9px] font-bold uppercase tracking-widest border border-editorial-text cursor-pointer"
            >
              Sign In
            </button>
          )}
          
          <a
            href="#faq"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('tracker');
            }}
            className="p-2 text-editorial-text/50 hover:text-editorial-text transition-colors"
            title="How it works"
          >
            <HelpCircle className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div id="mobile-nav" className="flex md:hidden border-t border-editorial-text/10 bg-editorial-bg justify-around py-2.5 text-[10px] uppercase tracking-wider font-bold">
        <button
          id="mob-btn-explore"
          onClick={() => onNavigate('hub')}
          className={`flex flex-col items-center justify-center space-y-1 py-1 w-full cursor-pointer ${
            currentView === 'hub' ? 'text-editorial-accent' : 'text-editorial-text/50'
          }`}
        >
          <Search className="h-4 w-4" />
          <span>Explore</span>
        </button>
        <button
          id="mob-btn-seller"
          onClick={() => onNavigate('seller')}
          className={`flex flex-col items-center justify-center space-y-1 py-1 w-full cursor-pointer ${
            currentView === 'seller' ? 'text-editorial-accent' : 'text-editorial-text/50'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Seller</span>
        </button>
        <button
          id="mob-btn-tracker"
          onClick={() => onNavigate('tracker')}
          className={`flex flex-col items-center justify-center space-y-1 py-1 w-full cursor-pointer ${
            currentView === 'tracker' ? 'text-editorial-accent' : 'text-editorial-text/50'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Protection</span>
        </button>
      </div>
    </header>
  );
}
