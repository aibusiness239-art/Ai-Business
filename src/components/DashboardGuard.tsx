import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Lock, UserCheck, ArrowRight, Home, ShieldCheck } from 'lucide-react';

interface DashboardGuardProps {
  requiredRole?: 'buyer' | 'seller' | 'admin';
  children: React.ReactNode;
}

export const DashboardGuard: React.FC<DashboardGuardProps> = ({ requiredRole, children }) => {
  const { currentUser, setAuthModalOpen, setActivePage } = useApp();

  // 1. If not logged in at all: Show strict authentication required screen
  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto my-12 px-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden p-8 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-semibold">
              🔒 সুরক্ষিত সেশন নিশ্চিতকরণ
            </span>
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
              লগইন বা রেজিস্ট্রেশন আবশ্যক
            </h2>
            <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
              ব্যক্তিগত ও বাণিজ্যিক তথ্যের সুরক্ষার্থে ড্যাশবোর্ডে প্রবেশ করতে অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন।
            </p>
          </div>

          {/* Privacy & Isolation Notice */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-left space-y-2 text-xs text-emerald-900">
            <div className="font-bold flex items-center gap-1.5 text-emerald-950">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ইউজার অ্যাকাউন্ট আইসোলেশন ও ডেটা নিরাপত্তা:</span>
            </div>
            <ul className="space-y-1 text-emerald-800 list-disc list-inside">
              <li>একজনের অ্যাকাউন্ট বা ড্যাশবোর্ডে অন্য কোনো ব্যবহারকারী প্রবেশ করতে পারবে না।</li>
              <li>লগইন ছাড়া অর্ডার হিস্টোরি, বুকিং রশিদ ও খামার ব্যবস্থাপনা দেখা যাবে না।</li>
              <li>নতুন ব্যবহারকারী হলে এখনই ১ মিনিটে বিনামূল্যে অ্যাকাউন্ট তৈরি করুন।</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>অ্যাকাউন্টে লগইন করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActivePage('home')}
              className="w-full sm:w-auto px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Home className="w-4 h-4" />
              <span>হোমপেজে ফিরে যান</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Admin Route Protection: If required role is admin and user is not admin
  if (requiredRole === 'admin') {
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';
    if (!isAdmin) {
      return (
        <div className="max-w-xl mx-auto my-14 px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-red-200 shadow-xl p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-neutral-900">অননুমোদিত প্রবেশ (Access Denied)</h2>
              <p className="text-xs text-neutral-600 leading-relaxed">
                অ্যাডমিন ড্যাশবোর্ড শুধুমাত্র অনুমোদিত কেন্দ্রীয় অ্যাডমিনের জন্য সংরক্ষিত। আপনি বর্তমানে <strong>{currentUser.name}</strong> ({currentUser.role}) হিসেবে লগইন আছেন।
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setActivePage('admin-login')}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                অ্যাডমিন সিকিউর লগইন পেজে যান
              </button>
              <button
                onClick={() => setActivePage('home')}
                className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs rounded-xl transition-colors"
              >
                হোমে ফিরে যান
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // 3. Seller Route Protection: If required role is seller and user is regular buyer
  if (requiredRole === 'seller') {
    const isSeller = currentUser.role === 'seller' || currentUser.role === 'super_admin' || currentUser.role === 'admin';
    if (!isSeller) {
      return (
        <div className="max-w-xl mx-auto my-14 px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-amber-200 shadow-xl p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
              <UserCheck className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-neutral-900">খামারি একাউন্ট আবশ্যক</h2>
              <p className="text-xs text-neutral-600 leading-relaxed">
                গরু বিক্রয়, লিস্টিং ও খামার পরিচালনা করতে খামারি একাউন্ট প্রয়োজন। আপনি বর্তমানে সাধারণ ক্রেতা একাউন্টে লগইন আছেন।
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 text-left">
              💡 <strong>প্রথম ১টি গরু লিস্টিং সম্পূর্ণ ফ্রি!</strong> নতুন খামারি হিসেবে রেজিস্ট্রেশন করলে তাৎক্ষণিক বিনামূল্যে গরু লিস্টিং করতে পারবেন।
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                খামারি একাউন্ট তৈরি করুন
              </button>
              <button
                onClick={() => setActivePage('buyer-dashboard')}
                className="w-full sm:w-auto px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs rounded-xl transition-colors"
              >
                ক্রেতা ড্যাশবোর্ডে যান
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Authorized user
  return <>{children}</>;
};
