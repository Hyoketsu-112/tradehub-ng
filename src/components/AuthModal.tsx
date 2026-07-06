/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { signUpUser, signInUser } from '../lib/db';
import { User as UserType } from '../types';
import { Mail, User as UserIcon, ArrowRight, Check, X, Shield, LayoutDashboard, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserType) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'seller' | 'buyer'>('buyer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email) {
      setError('Please provide a valid email address.');
      setLoading(false);
      return;
    }

    try {
      if (activeTab === 'signup') {
        if (!name) {
          setError('Please provide your full name.');
          setLoading(false);
          return;
        }
        const user = await signUpUser(email, name, role);
        setSuccess(true);
        setTimeout(() => {
          onAuthSuccess(user);
          onClose();
          setSuccess(false);
        }, 1200);
      } else {
        const user = await signInUser(email);
        setSuccess(true);
        setTimeout(() => {
          onAuthSuccess(user);
          onClose();
          setSuccess(false);
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-editorial-text/70 backdrop-blur-xs">
      <div 
        id="auth-modal-card" 
        className="bg-editorial-bg max-w-md w-full border border-editorial-text shadow-2xl flex flex-col relative overflow-hidden"
      >
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 h-12 w-12 bg-editorial-accent/10 rounded-bl-full pointer-events-none"></div>

        {/* Header */}
        <div className="p-6 border-b border-editorial-text/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-editorial-accent">TRADEHUB.NG SECURE GATEWAY</span>
            <h3 className="text-2xl font-serif italic text-editorial-text mt-1">
              {activeTab === 'signin' ? 'Welcome Back' : 'Join Tradehub'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-editorial-text/50 hover:text-editorial-text p-2 font-bold cursor-pointer"
            title="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selectors */}
        <div className="flex border-b border-editorial-text/10 bg-editorial-beige/30">
          <button
            onClick={() => { setActiveTab('signin'); setError(null); }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'signin' ? 'border-editorial-text text-editorial-text bg-editorial-bg' : 'border-transparent text-editorial-text/50 hover:text-editorial-text/80'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setError(null); }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'signup' ? 'border-editorial-text text-editorial-text bg-editorial-bg' : 'border-transparent text-editorial-text/50 hover:text-editorial-text/80'}`}
          >
            Create Account
          </button>
        </div>

        {/* Main Body */}
        {success ? (
          <div className="p-8 text-center space-y-4 py-16">
            <div className="h-16 w-16 bg-emerald-100 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-800 animate-bounce">
              <Check className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-serif italic text-editorial-text">Secure Access Verified</h4>
            <p className="text-xs text-editorial-text/60 leading-relaxed max-w-xs mx-auto">
              Welcome aboard! You have been securely signed into Tradehub. Connecting credentials...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 text-xs text-red-900 leading-relaxed font-sans flex items-start gap-2.5">
                <span className="font-bold flex-shrink-0">⚠️ Error:</span>
                <span>{error}</span>
              </div>
            )}

            {/* Email Field (Always present) */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-editorial-text/70 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-editorial-text/40" />
                <input
                  type="email"
                  required
                  placeholder="e.g. buyer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-editorial-bg border border-editorial-text/20 text-xs focus:outline-none focus:border-editorial-text transition-all text-editorial-text font-mono"
                />
              </div>
              <p className="text-[9px] text-editorial-text/40 italic">We will never share your email with unauthorized parties.</p>
            </div>

            {/* Signup Only Fields */}
            {activeTab === 'signup' && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-editorial-text/70 uppercase tracking-widest">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-editorial-text/40" />
                    <input
                      type="text"
                      required={activeTab === 'signup'}
                      placeholder="e.g. Chinedu Okafor"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-editorial-bg border border-editorial-text/20 text-xs focus:outline-none focus:border-editorial-text transition-all text-editorial-text"
                    />
                  </div>
                </div>

                {/* Role Switcher Selector */}
                <div className="space-y-2 pt-2">
                  <label className="block text-[10px] font-bold text-editorial-text/70 uppercase tracking-widest">Select Account Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('buyer')}
                      className={`p-3 border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${role === 'buyer' ? 'bg-editorial-accent/5 border-editorial-accent text-emerald-950' : 'bg-white border-neutral-200 hover:border-neutral-300 text-editorial-text/70'}`}
                    >
                      <Shield className={`h-4 w-4 ${role === 'buyer' ? 'text-editorial-accent' : 'text-neutral-400'}`} />
                      <div className="mt-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider">Buyer Account</p>
                        <p className="text-[9px] text-editorial-text/50 mt-0.5 font-sans">Track orders & escrow</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('seller')}
                      className={`p-3 border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${role === 'seller' ? 'bg-editorial-accent/5 border-editorial-accent text-emerald-950' : 'bg-white border-neutral-200 hover:border-neutral-300 text-editorial-text/70'}`}
                    >
                      <LayoutDashboard className={`h-4 w-4 ${role === 'seller' ? 'text-editorial-accent' : 'text-neutral-400'}`} />
                      <div className="mt-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider">Seller Console</p>
                        <p className="text-[9px] text-editorial-text/50 mt-0.5 font-sans">List & manage stores</p>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Quick Helper for Sign In */}
            {activeTab === 'signin' && (
              <div className="bg-editorial-beige/40 p-3 border border-editorial-text/10 text-[10px] text-editorial-text/70 italic font-serif leading-relaxed flex gap-2">
                <Sparkles className="h-4 w-4 text-editorial-accent flex-shrink-0" />
                <span>
                  For reviewer comfort, typing your email in <strong>Sign In</strong> will automatically fetch or set up your matching session so you don't have to remember passwords.
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-editorial-text/10">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-editorial-text/50 hover:text-editorial-text uppercase tracking-widest cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="bg-editorial-text hover:bg-editorial-accent text-editorial-bg hover:text-white px-6 py-3 text-xs font-bold uppercase tracking-widest cursor-pointer flex items-center gap-1 border border-editorial-text transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : activeTab === 'signin' ? 'Sign In' : 'Register'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
