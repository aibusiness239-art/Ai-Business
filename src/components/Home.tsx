import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CowCard } from './CowCard';
import { FALLBACK_HERO_SVG } from '../utils/imageFallback';
import {
  Search,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Truck,
  PhoneCall,
  Crown,
  HelpCircle,
  ChevronRight,
  Heart,
  PlusCircle,
} from 'lucide-react';
import { BD_DISTRICTS } from '../data/mockData';

export const Home: React.FC = () => {
  const { cows, settings, setActivePage, setSelectedCowId, setSubscriptionModalOpen, setAuthModalOpen, currentUser } = useApp();

  const [heroSearch, setHeroSearch] = useState('');
  const [heroDistrict, setHeroDistrict] = useState('all');

  const featuredCows = cows.filter((c) => c.isFeatured && c.status === 'approved').slice(0, 6);
  const latestCows = cows.filter((c) => c.status === 'approved').slice(0, 6);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActivePage('marketplace');
  };

  const handleSellClick = () => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setActivePage('seller-dashboard');
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-300">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-neutral-900 text-white overflow-hidden">
        {/* Background Image with Scrim Overlay */}
        <div className="absolute inset-0">
          <img
            src="/images/hero_farm.jpg"
            alt="Bangladeshi Cattle Farm"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-35"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              if (el.src !== FALLBACK_HERO_SVG) {
                el.src = FALLBACK_HERO_SVG;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl space-y-6">
            
            {/* Editorial Kicker */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/80">
              <Sparkles className="w-3.5 h-3.5" />
              <span>বাংলাদেশের ১ নম্বর ডিজিটাল গবাদিপশু মার্কেটপ্লেস</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              আপনার পছন্দের গরু <br className="hidden sm:inline" />
              <span className="text-emerald-400">খুঁজে নিন সহজেই</span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl">
              পাবনা, সিরাজগঞ্জ, বগুড়া ও সারা দেশের বিশ্বস্ত খামারিদের যাচাইকৃত উচ্চ উৎপাদনশীল দুধের গাভী, ষাঁড় ও কোরবানির পশু কিনুন ঘরে বসেই। নিরাপদ বুকিং অ্যাডভান্স পেমেন্ট।
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActivePage('marketplace')}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-950 flex items-center gap-2"
              >
                <span>গরু দেখুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleSellClick}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>গরু বিক্রি করুন (১ম লিস্টিং ফ্রি)</span>
              </button>
            </div>

            {/* Hero Quick Search Box */}
            <form
              onSubmit={handleHeroSearch}
              className="mt-8 p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl text-neutral-900 grid grid-cols-1 sm:grid-cols-12 gap-2"
            >
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="জাত, জাতের নাম বা গরুর নাম..."
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50 border border-neutral-200"
                />
              </div>

              <div className="sm:col-span-4 relative">
                <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={heroDistrict}
                  onChange={(e) => setHeroDistrict(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50 border border-neutral-200"
                >
                  <option value="all">সমগ্র বাংলাদেশ</option>
                  {BD_DISTRICTS.slice(0, 10).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full h-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <span>খুঁজুন</span>
                </button>
              </div>
            </form>

          </div>
        </div>

        {/* Quiet Trust Bar */}
        <div className="border-t border-white/10 bg-neutral-950/60 backdrop-blur-md py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>১০০% নিরাপদ বুকিং অ্যাডভান্স</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>যাচাইকৃত খামারি ও পশু</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>নিজস্ব বা ট্রাক ডেলিভারি নিশ্চয়তা</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>২৪/৭ হেল্পলাইন সহায়তা</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">জনপ্রিয় ক্যাটাগরি</h2>
            <p className="text-xs text-neutral-500 mt-1">আপনার প্রয়োজন অনুযায়ী সঠিক ক্যাটাগরি নির্বাচন করুন</p>
          </div>
          <button
            onClick={() => setActivePage('marketplace')}
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>সবগুলো দেখুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              title: 'দুধের গাভী',
              desc: 'দৈনিক ১৫-৩০ লিটার দুধের ফ্রিজিয়ান ও শাহীওয়াল',
              img: '/images/cow_friesian.jpg',
              count: '২৪+ টি গাভী',
            },
            {
              title: 'কোরবানি ও মাংস',
              desc: 'প্রাকৃতিক খাদ্যে মোটাতাজা দানবীয় ষাঁড়',
              img: '/images/cow_sahiwal.jpg',
              count: '৪৫+ টি ষাঁড়',
            },
            {
              title: 'আমেরিকান ব্রাহমা',
              desc: 'আকর্ষণীয় চুঁড়া ও ভারী গঠনের প্রিমিয়াম বুল',
              img: '/images/cow_brahman.jpg',
              count: '১৮+ টি ষাঁড়',
            },
            {
              title: 'উন্নত ব্রিডিং বকনা',
              desc: 'রেড চিটাগাং ও দেশি প্রজননক্ষম বকনা',
              img: '/images/hero_farm.jpg',
              count: '১২+ টি বকনা',
            },
          ].map((cat, i) => (
            <div
              key={i}
              onClick={() => setActivePage('marketplace')}
              className="group cursor-pointer rounded-2xl border border-neutral-200 bg-white overflow-hidden hover:border-emerald-500 hover:shadow-md transition-all flex flex-col"
            >
              <div className="aspect-[4/3] bg-neutral-100 overflow-hidden relative">
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2 left-2 text-[10px] font-semibold bg-neutral-900/80 text-white px-2 py-0.5 rounded">
                  {cat.count}
                </span>
              </div>
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 group-hover:text-emerald-700 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">{cat.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED COWS COLLECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>বিশেষ বাছাইকৃত</span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">ফিচার্ড গরু কালেকশন</h2>
            <p className="text-xs text-neutral-500 mt-1">সরাসরি শীর্ষ খামারিদের সেরা স্বাস্থ্যের গরু</p>
          </div>
          <button
            onClick={() => setActivePage('marketplace')}
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>সব দেখুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCows.map((cow) => (
            <CowCard key={cow.id} cow={cow} />
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS & BUYER SAFETY */}
      <section className="bg-emerald-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight">কীভাবে গরু কিনবেন?</h2>
            <p className="text-xs text-emerald-300 mt-1.5">৩টি সহজ ও নিরাপদ ধাপে ঘরে বসেই আপনার পছন্দের পশু সংগ্রহ করুন</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            
            <div className="p-6 bg-emerald-900/60 rounded-2xl border border-emerald-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mx-auto md:mx-0">
                ০১
              </div>
              <h3 className="text-base font-bold">গরু পছন্দ ও যাচাই করুন</h3>
              <p className="text-xs text-emerald-200 leading-relaxed">
                ছবি, ভিডিও এবং বিস্তারিত স্বাস্থ্য ও টিকাদান রিপোর্ট দেখে খামারির সাথে আলোচনা করুন।
              </p>
            </div>

            <div className="p-6 bg-emerald-900/60 rounded-2xl border border-emerald-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mx-auto md:mx-0">
                ০২
              </div>
              <h3 className="text-base font-bold">নিরাপদ বুকিং অ্যাডভান্স দিন</h3>
              <p className="text-xs text-emerald-200 leading-relaxed">
                বিকাশ, নগদ বা ব্যাংক একাউন্ট থেকে নির্ধারিত বুকিং অ্যাডভান্স পরিশোধ করে অর্ডার নিশ্চিত করুন।
              </p>
            </div>

            <div className="p-6 bg-emerald-900/60 rounded-2xl border border-emerald-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mx-auto md:mx-0">
                ০৩
              </div>
              <h3 className="text-base font-bold">গরু বুঝে নিয়ে বাকি টাকা দিন</h3>
              <p className="text-xs text-emerald-200 leading-relaxed">
                খামার থেকে পিকআপ করুন অথবা হোম ডেলিভারিতে স্বাস্থ্য পরীক্ষা করে বাকি মূল্য পরিশোধ করুন।
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. LATEST LISTINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">নতুন সংযুক্ত গরু</h2>
            <p className="text-xs text-neutral-500 mt-1">আজকের নতুন খামারির লিস্টিং যাচাই করুন</p>
          </div>
          <button
            onClick={() => setActivePage('marketplace')}
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>মার্কেটপ্লেস দেখুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestCows.map((cow) => (
            <CowCard key={cow.id} cow={cow} />
          ))}
        </div>
      </section>

      {/* 6. SELLER SUBSCRIPTION PROMOTION STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-3xl shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-emerald-900 px-3 py-1 rounded-full border border-amber-400/30">
              <Crown className="w-3.5 h-3.5" />
              <span>খামারিদের জন্য বিশেষ সুযোগ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              প্রথম ১টি গরু লিস্টিং সম্পূর্ণ বিনামূল্যে!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
              আপনার খামারের গাভী বা ষাঁড় বিক্রি করতে এখনি রেজিস্ট্রেশন করুন। কোনো ফি ছাড়াই ৩০ দিনের জন্য ১ম গরুর বিজ্ঞাপন দিন। এরপর সহজ সাবস্ক্রিপশন প্যাকেজের মাধ্যমে আরও বেশি বিক্রি করুন।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => setSubscriptionModalOpen(true)}
              className="px-6 py-3 bg-white text-emerald-950 hover:bg-neutral-100 font-bold text-xs rounded-xl shadow transition-colors"
            >
              প্যাকেজসমূহ দেখুন
            </button>
            <button
              onClick={handleSellClick}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl border border-emerald-500 transition-colors"
            >
              বিনামূল্যে খামারি একাউন্ট খুলুন
            </button>
          </div>
        </div>
      </section>

      {/* 7. VERIFIED SELLERS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">শীর্ষ যাচাইকৃত খামারসমূহ</h2>
          <p className="text-xs text-neutral-500 mt-1">যাদের সততা ও সুস্থ পশুর সুনাম দীর্ঘদিনের</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              farm: 'গ্রিন ডেইরি অ্যান্ড অ্যাগ্রো ফার্ম',
              owner: 'হাজী রফিকুল ইসলাম',
              loc: 'চাটমোহর, পাবনা',
              badge: 'ভেরিফাইড খামারি',
              sales: '১৪+ গরু বিক্রিত',
              rating: '৫.০ ★★★★★',
            },
            {
              farm: 'মিল্ক ভিলেজ ক্যাটল রেঞ্জ',
              owner: 'মো: আব্দুল করিম',
              loc: 'শাহজাদপুর, সিরাজগঞ্জ',
              badge: 'ভেরিফাইড খামারি',
              sales: '২২+ গরু বিক্রিত',
              rating: '৪.৯ ★★★★★',
            },
            {
              farm: 'আল-বারাকাহ ব্রিডিং ফার্ম',
              owner: 'ইঞ্জি: মেহরাব হোসেন',
              loc: 'শেরপুর, বগুড়া',
              badge: 'ভেরিফাইড খামারি',
              sales: '১২+ গরু বিক্রিত',
              rating: '৫.০ ★★★★★',
            },
          ].map((seller, i) => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-base flex items-center justify-center">
                  {seller.farm.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-1">
                    <span>{seller.farm}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  </h3>
                  <div className="text-xs text-neutral-500">{seller.owner}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 text-xs text-neutral-600 space-y-1">
                <div className="flex justify-between">
                  <span>অবস্থান:</span>
                  <strong className="text-neutral-900">{seller.loc}</strong>
                </div>
                <div className="flex justify-between">
                  <span>সাফল্য:</span>
                  <strong className="text-emerald-700">{seller.sales}</strong>
                </div>
                <div className="flex justify-between">
                  <span>সুনাম রেটিং:</span>
                  <strong className="text-amber-600">{seller.rating}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">সাধারণ জিজ্ঞাসা (FAQ)</h2>
          <p className="text-xs text-neutral-500 mt-1">গরু কেনাবেচা ও পেমেন্ট সংক্রান্ত তথ্য</p>
        </div>

        <div className="space-y-3 text-xs">
          {[
            {
              q: 'বুকিং অ্যাডভান্স পেমেন্ট কেন দিতে হয় এবং এটি কতটা নিরাপদ?',
              a: 'বুকিং অ্যাডভান্স নিশ্চিত করে যে ক্রেতা পশুটি কিনতে সিরিয়াস। আপনার দেওয়া টাকা এসক্রো সুরক্ষায় থাকে। গরু সুস্থভাবে বুঝে পাওয়ার আগে বিক্রেতা টাকা উত্তোলন করতে পারেন না।',
            },
            {
              q: 'নতুন খামারি হিসেবে কি আসলেই ফ্রি লিস্টিং পাওয়া যায়?',
              a: 'হ্যাঁ, গরু বাজারে যেকোনো নতুন বিক্রেতা একাউন্ট খুললেই প্রথম ১টি গরু সম্পূর্ণ বিনামূল্যে ৩০ দিনের জন্য লিস্টিং করতে পারবেন।',
            },
            {
              q: 'গরু পছন্দ না হলে বা বর্ণনার সাথে অমিল থাকলে কী করণীয়?',
              a: 'ডেলিভারির সময় গরুর স্বাস্থ্য বা জাত বর্ণনার সাথে গরমিল থাকলে তাৎক্ষণিক রিফান্ড চাওয়া যায় এবং অ্যাডভান্স টাকা ফেরত দেওয়া হয়।',
            },
            {
              q: 'ডেলিভারি কীভাবে সম্পন্ন হয়?',
              a: 'ক্রেতা নিজে খামারে গিয়ে পিকআপ করতে পারেন অথবা খামারির সাথে আলোচনা করে নিরাপদ গবাদিপশু পরিবহন ট্রাকে নিজ ঠিকানায় নিয়ে আসতে পারেন।',
            },
          ].map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4 space-y-1.5 shadow-sm">
              <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-neutral-600 pl-6 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
