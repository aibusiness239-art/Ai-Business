import React from 'react';
import { Cow } from '../types';
import { useApp } from '../context/AppContext';
import { MapPin, Heart, ShieldCheck, Check, Sparkles, Scale, Milk, ArrowRight } from 'lucide-react';
import { FALLBACK_COW_SVG } from '../utils/imageFallback';

interface CowCardProps {
  cow: Cow;
  onViewDetails?: (cow: Cow) => void;
  onQuickAdvance?: (cow: Cow) => void;
}

export const CowCard: React.FC<CowCardProps> = ({ cow, onViewDetails, onQuickAdvance }) => {
  const { wishlist, toggleWishlist, setSelectedCowId, setActivePage } = useApp();
  const isWishlisted = wishlist.includes(cow.id);

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(cow);
    } else {
      setSelectedCowId(cow.id);
      setActivePage('cow-details');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="group bg-white rounded-xl border border-neutral-200/90 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden">
      {/* Visual Image container */}
      <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden cursor-pointer" onClick={handleCardClick}>
        <img
          src={cow.images[0] || '/images/cow_sahiwal.jpg'}
          alt={cow.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            if (el.src !== FALLBACK_COW_SVG) {
              el.src = FALLBACK_COW_SVG;
            }
          }}
        />

        {/* Quiet Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span className="bg-neutral-900/85 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded shadow-sm">
            {cow.cowCode}
          </span>
          {cow.isFeatured && (
            <span className="bg-amber-600/90 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>ফিচার্ড</span>
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(cow.id);
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white text-neutral-600 hover:text-red-500 flex items-center justify-center shadow-sm transition-colors z-10"
          title="পছন্দ করুন"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Scrim for title readability if needed */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata line (Unboxed zero-pill rule) */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1.5 flex-wrap">
            <span className="font-medium text-emerald-800">{cow.breed}</span>
            <span aria-hidden="true">·</span>
            <span>{cow.gender}</span>
            <span aria-hidden="true">·</span>
            <span>{cow.ageYears} বছর {cow.ageMonths > 0 ? `${cow.ageMonths} মাস` : ''}</span>
          </div>

          {/* Cow Name */}
          <h3
            onClick={handleCardClick}
            className="text-base font-semibold text-neutral-900 hover:text-emerald-700 transition-colors line-clamp-1 cursor-pointer"
          >
            {cow.name}
          </h3>

          {/* Key Specs Row */}
          <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs py-2 px-2.5 bg-neutral-50 rounded-lg text-neutral-700">
            <div className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span>ওজন: <strong className="font-semibold text-neutral-900">{cow.weightKg} কেজি</strong></span>
            </div>
            {cow.milkProductionLitersDaily ? (
              <div className="flex items-center gap-1.5">
                <Milk className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>দুধ: <strong className="font-semibold text-neutral-900">{cow.milkProductionLitersDaily} লিটার</strong>/দিন</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-neutral-600">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>উচ্চতা: {cow.heightInch} ইঞ্চি</span>
              </div>
            )}
          </div>

          {/* Location & Seller */}
          <div className="mt-2.5 flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">{cow.upazila}, {cow.district}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0 font-medium text-neutral-700">
              <span className="truncate max-w-[100px]">{cow.sellerFarmName || cow.sellerName}</span>
              {cow.sellerIsVerified && (
                <span title="ভেরিফাইড খামারি">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Pricing & CTA Module */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-end justify-between gap-2">
          <div>
            <div className="text-[11px] text-neutral-500">মোট মূল্য</div>
            <div className="text-lg font-bold text-neutral-900 font-mono tracking-tight">
              ৳ {cow.price.toLocaleString('bn-BD')}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">
              অ্যাডভান্স: ৳ {cow.calculatedAdvanceAmount.toLocaleString('bn-BD')}
            </div>
          </div>

          <button
            onClick={handleCardClick}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-700 hover:text-white rounded-lg transition-colors whitespace-nowrap"
          >
            <span>বিস্তারিত</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
