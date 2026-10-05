import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { X, Lock, AlertCircle, CheckCircle2, User, ArrowRight, Info, ShieldCheck } from 'lucide-react';
import { BD_DISTRICTS } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: Role;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialRole = 'buyer' }) => {
  const { loginUser, registerUser } = useApp();

  // Two tabs only: user login and registration (Admin has its own dedicated secure page)
  const [activeTab, setActiveTab] = useState<'user_login' | 'register'>('user_login');
  
  // Login form fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Registration form fields
  const [regRole, setRegRole] = useState<Role>(initialRole === 'seller' ? 'seller' : 'buyer');
  const [name, setName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [farmName, setFarmName] = useState('');
  const [district, setDistrict] = useState('পাবনা');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  // Handle User Login
  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!identifier.trim()) {
      setErrorMessage('অনুগ্রহ করে মোবাইল নম্বর অথবা ইমেইল প্রদান করুন।');
      return;
    }
    if (!password) {
      setErrorMessage('অনুগ্রহ করে আপনার অ্যাকাউন্টের পাসওয়ার্ড দিন।');
      return;
    }

    const res = loginUser(identifier, password);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        onClose();
      }, 500);
    } else {
      setErrorMessage(res.message);
    }
  };

  // Handle Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('আপনার পূর্ণ নাম লিখুন।');
      return;
    }
    if (!regPhone.trim() || regPhone.length < 11) {
      setErrorMessage('সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (যেমন: ০১৭XXXXXXXX)।');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('পাসওয়ার্ড দুটি হুবহু এক হতে হবে।');
      return;
    }
    if (regRole === 'seller' && !farmName.trim()) {
      setErrorMessage('খামারির জন্য খামারের নাম প্রদান করা আবশ্যক।');
      return;
    }

    const res = registerUser({
      name: name.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: regRole,
      district,
      upazila: 'সদর',
      address: `${district} সদর`,
      farmName: regRole === 'seller' ? farmName.trim() : undefined,
    });

    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-neutral-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white font-bold flex items-center justify-center text-lg shadow-sm">
              গ
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">গরু বাজার অ্যাকাউন্ট</h2>
              <p className="text-xs text-neutral-500">নিরাপদ গবাদিপশু মার্কেটপ্লেসে স্বাগতম</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean 2 Tabs Switcher: User Login vs Register */}
        <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('user_login');
              setErrorMessage('');
            }}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === 'user_login'
                ? 'bg-white text-emerald-800 shadow-sm font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            ইউজার লগইন
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
            }}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === 'register'
                ? 'bg-white text-emerald-800 shadow-sm font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            নতুন রেজিস্ট্রেশন
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: REGULAR USER LOGIN (BUYER / SELLER) */}
        {activeTab === 'user_login' && (
          <form onSubmit={handleUserLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                মোবাইল নম্বর অথবা ইমেইল:
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="যেমন: ০১৭১২-৩৪৫৬৭৮ বা user@email.com"
                className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                আপনার পাসওয়ার্ড:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="আপনার গোপন পাসওয়ার্ড দিন"
                  className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <span>লগইন করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Credential guide hint */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
              <div className="font-semibold text-neutral-800 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                <span>ডেমো ইউজার একাউন্ট তথ্য:</span>
              </div>
              <div>• খামারি (Seller): <code>০১৭১২-৩৪৫৬৭৮</code> | পাসওয়ার্ড: <code>seller12345</code></div>
              <div>• ক্রেতা (Buyer): <code>০১৭৯৯-৮৮৭৭৬৬</code> | পাসওয়ার্ড: <code>buyer12345</code></div>
            </div>
          </form>
        )}

        {/* TAB 2: REGISTRATION (BUYER / SELLER) */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                অ্যাকাউন্টের ধরন নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setRegRole('buyer')}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    regRole === 'buyer'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-600'
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>আমি ক্রেতা</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('seller')}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    regRole === 'seller'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-600'
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>আমি খামারি (বিক্রেতা)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                আপনার পূর্ণ নাম:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: হাজী রফিকুল ইসলাম"
                className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {regRole === 'seller' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  খামারের নাম (Dairy/Agro Farm Name):
                </label>
                <input
                  type="text"
                  required
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="যেমন: গ্রিন ডেইরি অ্যান্ড ক্যাটল ফার্ম"
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  মোবাইল নম্বর:
                </label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="০১৭১২-XXXXXX"
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  জেলা:
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {BD_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                ইমেইল ঠিকানা (ঐচ্ছিক):
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="agrofarm@email.com"
                className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  পাসওয়ার্ড:
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  পাসওয়ার্ড নিশ্চিতকরণ:
                </label>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="পুনরায় পাসওয়ার্ড দিন"
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md mt-2"
            >
              <span>রেজিস্ট্রেশন সম্পূর্ণ করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
