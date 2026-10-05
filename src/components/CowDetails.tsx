import React, { useState } from 'react';
import { Cow } from '../types';
import { useApp } from '../context/AppContext';
import { FALLBACK_COW_SVG } from '../utils/imageFallback';
import {
  ArrowLeft,
  ShieldCheck,
  Heart,
  Phone,
  Share2,
  MapPin,
  CheckCircle2,
  Scale,
  Milk,
  Ruler,
  Calendar,
  Sparkles,
  AlertCircle,
  Star,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { CowCard } from './CowCard';

interface CowDetailsProps {
  cowId: string;
  onBack: () => void;
}

export const CowDetails: React.FC<CowDetailsProps> = ({ cowId, onBack }) => {
  const { cows, wishlist, toggleWishlist, setPaymentModalCow, reviews, addReview, currentUser } = useApp();

  const cow = cows.find((c) => c.id === cowId) || cows[0];
  const [selectedImage, setSelectedImage] = useState(cow?.images[0] || '/images/hero_farm.jpg');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!cow) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-neutral-500">গরুটির তথ্য খুঁজে পাওয়া যায়নি।</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-lg">
          ফিরে যান
        </button>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(cow.id);
  const cowReviews = reviews.filter((r) => r.cowId === cow.id || r.sellerId === cow.sellerId);
  const relatedCows = cows.filter((c) => c.id !== cow.id && (c.breed === cow.breed || c.district === cow.district)).slice(0, 3);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addReview(cow.id, newRating, newComment);
    setNewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>সকল গরুর তালিকায় ফিরুন</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-600 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedLink ? 'কপি হয়েছে!' : 'শেয়ার করুন'}</span>
          </button>
          <button
            onClick={() => toggleWishlist(cow.id)}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isWishlisted
                ? 'border-red-200 bg-red-50 text-red-600'
                : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{isWishlisted ? 'পছন্দে সংরক্ষিত' : 'পছন্দ করুন'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Gallery on left, Purchase Module on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Gallery & Specs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Large Image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200 shadow-sm">
            <img
              src={selectedImage}
              alt={cow.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                if (el.src !== FALLBACK_COW_SVG) {
                  el.src = FALLBACK_COW_SVG;
                }
              }}
            />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="bg-neutral-900/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded">
                কোড: {cow.cowCode}
              </span>
              {cow.isFeatured && (
                <span className="bg-amber-600 text-white text-xs font-semibold px-2.5 py-1 rounded flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ফিচার্ড গরু</span>
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {cow.images && cow.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {cow.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-neutral-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${cow.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Video Strip (if available) */}
          {cow.videoUrl && (
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                  ▶
                </span>
                <div>
                  <div className="text-xs font-bold text-neutral-900">ভিডিও পরিদর্শনের লিংক উপলব্ধ রয়েছে</div>
                  <div className="text-[11px] text-neutral-500">গরুর সুস্থ হাঁটাচলা ও খাবার গ্রহণের ভিডিও দেখুন</div>
                </div>
              </div>
              <a
                href={cow.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white border border-neutral-300 hover:border-emerald-600 text-neutral-800 text-xs font-semibold rounded-lg flex items-center gap-1"
              >
                <span>ভিডিও দেখুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Key Specifications Grid */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-neutral-900 mb-4 border-b border-neutral-100 pb-2">
              গরুর শারীরিক ও প্রযুক্তিগত বিবরণ
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-neutral-50 rounded-xl">
                <div className="text-neutral-500">জাত (Breed)</div>
                <div className="text-sm font-bold text-neutral-900 mt-0.5">{cow.breed}</div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl">
                <div className="text-neutral-500">বয়স (Age)</div>
                <div className="text-sm font-bold text-neutral-900 mt-0.5">
                  {cow.ageYears} বছর {cow.ageMonths > 0 ? `${cow.ageMonths} মাস` : ''}
                </div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl">
                <div className="text-neutral-500">লিঙ্গ (Gender)</div>
                <div className="text-sm font-bold text-neutral-900 mt-0.5">{cow.gender}</div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl">
                <div className="text-neutral-500">ওজন (Live Weight)</div>
                <div className="text-sm font-bold text-neutral-900 mt-0.5">{cow.weightKg} কেজি</div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl">
                <div className="text-neutral-500">উচ্চতা (Height)</div>
                <div className="text-sm font-bold text-neutral-900 mt-0.5">{cow.heightInch} ইঞ্চি</div>
              </div>
              {cow.milkProductionLitersDaily ? (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <div className="text-blue-700 font-medium">দৈনিক দুধ উৎপাদন</div>
                  <div className="text-sm font-bold text-blue-950 mt-0.5">{cow.milkProductionLitersDaily} লিটার / দিন</div>
                </div>
              ) : (
                <div className="p-3 bg-neutral-50 rounded-xl">
                  <div className="text-neutral-500">দাঁতের সংখ্যা</div>
                  <div className="text-sm font-bold text-neutral-900 mt-0.5">২ থেকে ৪ দাঁত</div>
                </div>
              )}
            </div>

            {/* Health & Vaccination */}
            <div className="mt-6 pt-4 border-t border-neutral-100 space-y-3">
              <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                স্বাস্থ্য ও টিকাদান সংক্রান্ত তথ্য
              </h4>
              <div className="text-xs text-neutral-600 bg-neutral-50 p-3 rounded-xl leading-relaxed">
                <strong>স্বাস্থ্য অবস্থা:</strong> {cow.healthStatus}
              </div>

              <div>
                <div className="text-xs font-semibold text-neutral-700 mb-2">প্রদানকৃত ভ্যাকসিনসমূহ:</div>
                <div className="flex flex-wrap gap-2">
                  {cow.vaccinations && cow.vaccinations.map((vac, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-lg border border-emerald-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{vac}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-xs text-neutral-600 bg-neutral-50 p-3 rounded-xl leading-relaxed">
                <strong>খাদ্যাভ্যাস:</strong> {cow.feedingHabit}
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 pt-4 border-t border-neutral-100">
              <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                খামারির বিস্তারিত বিবরণ
              </h4>
              <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-line">
                {cow.description}
              </p>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-neutral-900">
                ক্রেতাদের রিভিউ ও মন্তব্য ({cowReviews.length})
              </h3>
              <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>৫.০ / ৫</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {cowReviews.length > 0 ? (
                cowReviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-neutral-50 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900">{rev.buyerName}</span>
                      <span className="text-neutral-400 text-[11px]">{rev.date}</span>
                    </div>
                    <div className="flex text-amber-400">
                      {'★'.repeat(rev.rating)}
                    </div>
                    <p className="text-neutral-600">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-500">এখনো কোনো রিভিউ দেওয়া হয়নি। প্রথম রিভিউটি দিন।</p>
              )}
            </div>

            {/* Add Review Form */}
            <form onSubmit={handleReviewSubmit} className="pt-4 border-t border-neutral-100 space-y-3">
              <div className="text-xs font-semibold text-neutral-700">আপনার মতামত বা রেটিং দিন:</div>
              <div className="flex items-center gap-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                      newRating === star
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    ★ {star} স্টার
                  </button>
                ))}
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="খামারি ও গরুর স্বাস্থ্য সম্পর্কে আপনার অভিজ্ঞতা লিখুন..."
                rows={2}
                className="w-full text-xs p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex justify-between items-center">
                {reviewSubmitted && (
                  <span className="text-xs text-emerald-600 font-semibold">আপনার রিভিউ সফলভাবে যুক্ত হয়েছে!</span>
                )}
                <button
                  type="submit"
                  className="ml-auto px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold"
                >
                  রিভিউ জমা দিন
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Contiguous Purchase & Seller Trust Module (5 cols, sticky) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          
          {/* Main Purchase & Advance Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-md">
            
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              {cow.categoryLabelBn}
            </div>
            <h1 className="text-xl font-bold text-neutral-900 leading-snug">{cow.name}</h1>

            {/* Price Breakdown */}
            <div className="mt-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-neutral-500">মোট বিক্রয়মূল্য:</span>
                <span className="text-2xl font-bold font-mono text-neutral-900">
                  ৳ {cow.price.toLocaleString('bn-BD')}
                </span>
              </div>

              <div className="flex items-baseline justify-between text-emerald-800 font-semibold pt-1 border-t border-neutral-200">
                <span className="text-xs">বুকিং অ্যাডভান্স ({cow.advanceType === 'percentage' ? `${cow.advanceValue}%` : 'নির্ধারিত'}):</span>
                <span className="text-lg font-bold font-mono">
                  ৳ {cow.calculatedAdvanceAmount.toLocaleString('bn-BD')}
                </span>
              </div>

              <div className="flex items-baseline justify-between text-neutral-500 text-xs">
                <span>ডেলিভারির সময় প্রদেয়:</span>
                <span className="font-mono font-medium text-neutral-800">
                  ৳ {cow.remainingAmount.toLocaleString('bn-BD')}
                </span>
              </div>
            </div>

            {/* Trust and Safety Notice */}
            <div className="mt-4 p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-emerald-900">নিরাপদ অগ্রিম পরিশোধ গ্যারান্টি</strong>
                আপনার প্রদানকৃত অ্যাডভান্স সম্পূর্ণ এসক্রো সুরক্ষায় থাকবে। গরু হাতে পেয়ে নিশ্চিত না করা পর্যন্ত বিক্রেতাকে ছাড় দেওয়া হবে না।
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => setPaymentModalCow(cow)}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Advance দিন ও বুকিং করুন (৳{cow.calculatedAdvanceAmount.toLocaleString('bn-BD')})</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${cow.sellerPhone}`}
                  className="py-2.5 px-3 border border-neutral-300 hover:border-emerald-600 text-neutral-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-700" />
                  <span>সরাসরি কল করুন</span>
                </a>
                <a
                  href={`https://wa.me/88${cow.sellerPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 border border-green-300 bg-green-50/50 hover:bg-green-100 text-green-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <span>হোয়াটসঅ্যাপ চ্যাট</span>
                </a>
              </div>
            </div>
          </div>

          {/* Seller Information Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
              খামার ও বিক্রেতা প্রোফাইল
            </h3>

            <div className="flex items-start gap-3 pb-3 border-b border-neutral-100">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-lg flex items-center justify-center shrink-0 border border-emerald-300">
                {cow.sellerFarmName ? cow.sellerFarmName.charAt(0) : 'খ'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-bold text-neutral-900 flex items-center gap-1.5 truncate">
                  <span>{cow.sellerFarmName}</span>
                  {cow.sellerIsVerified && (
                    <span title="যাচাইকৃত খামারি">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-600 font-medium">স্বত্বাধিকারী: {cow.sellerName}</div>
                <div className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{cow.fullAddress}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs py-3 text-neutral-600">
              <div>
                ভেরিফিকেশন: <strong className="text-emerald-700">{cow.sellerIsVerified ? 'যাচাইকৃত খামার' : 'আবেদনকৃত'}</strong>
              </div>
              <div>
                রেটিং: <strong className="text-neutral-900">৪.৯ ★ (২৮টি রিভিউ)</strong>
              </div>
              <div>
                মোট গরু বিক্রি: <strong className="text-neutral-900">১৪+ টি</strong>
              </div>
              <div>
                সদস্যকাল: <strong className="text-neutral-900">২০২৬ থেকে</strong>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Related Cows Section */}
      {relatedCows.length > 0 && (
        <div className="mt-16 pt-8 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">একই জাতের অন্যান্য গরু</h2>
              <p className="text-xs text-neutral-500">আপনার পছন্দ অনুযায়ী আরও বিকল্প যাচাই করুন</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedCows.map((rc) => (
              <CowCard key={rc.id} cow={rc} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
