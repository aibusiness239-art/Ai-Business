import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Cow, CowCategory } from '../types';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  ShoppingBag,
  UserCheck,
  ShieldCheck,
  Crown,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit3,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { BD_DISTRICTS, COW_BREEDS } from '../data/mockData';

export const SellerDashboard: React.FC = () => {
  const {
    currentUser,
    cows,
    orders,
    addCow,
    updateCow,
    deleteCow,
    setSubscriptionModalOpen,
    getSellerRemainingListings,
    setSelectedCowId,
    setActivePage,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'cows' | 'add' | 'orders' | 'subscription'>('overview');

  // Form states for adding cow
  const [name, setName] = useState('');
  const [breed, setBreed] = useState(COW_BREEDS[0]);
  const [category, setCategory] = useState<CowCategory>('qurbani');
  const [ageYears, setAgeYears] = useState(3);
  const [ageMonths, setAgeMonths] = useState(0);
  const [gender, setGender] = useState<'ষাঁড়' | 'গাভী' | 'বকনা' | 'দামড়া'>('ষাঁড়');
  const [weightKg, setWeightKg] = useState(550);
  const [heightInch, setHeightInch] = useState(56);
  const [milkProduction, setMilkProduction] = useState(0);
  const [price, setPrice] = useState(250000);
  const [advanceType, setAdvanceType] = useState<'percentage' | 'fixed'>('percentage');
  const [advanceValue, setAdvanceValue] = useState(10);
  const [district, setDistrict] = useState(currentUser?.district || 'পাবনা');
  const [upazila, setUpazila] = useState(currentUser?.upazila || 'চাটমোহর');
  const [address, setAddress] = useState(currentUser?.address || 'গ্রিন ডেইরি ফার্ম');
  const [healthStatus, setHealthStatus] = useState('সম্পূর্ণ সুস্থ, নিয়মিত ডিওয়ার্মিং ও সুষম খাদ্যপ্রাপ্ত');
  const [vaccinations, setVaccinations] = useState<string[]>(['খুরা রোগ (FMD)', 'অ্যানথ্রাক্স (তড়কা)', 'এলএসডি (LSD)']);
  const [feedingHabit, setFeedingHabit] = useState('কাঁচা ঘাস, খড়, ভুসি ও সাইলেজ');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('/images/cow_sahiwal.jpg');
  const [videoUrl, setVideoUrl] = useState('');
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!currentUser) return null;

  // Filter seller's own cows and orders
  const myCows = cows.filter((c) => c.sellerId === currentUser.id);
  const myOrders = orders.filter((o) => o.sellerId === currentUser.id);
  const listingStats = getSellerRemainingListings(currentUser.id);

  const handleAddCowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    const categoryLabels: Record<CowCategory, string> = {
      dairy: 'দুধের গাভী',
      beef: 'মাংসের ষাঁড়',
      qurbani: 'কোরবানি স্পেশাল',
      heifer: 'বকনা বাছুর',
      breeding: 'প্রজনন জাত',
    };

    const res = addCow({
      name,
      breed,
      category,
      categoryLabelBn: categoryLabels[category],
      ageYears,
      ageMonths,
      gender,
      weightKg,
      heightInch,
      milkProductionLitersDaily: category === 'dairy' ? milkProduction : undefined,
      price,
      advanceType,
      advanceValue,
      images: [imageUrl],
      videoUrl: videoUrl || undefined,
      district,
      upazila,
      fullAddress: `${address}, ${upazila}, ${district}`,
      healthStatus,
      vaccinations,
      feedingHabit,
      description: description || `${name} - সুস্থ ও চমৎকার গঠনের গরু।`,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      sellerPhone: currentUser.phone,
      sellerFarmName: currentUser.sellerProfile?.farmName || currentUser.name,
      sellerIsVerified: currentUser.sellerProfile?.isVerified || false,
      isFeatured: false,
    });

    if (res.success) {
      setFormFeedback({ type: 'success', message: res.message });
      setName('');
      setDescription('');
      setTimeout(() => setActiveTab('cows'), 1200);
    } else {
      setFormFeedback({ type: 'error', message: res.message });
    }
  };

  const toggleVaccination = (v: string) => {
    if (vaccinations.includes(v)) {
      setVaccinations(vaccinations.filter((x) => x !== v));
    } else {
      setVaccinations([...vaccinations, v]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Top Banner with Seller Info & Subscription status */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white font-bold text-2xl flex items-center justify-center shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-900">
                {currentUser.sellerProfile?.farmName || currentUser.name}
              </h1>
              {currentUser.sellerProfile?.isVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>ভেরিফাইড খামারি</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <span>ভেরিফিকেশন অপেক্ষমান</span>
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              স্বত্বাধিকারী: {currentUser.name} · মোবাইল: {currentUser.phone} · অবস্থান: {currentUser.district}
            </p>
          </div>
        </div>

        {/* Subscription Status Card */}
        <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-200 flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-emerald-800 font-medium">সক্রিয় সাবস্ক্রিপশন</div>
            <div className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>{listingStats.planName}</span>
            </div>
            <div className="text-xs text-neutral-600 mt-0.5">
              লিস্টিং বাকি: <strong className="text-emerald-800 font-mono">{listingStats.remaining}</strong>/{listingStats.totalAllowed}টি
            </div>
          </div>

          <button
            onClick={() => setSubscriptionModalOpen(true)}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm whitespace-nowrap"
          >
            প্যাকেজ আপগ্রেড
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 mb-6 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'overview' ? 'border-emerald-700 text-emerald-700' : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>ওভারভিউ</span>
        </button>
        <button
          onClick={() => setActiveTab('cows')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'cows' ? 'border-emerald-700 text-emerald-700' : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>আমার গরু তালিকা ({myCows.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'add' ? 'border-emerald-700 text-emerald-700' : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>নতুন গরু যোগ করুন</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'orders' ? 'border-emerald-700 text-emerald-700' : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>প্রাপ্ত অর্ডারসমূহ ({myOrders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('subscription')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'subscription' ? 'border-emerald-700 text-emerald-700' : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>সাবস্ক্রিপশন ও বিলিং</span>
        </button>
      </div>

      {/* TAB 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-neutral-200">
              <div className="text-xs text-neutral-500 font-medium">মোট লিস্টিং</div>
              <div className="text-2xl font-bold font-mono text-neutral-900 mt-1">{myCows.length}টি</div>
              <div className="text-[11px] text-emerald-700 mt-1">সর্বোচ্চ সীমা: {listingStats.totalAllowed}টি</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-200">
              <div className="text-xs text-neutral-500 font-medium">সক্রিয় লাইভ গরু</div>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                {myCows.filter((c) => c.status === 'approved').length}টি
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">মার্কেটপ্লেসে দৃশ্যমান</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-200">
              <div className="text-xs text-neutral-500 font-medium">প্রাপ্ত অর্ডার</div>
              <div className="text-2xl font-bold font-mono text-blue-700 mt-1">{myOrders.length}টি</div>
              <div className="text-[11px] text-blue-600 mt-1">অ্যাডভান্স পেমেন্ট সম্পন্ন</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-200">
              <div className="text-xs text-neutral-500 font-medium">মোট বিক্রয় ও আয়</div>
              <div className="text-2xl font-bold font-mono text-neutral-900 mt-1">
                ৳{(currentUser.sellerProfile?.totalEarnings || 320000).toLocaleString('bn-BD')}
              </div>
              <div className="text-[11px] text-emerald-700 mt-1">১৪+ টি গরু বিক্রিত</div>
            </div>
          </div>

          {/* Quick Action Banner */}
          <div className="p-5 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold">নতুন কোনো গরু বিক্রির জন্য প্রস্তুত আছে?</h3>
              <p className="text-xs text-emerald-200 mt-1">
                ছবি, ভিডিও লিংক ও বিস্তারিত স্বাস্থ্য তথ্য দিয়ে দ্রুত ক্রেতার কাছে পৌঁছে দিন।
              </p>
            </div>
            <button
              onClick={() => setActiveTab('add')}
              className="px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shrink-0 transition-colors shadow-sm"
            >
              + নতুন গরু লিস্টিং করুন
            </button>
          </div>

          {/* Recent Listings Summary */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-900">সাম্প্রতিক লিস্টিং</h3>
              <button onClick={() => setActiveTab('cows')} className="text-xs text-emerald-700 font-semibold hover:underline">
                সবগুলো দেখুন
              </button>
            </div>

            <div className="space-y-3">
              {myCows.slice(0, 3).map((cow) => (
                <div key={cow.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img src={cow.images[0]} alt={cow.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <div className="text-xs font-bold text-neutral-900">{cow.name} ({cow.cowCode})</div>
                      <div className="text-[11px] text-neutral-500">{cow.breed} · ওজন: {cow.weightKg} কেজি</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-neutral-900">৳{cow.price.toLocaleString('bn-BD')}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      cow.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {cow.status === 'approved' ? 'অনুমোদিত' : 'অপেক্ষমান'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: My Cows List */}
      {activeTab === 'cows' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900">আমার সকল গরু ({myCows.length}টি)</h2>
            <button
              onClick={() => setActiveTab('add')}
              className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>গরু যোগ করুন</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-700 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="p-3">গরুর ছবি ও কোড</th>
                  <th className="p-3">জাত ও ক্যাটাগরি</th>
                  <th className="p-3">মূল্য ও অ্যাডভান্স</th>
                  <th className="p-3">ওজন / দুধ</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {myCows.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/50">
                    <td className="p-3 flex items-center gap-2.5">
                      <img src={c.images[0]} alt={c.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <div className="font-bold text-neutral-900">{c.name}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{c.cowCode}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>{c.breed}</div>
                      <div className="text-[11px] text-neutral-400">{c.gender} · {c.ageYears} বছর</div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono font-bold text-neutral-900">৳{c.price.toLocaleString('bn-BD')}</div>
                      <div className="text-[11px] text-emerald-700">অ্যাডভান্স: ৳{c.calculatedAdvanceAmount.toLocaleString('bn-BD')}</div>
                    </td>
                    <td className="p-3 font-mono">
                      {c.weightKg} কেজি
                      {c.milkProductionLitersDaily ? ` · ${c.milkProductionLitersDaily}L` : ''}
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        c.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}>
                        {c.status === 'approved' ? 'অনুমোদিত' : c.status === 'pending' ? 'অনুমোদন পেন্ডিং' : 'বিক্রিত'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => {
                          setSelectedCowId(c.id);
                          setActivePage('cow-details');
                        }}
                        className="p-1.5 text-neutral-600 hover:text-emerald-700 rounded hover:bg-neutral-100"
                        title="দেখুন"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCow(c.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded hover:bg-red-50"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Add Cow Form */}
      {activeTab === 'add' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm max-w-4xl mx-auto">
          <div className="border-b border-neutral-100 pb-4 mb-6">
            <h2 className="text-lg font-bold text-neutral-900">গরুর বিবরণ ও বিক্রয় তথ্য ফরম</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              সবগুলো তথ্য সঠিকভাবে পূরণ করুন যাতে ক্রেতারা সহজে আকৃষ্ট হন।
            </p>
          </div>

          {formFeedback && (
            <div className={`p-4 rounded-xl text-xs mb-6 flex items-center gap-2 ${
              formFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {formFeedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span>{formFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleAddCowSubmit} className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">গরুর নাম বা ডাকনাম:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: লাল বাহাদুর, সুন্দর আলী"
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">গরুর জাত (Breed):</label>
                <select
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {COW_BREEDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">ক্যাটাগরি:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CowCategory)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="qurbani">কোরবানি ও মাংসের ষাঁড়</option>
                  <option value="dairy">উচ্চ উৎপাদনশীল দুধের গাভী</option>
                  <option value="beef">মোটাতাজাকরণ ষাঁড়</option>
                  <option value="breeding">প্রজনন জাত / বকনা</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">লিঙ্গ:</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="ষাঁড়">ষাঁড় (Bull)</option>
                  <option value="গাভী">গাভী (Cow)</option>
                  <option value="বকনা">বকনা (Heifer)</option>
                  <option value="দামড়া">দামড়া (Steer)</option>
                </select>
              </div>
            </div>

            {/* Measurements */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">বয়স (বছর):</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={ageYears}
                  onChange={(e) => setAgeYears(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">বয়স (মাস):</label>
                <input
                  type="number"
                  min={0}
                  max={11}
                  value={ageMonths}
                  onChange={(e) => setAgeMonths(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">লাইভ ওজন (কেজি):</label>
                <input
                  type="number"
                  min={100}
                  max={1500}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">উচ্চতা (ইঞ্চি):</label>
                <input
                  type="number"
                  min={30}
                  max={80}
                  value={heightInch}
                  onChange={(e) => setHeightInch(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Dairy conditional */}
            {category === 'dairy' && (
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
                <label className="block text-xs font-bold text-blue-900 mb-1">
                  দৈনিক দুধ উৎপাদন ক্ষমতা (লিটার):
                </label>
                <input
                  type="number"
                  min={1}
                  max={45}
                  value={milkProduction}
                  onChange={(e) => setMilkProduction(Number(e.target.value))}
                  placeholder="যেমন: ২০ লিটার"
                  className="w-full text-xs p-2.5 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                />
              </div>
            )}

            {/* Price & Advance Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">মোট বিক্রয়মূল্য (টাকা):</label>
                <input
                  type="number"
                  required
                  step={5000}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-base font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">বুকিং অ্যাডভান্স ধরন:</label>
                <select
                  value={advanceType}
                  onChange={(e) => setAdvanceType(e.target.value as any)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="percentage">শতকরা হার (%)</option>
                  <option value="fixed">নির্দিষ্ট টাকা (Fixed Tk)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  অ্যাডভান্স মান ({advanceType === 'percentage' ? '%' : 'টাকা'}):
                </label>
                <input
                  type="number"
                  value={advanceValue}
                  onChange={(e) => setAdvanceValue(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Health & Vaccinations */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-700">প্রদানকৃত ভ্যাকসিন টিকাসমূহ:</label>
              <div className="flex flex-wrap gap-2">
                {['খুরা রোগ (FMD)', 'অ্যানথ্রাক্স (তড়কা)', 'বাদলা (BQ)', 'এলএসডি (LSD)', 'গলাফোলা (HS)'].map((vac) => (
                  <button
                    key={vac}
                    type="button"
                    onClick={() => toggleVaccination(vac)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      vaccinations.includes(vac)
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {vaccinations.includes(vac) ? '✓ ' : '+ '} {vac}
                  </button>
                ))}
              </div>
            </div>

            {/* Image & Video */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">গরুর প্রধান ছবির URL / পাথ:</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/images/cow_sahiwal.jpg বা ছবির অনলাইন লিংক"
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">ভিডিও লিংক (ইউটিউব/ফেসবুক):</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">বিস্তারিত বিবরণ ও খামারের বৈশিষ্ট্য:</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="গরুর খাদ্য অভ্যাস, শান্ত স্বভাব, বাছুরের অবস্থা ইত্যাদি লিখুন..."
                className="w-full text-xs p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-all shadow-md"
            >
              গরু লিস্টিং প্রকাশ করুন
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: Orders Received */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200">
            <h2 className="text-sm font-bold text-neutral-900">ক্রেতাদের বুকিং ও প্রাপ্ত অর্ডার ({myOrders.length}টি)</h2>
          </div>

          <div className="divide-y divide-neutral-100">
            {myOrders.length > 0 ? (
              myOrders.map((ord) => (
                <div key={ord.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={ord.cowImage} alt={ord.cowName} className="w-14 h-14 rounded-xl object-cover" />
                    <div>
                      <div className="font-bold text-neutral-900 text-sm">{ord.cowName} ({ord.cowCode})</div>
                      <div className="text-xs text-neutral-600">
                        ক্রেতা: <strong>{ord.buyerName}</strong> ({ord.buyerPhone})
                      </div>
                      <div className="text-xs text-neutral-500">
                        ঠিকানা: {ord.buyerAddress} · মাধ্যম: {ord.deliveryType === 'home_delivery' ? 'হোম ডেলিভারি' : 'খামার পিকআপ'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col md:items-end gap-1">
                    <div className="text-xs text-emerald-800 font-bold font-mono">
                      অ্যাডভান্স পরিশোধিত: ৳{ord.advanceAmount.toLocaleString('bn-BD')}
                    </div>
                    <div className="text-xs text-neutral-500 font-mono">
                      বাকি টাকা: ৳{ord.remainingAmount.toLocaleString('bn-BD')}
                    </div>
                    <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {ord.orderStatus === 'confirmed' ? 'কনফার্মড' : 'অ্যাডভান্স পেইড'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-neutral-500">
                এখনো কোনো ক্রেতার অর্ডার আসেনি। নতুন গরু লিস্টিং করলে তা ক্রেতাদের কাছে পৌঁছাবে।
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: Subscription Info */}
      {activeTab === 'subscription' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 max-w-2xl mx-auto shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">{listingStats.planName}</h2>
              <p className="text-xs text-neutral-500">মেয়াদ উত্তীর্ণের তারিখ: {currentUser.sellerProfile?.planExpiryDate || '৩০ দিন'}</p>
            </div>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span>মোট অনুমোদিত লিস্টিং:</span>
              <strong className="font-mono">{listingStats.totalAllowed}টি গরু</strong>
            </div>
            <div className="flex justify-between">
              <span>বর্তমানে ব্যবহৃত লিস্টিং:</span>
              <strong className="font-mono">{listingStats.used}টি</strong>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>অবশিষ্ট খালি স্লট:</span>
              <strong className="font-mono">{listingStats.remaining}টি</strong>
            </div>
          </div>

          <button
            onClick={() => setSubscriptionModalOpen(true)}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            অন্যান্য প্রিমিয়াম প্যাকেজ দেখুন ও কিনুন
          </button>
        </div>
      )}

    </div>
  );
};
