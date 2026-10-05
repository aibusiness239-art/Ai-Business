import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, ArrowRight, Home, AlertCircle, CheckCircle2, User } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { loginUser, setActivePage, settings } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username.trim()) {
      setErrorMessage('অ্যাডমিন ইউজারনেম প্রদান করুন।');
      return;
    }
    if (!password) {
      setErrorMessage('অ্যাডমিন পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = loginUser(username.trim(), password);
      setIsLoading(false);

      if (res.success && res.user && (res.user.role === 'admin' || res.user.role === 'super_admin')) {
        setSuccessMessage('সিকিউর অ্যাডমিন অথেন্টিকেশন সফল! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
        setTimeout(() => {
          setActivePage('admin-dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 600);
      } else if (res.success && res.user) {
        setErrorMessage('এই একাউন্টটি অ্যাডমিন অনুমোদিত নয়। সাধারণ ব্যবহারকারীর জন্য মূল সাইট ব্যবহার করুন।');
      } else {
        setErrorMessage(res.message || 'ইউজারনেম অথবা পাসওয়ার্ড ভুল হয়েছে।');
      }
    }, 400);
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-900 text-white animate-in fade-in duration-200">
      <div className="max-w-md w-full space-y-6">
        
        {/* Portal Branding */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50 border border-emerald-500/30">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.siteName} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <span>{settings.logoText || 'গ'}</span>
            )}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>নিরাপদ অ্যাডমিন কন্ট্রোল গেটওয়ে</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight mt-2 text-white">
              {settings.siteName} অ্যাডমিন পোর্টাল
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              শুধুমাত্র অনুমোদিত কেন্দ্রীয় প্রশাসকদের প্রবেশের জন্য সংরক্ষিত
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-neutral-950 rounded-3xl p-8 border border-neutral-800 shadow-2xl space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1.5">
                অ্যাডমিন ইউজারনেম (Username):
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="আপনার অ্যাডমিন ইউজারনেম লিখুন"
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <User className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1.5">
                অ্যাডমিন পাসওয়ার্ড (Password):
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="আপনার গোপন পাসওয়ার্ড দিন"
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950 mt-2"
            >
              {isLoading ? (
                <span>লগইন যাচাই হচ্ছে...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করুন</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-neutral-800">
            <button
              onClick={() => setActivePage('home')}
              className="text-xs text-neutral-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>মূল ওয়েবসাইটে ফিরে যান</span>
            </button>
          </div>
        </div>

        {/* Security watermark */}
        <div className="text-center text-[11px] text-neutral-500">
          🔒 এন্ড-টু-এন্ড এনক্রিপ্টেড সেশন · আইপি ও এক্টিভিটি অডিট ট্র্যাকিং সক্রিয়
        </div>
      </div>
    </div>
  );
};
