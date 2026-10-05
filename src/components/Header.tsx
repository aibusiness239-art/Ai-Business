import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Heart,
  User,
  ShieldCheck,
  PlusCircle,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Sparkles,
  PhoneCall,
  Home as HomeIcon,
  Store,
  Crown,
  Lock,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    logout,
    activePage,
    setActivePage,
    setSelectedCowId,
    setAuthModalOpen,
    wishlist,
    settings,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navigateTo = (page: string) => {
    setActivePage(page);
    setSelectedCowId(null);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSellCowClick = () => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    if (currentUser.role === 'buyer') {
      navigateTo('seller-dashboard');
    } else if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
      navigateTo('admin-dashboard');
    } else {
      navigateTo('seller-dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs">
      {/* Top micro announcement bar */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4 border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="bg-emerald-700 text-white px-2 py-0.5 rounded text-[11px] font-bold shrink-0">
              বিজ্ঞপ্তি
            </span>
            <span className="truncate text-[11px] sm:text-xs text-emerald-200">
              {settings.announcementText}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 shrink-0 text-emerald-300 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>হটলাইন: <strong className="text-white font-mono">{settings.hotline}</strong></span>
            </div>
            <span>·</span>
            <span className="text-emerald-200">১০০% নিরাপদ এসক্রো বুকিং অ্যাডভান্স</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-2 lg:gap-4">
          
          {/* Zone 1: Single Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigateTo('home')}
              className="text-left group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold text-xl shadow-sm shadow-emerald-900/20 group-hover:bg-emerald-800 transition-colors shrink-0">
                গ
              </div>
              <div className="shrink-0">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-1.5 whitespace-nowrap">
                  গরু বাজার
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
                </span>
                <span className="text-[11px] hidden xl:block text-neutral-500 font-medium whitespace-nowrap leading-none mt-0.5">
                  বাংলাদেশের নিরাপদ ক্যাটল মার্কেট
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Desktop Navigation Links (Zero wrapping, elegant pill states) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
            <button
              onClick={() => navigateTo('home')}
              className={`px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activePage === 'home'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-2xs font-bold'
                  : 'text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100/80 border border-transparent'
              }`}
            >
              <HomeIcon className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-emerald-600 shrink-0" />
              <span>হোম</span>
            </button>

            <button
              onClick={() => navigateTo('marketplace')}
              className={`px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activePage === 'marketplace'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-2xs font-bold'
                  : 'text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100/80 border border-transparent'
              }`}
            >
              <Store className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-emerald-600 shrink-0" />
              <span>সকল গরু</span>
            </button>

            <button
              onClick={() => navigateTo('packages')}
              className={`px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activePage === 'packages'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-2xs font-bold'
                  : 'text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100/80 border border-transparent'
              }`}
            >
              <Crown className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-amber-500 shrink-0" />
              <span>খামারি প্যাকেজ</span>
            </button>

            <button
              onClick={() => navigateTo('safety')}
              className={`px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activePage === 'safety'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-2xs font-bold'
                  : 'text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100/80 border border-transparent'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-blue-600 shrink-0" />
              <span>নিরাপত্তা ও নিয়ম</span>
            </button>

            {currentUser && (
              <button
                onClick={() => {
                  if (currentUser.role.includes('admin')) navigateTo('admin-dashboard');
                  else if (currentUser.role === 'seller') navigateTo('seller-dashboard');
                  else navigateTo('buyer-dashboard');
                }}
                className={`px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activePage.includes('dashboard')
                    ? 'bg-emerald-700 text-white shadow-sm font-bold'
                    : 'bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100/90 border border-emerald-200/80'
                }`}
              >
                <LayoutDashboard className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 ${activePage.includes('dashboard') ? 'text-white' : 'text-emerald-700'}`} />
                <span>
                  {currentUser.role.includes('admin')
                    ? 'অ্যাডমিন ড্যাশবোর্ড'
                    : currentUser.role === 'seller'
                    ? 'খামারি ড্যাশবোর্ড'
                    : 'আমার অর্ডার'}
                </span>
              </button>
            )}
          </nav>

          {/* Zone 3: Primary Actions & User Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Wishlist Icon Button */}
            <button
              onClick={() => navigateTo('marketplace')}
              className="relative p-2 text-neutral-600 hover:text-emerald-700 rounded-xl hover:bg-emerald-50 transition-colors shrink-0"
              title="পছন্দের তালিকা"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Sell Cow Button */}
            <button
              onClick={handleSellCowClick}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 xl:px-3.5 xl:py-2 text-xs xl:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs hover:shadow transition-all whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>গরু বিক্রি করুন</span>
            </button>

            {/* User Account / Profile Menu */}
            <div className="relative shrink-0">
              {currentUser ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 p-1.5 pr-2 sm:pr-2.5 rounded-xl border border-neutral-200 hover:border-emerald-300 hover:bg-neutral-50 transition-all text-left shrink-0 bg-white"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm flex items-center justify-center border border-emerald-300 shrink-0">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="hidden sm:block max-w-[95px] xl:max-w-[125px] text-xs">
                      <div className="font-bold text-neutral-900 truncate leading-tight">
                        {currentUser.name}
                      </div>
                      <div className="text-neutral-500 text-[10px] truncate leading-tight mt-0.5">
                        {currentUser.role === 'super_admin'
                          ? 'সুপার অ্যাডমিন'
                          : currentUser.role === 'admin'
                          ? 'অ্যাডমিন'
                          : currentUser.role === 'seller'
                          ? 'খামারি (Seller)'
                          : 'ক্রেতা (Buyer)'}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-neutral-100">
                        <div className="text-[11px] text-neutral-400 font-medium">লগইন রয়েছেন:</div>
                        <div className="text-sm font-bold text-neutral-900 truncate mt-0.5">{currentUser.name}</div>
                        <div className="text-xs text-neutral-500 truncate font-mono mt-0.5">
                          {currentUser.phone || currentUser.email}
                        </div>
                        <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {currentUser.role === 'super_admin'
                            ? 'সুপার অ্যাডমিন'
                            : currentUser.role === 'seller'
                            ? 'যাচাইকৃত খামারি'
                            : 'নিবন্ধিত ক্রেতা'}
                        </span>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            if (currentUser.role.includes('admin')) navigateTo('admin-dashboard');
                            else if (currentUser.role === 'seller') navigateTo('seller-dashboard');
                            else navigateTo('buyer-dashboard');
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold text-neutral-800 hover:bg-neutral-50 flex items-center gap-2"
                        >
                          <LayoutDashboard className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            {currentUser.role.includes('admin')
                              ? 'অ্যাডমিন ড্যাশবোর্ড'
                              : currentUser.role === 'seller'
                              ? 'খামারি ড্যাশবোর্ড'
                              : 'আমার অর্ডার ও প্রোফাইল'}
                          </span>
                        </button>
                      </div>

                      <div className="border-t border-neutral-100 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            navigateTo('home');
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <span>লগআউট করুন</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs xl:text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors whitespace-nowrap shrink-0"
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span>লগইন / রেজিস্টার</span>
                </button>
              )}
            </div>

            {/* Mobile Hamburger toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-neutral-700 hover:bg-neutral-100 focus:outline-none shrink-0"
              aria-label="Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu (Responsive for Small Screens & Tablets) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-200 px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-150">
          
          {/* User Status Card in Mobile Menu */}
          {currentUser ? (
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-neutral-900 truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-neutral-500 font-mono truncate">{currentUser.phone || currentUser.email}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigateTo('home');
                }}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                title="লগআউট"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-emerald-950">আপনার অ্যাকাউন্টে লগইন নেই</div>
                <div className="text-[10px] text-emerald-700">গরু কিনতে বা বিক্রি করতে লগইন করুন</div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalOpen(true);
                }}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs shrink-0"
              >
                লগইন / রেজিস্টার
              </button>
            </div>
          )}

          {/* Navigation Links in Mobile */}
          <nav className="flex flex-col space-y-1 text-sm font-semibold">
            <button
              onClick={() => navigateTo('home')}
              className={`text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors ${
                activePage === 'home'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <HomeIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>হোম</span>
            </button>

            <button
              onClick={() => navigateTo('marketplace')}
              className={`text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors ${
                activePage === 'marketplace'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <Store className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>সকল গরু (মার্কেটপ্লেস)</span>
            </button>

            <button
              onClick={() => navigateTo('packages')}
              className={`text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors ${
                activePage === 'packages'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-500 shrink-0" />
              <span>খামারি সাবস্ক্রিপশন প্যাকেজ</span>
            </button>

            <button
              onClick={() => navigateTo('safety')}
              className={`text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors ${
                activePage === 'safety'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>নিরাপত্তা ও নিয়মাবলী</span>
            </button>

            {currentUser && (
              <button
                onClick={() => {
                  if (currentUser.role.includes('admin')) navigateTo('admin-dashboard');
                  else if (currentUser.role === 'seller') navigateTo('seller-dashboard');
                  else navigateTo('buyer-dashboard');
                }}
                className={`text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors ${
                  activePage.includes('dashboard')
                    ? 'bg-emerald-700 text-white font-bold'
                    : 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                }`}
              >
                <LayoutDashboard className={`w-4 h-4 shrink-0 ${activePage.includes('dashboard') ? 'text-white' : 'text-emerald-700'}`} />
                <span>
                  {currentUser.role.includes('admin')
                    ? 'অ্যাডমিন ড্যাশবোর্ড'
                    : currentUser.role === 'seller'
                    ? 'খামারি ড্যাশবোর্ড'
                    : 'আমার অর্ডার ও বুকিং'}
                </span>
              </button>
            )}
          </nav>

          {/* Action CTAs in Mobile */}
          <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2">
            <button
              onClick={handleSellCowClick}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs text-xs"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>গরু বিক্রি করুন (নতুন লিস্টিং)</span>
            </button>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-600 text-xs flex items-center justify-between">
              <span>জরুরি সেবা ও হটলাইন:</span>
              <a href={`tel:${settings.hotline}`} className="font-bold text-emerald-700 flex items-center gap-1 font-mono">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>{settings.hotline}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
