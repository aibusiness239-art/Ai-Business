import React from 'react';
import { useApp } from '../context/AppContext';
import { Crown, Check, Zap, Sparkles, ArrowRight } from 'lucide-react';

export const PackagesPage: React.FC = () => {
  const { plans, setSubscriptionModalOpen, currentUser, setAuthModalOpen } = useApp();

  const handleSelectPlan = (planId: string) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setSubscriptionModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-200 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
          <Crown className="w-4 h-4 text-amber-600" />
          <span>খামারি সাবস্ক্রিপশন প্যাকেজ</span>
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
          আপনার খামারের বিক্রয় বাড়াতে সেরা প্যাকেজ বেছে নিন
        </h1>
        <p className="text-xs text-neutral-500 leading-relaxed">
          প্রথম ১টি গরু সম্পূর্ণ ফ্রি লিস্টিং সুবিধা! এরপর নিয়মিত খামারিদের জন্য আকর্ষণীয় মূল্যের সাবস্ক্রিপশন সুবিধা।
        </p>
      </div>

      {/* Free package callout */}
      <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-bold text-2xl flex items-center justify-center shrink-0">
            🎁
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-950">নতুন খামারিদের জন্য ১টি লিস্টিং একদম ফ্রি!</h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              এখনই একটি বিক্রেতা একাউন্ট খুলুন এবং কোনো প্রকার ফি ছাড়াই প্রথম গরুর বিজ্ঞাপন দিন।
            </p>
          </div>
        </div>

        <button
          onClick={() => handleSelectPlan('plan-free')}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm whitespace-nowrap"
        >
          বিনামূল্যে শুরু করুন
        </button>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isStandard = plan.id === 'plan-standard';
          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 border flex flex-col justify-between transition-all bg-white relative ${
                isStandard ? 'border-emerald-600 shadow-xl ring-2 ring-emerald-600/30' : 'border-neutral-200 shadow-sm'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="text-base font-bold text-neutral-900 mt-2">{plan.nameBn}</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-neutral-900 font-mono">
                    ৳{plan.price.toLocaleString('bn-BD')}
                  </span>
                  <span className="text-xs text-neutral-500">/ {plan.durationDays} দিন</span>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 space-y-3 text-xs">
                  <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>লিস্টিং ক্ষমতা: <strong className="text-emerald-700">{plan.listingLimit}টি গরু</strong></span>
                  </div>

                  {plan.featuredSlots > 0 && (
                    <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>হোমপেজ ফিচার্ড: {plan.featuredSlots}টি গরু</span>
                    </div>
                  )}

                  <div className="space-y-2 pt-2">
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-neutral-600">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                className={`mt-8 w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  isStandard
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                }`}
              >
                <span>{plan.price === 0 ? 'বিনামূল্যে সক্রিয় করুন' : 'প্যাকেজটি কিনুন'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
