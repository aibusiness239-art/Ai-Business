import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { FALLBACK_COW_SVG } from '../utils/imageFallback';
import {
  Search,
  Truck,
  Building,
  CheckCircle2,
  Clock,
  MapPin,
  PhoneCall,
  Printer,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  PackageCheck,
  Calendar,
  ChevronRight,
} from 'lucide-react';

export const OrderTrackingPage: React.FC = () => {
  const { orders, setActivePage, setSelectedCowId, settings } = useApp();

  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [matchedOrders, setMatchedOrders] = useState<Order[]>([]);

  const handleSearch = (searchQuery: string = query) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setMatchedOrders([]);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);
    // Match by: Buyer phone, Order Number, Cow Code, Transaction ID, Cow Name
    const cleanNumber = q.replace(/[^0-9]/g, '');
    const results = orders.filter((o) => {
      const orderPhoneClean = o.buyerPhone.replace(/[^0-9]/g, '');
      const matchPhone = cleanNumber.length >= 6 && orderPhoneClean.includes(cleanNumber);
      const matchOrderNum = o.orderNumber.toLowerCase().includes(q);
      const matchCowCode = o.cowCode.toLowerCase().includes(q);
      const matchTxn = o.transactionId.toLowerCase().includes(q);
      const matchCowName = o.cowName.toLowerCase().includes(q);
      return matchPhone || matchOrderNum || matchCowCode || matchTxn || matchCowName;
    });

    setMatchedOrders(results);
  };

  const getStatusStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'advance_pending':
        return 0;
      case 'advance_paid':
        return 1;
      case 'confirmed':
        return 2;
      case 'processing':
        return 3;
      case 'ready_for_delivery':
        return 4;
      case 'completed':
        return 5;
      default:
        return 1;
    }
  };

  const steps = [
    { title: 'বুকিং ইনিশিয়েটেড', desc: 'অর্ডার প্রস্তুত ও অ্যাডভান্স প্রক্রিয়া' },
    { title: 'অ্যাডভান্স পেমেন্ট ভেরিফাইড', desc: 'এসক্রো ফান্ডে টাকা সংরক্ষিত' },
    { title: 'খামারি কর্তৃক কনফার্মড', desc: 'গরু বুকিং ও বুকড মার্কিং' },
    { title: 'স্বাস্থ্য পরীক্ষা ও প্রস্তুতি', desc: 'ভেটেরিনারি চেক ও সাইলেজ খাবার' },
    { title: 'ট্রাকে লোডিং ও ডেলিভারি যাত্রা', desc: 'আপনার গন্তব্যের উদ্দেশ্যে রওনা' },
    { title: 'হস্তান্তর ও বাকি পেমেন্ট', desc: 'গরু বুঝে নিয়ে অর্ডার সম্পন্ন' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-200 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-emerald-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-800/80 border border-emerald-700 rounded-full text-xs font-semibold text-emerald-200">
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span>লাইভ গবাদিপশু ট্র্যাকিং সার্ভিস</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            আপনার গরুর বুকিং ও ডেলিভারি ট্র্যাক করুন
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            বুকিং করার সময় প্রদত্ত আপনার <strong>মোবাইল নম্বর</strong>, <strong>অর্ডার নম্বর</strong> অথবা <strong>গরুর কোড</strong> লিখে তাৎক্ষণিক লাইভ অবস্থান ও স্ট্যাটাস যাচাই করুন।
          </p>

          {/* Search Input Box */}
          <div className="pt-2">
            <div className="bg-white p-2 rounded-2xl shadow-lg flex items-center gap-2 border border-emerald-700/40">
              <Search className="w-5 h-5 text-neutral-400 ml-2 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="মোবাইল নম্বর (যেমন: ০১৭৯৯-৮৮৭৭৬৬), অর্ডার নম্বর (ORD-2026-...) বা গরু কোড (GB-7041)..."
                className="flex-1 px-2 py-2 text-xs sm:text-sm text-neutral-900 rounded-xl focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSearch()}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shrink-0 shadow-sm"
              >
                ট্র্যাক করুন
              </button>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-emerald-200">
              <span className="text-[11px] text-emerald-300">ডেমো দ্রুত পরীক্ষা করুন:</span>
              <button
                type="button"
                onClick={() => {
                  setQuery('০১৭৯৯-৮৮৭৭৬৬');
                  handleSearch('০১৭৯৯-৮৮৭৭৬৬');
                }}
                className="px-2.5 py-1 bg-emerald-900/90 hover:bg-emerald-800 rounded-lg text-[11px] font-mono border border-emerald-700/60"
              >
                ০১৭৯৯-৮৮৭৭৬৬
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery('ORD-2026-8001');
                  handleSearch('ORD-2026-8001');
                }}
                className="px-2.5 py-1 bg-emerald-900/90 hover:bg-emerald-800 rounded-lg text-[11px] font-mono border border-emerald-700/60"
              >
                ORD-2026-8001
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery('GB-7041');
                  handleSearch('GB-7041');
                }}
                className="px-2.5 py-1 bg-emerald-900/90 hover:bg-emerald-800 rounded-lg text-[11px] font-mono border border-emerald-700/60"
              >
                GB-7041
              </button>
            </div>
          </div>
        </div>

        {/* Decorative corner visual */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none hidden md:block">
          <Truck className="w-80 h-80 -mr-10 -mb-10 text-white" />
        </div>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">
              ট্র্যাকিং ফলাফল ({matchedOrders.length}টি পাওয়া গেছে)
            </h2>
            <button
              onClick={() => {
                setQuery('');
                setHasSearched(false);
                setMatchedOrders([]);
              }}
              className="text-xs text-neutral-500 hover:text-neutral-800"
            >
              রিসেট করুন
            </button>
          </div>

          {matchedOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-neutral-200 shadow-sm space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-neutral-900">কোনো অর্ডার পাওয়া যায়নি</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                  আপনার ইনপুটকৃত তথ্যের সাথে মিল রেখে কোনো বুকিং পাওয়া যায়নি। অনুগ্রহ করে মোবাইল নম্বর বা অর্ডার আইডিটি পুনরায় যাচাই করুন।
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <a
                  href={`tel:${settings.hotline}`}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>জরুরি সহায়তার জন্য হটলাইনে কল করুন: {settings.hotline}</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {matchedOrders.map((order) => {
                const currentStepIdx = getStatusStepIndex(order.orderStatus);

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-neutral-200 shadow-md overflow-hidden space-y-6 p-6 sm:p-8"
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-neutral-400">·</span>
                          <span className="text-xs text-neutral-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{order.createdAt}</span>
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-neutral-900 mt-1">
                          {order.cowName} ({order.cowCode})
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-full">
                          স্ট্যাটাস: {order.orderStatus}
                        </span>
                        <button
                          onClick={() => window.print()}
                          className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-colors"
                          title="রশিদ প্রিন্ট করুন"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Cow Brief & Finance Strip */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={order.cowImage || '/images/cow_sahiwal.jpg'}
                          alt={order.cowName}
                          className="w-16 h-16 rounded-xl object-cover border border-neutral-200 shrink-0"
                          onError={(e) => {
                            const el = e.currentTarget as HTMLImageElement;
                            if (el.src !== FALLBACK_COW_SVG) {
                              el.src = FALLBACK_COW_SVG;
                            }
                          }}
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-neutral-900 truncate">{order.cowName}</div>
                          <div className="text-neutral-500 mt-0.5">জাত: {order.cowBreed}</div>
                          <button
                            onClick={() => {
                              setSelectedCowId(order.cowId);
                              setActivePage('cow-details');
                            }}
                            className="text-emerald-700 hover:underline font-semibold text-[11px] mt-0.5 flex items-center gap-0.5"
                          >
                            <span>গরুর বিস্তারিত প্রোফাইল</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div><span className="text-neutral-500">খামার:</span> <strong>{order.sellerFarmName || order.sellerName}</strong></div>
                        <div><span className="text-neutral-500">খামারির ফোন:</span> <strong className="font-mono">{order.sellerPhone}</strong></div>
                        <div><span className="text-neutral-500">ডেলিভারি মাধ্যম:</span> <strong>{order.deliveryType === 'farm_pickup' ? 'খামার থেকে পিকআপ' : 'হোম ডেলিভারি (ট্রাক)'}</strong></div>
                      </div>

                      <div className="space-y-1">
                        <div><span className="text-neutral-500">মোট মূল্য:</span> <strong className="font-mono font-bold text-neutral-900">৳{order.cowTotalAmount.toLocaleString('bn-BD')}</strong></div>
                        <div className="text-emerald-800"><span className="text-neutral-500">পরিশোধিত বুকিং অ্যাডভান্স:</span> <strong className="font-mono font-bold">৳{order.advanceAmount.toLocaleString('bn-BD')}</strong></div>
                        <div><span className="text-neutral-500">ডেলিভারিতে বাকি প্রদেয়:</span> <strong className="font-mono font-bold text-amber-700">৳{order.remainingAmount.toLocaleString('bn-BD')}</strong></div>
                      </div>
                    </div>

                    {/* Visual Stepper Timeline */}
                    <div className="space-y-3 pt-2">
                      <div className="text-xs font-bold text-neutral-900">ডেলিভারি অগ্রগতি পর্যায় (Progress):</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {steps.map((st, idx) => {
                          const isDone = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;

                          return (
                            <div
                              key={idx}
                              className={`p-3 rounded-2xl border transition-all text-left ${
                                isCurrent
                                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                                  : isDone
                                  ? 'bg-neutral-50/80 border-emerald-300'
                                  : 'bg-white border-neutral-200 opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <span
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    isDone ? 'bg-emerald-700 text-white' : 'bg-neutral-200 text-neutral-600'
                                  }`}
                                >
                                  {isDone ? '✓' : idx + 1}
                                </span>
                                <span className={`text-[11px] font-bold ${isDone ? 'text-emerald-950' : 'text-neutral-500'}`}>
                                  ধাপ {idx + 1}
                                </span>
                              </div>
                              <div className="text-xs font-bold text-neutral-900 leading-tight">
                                {st.title}
                              </div>
                              <div className="text-[10px] text-neutral-500 mt-1 leading-snug">
                                {st.desc}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detailed Timeline Events */}
                    {order.timeline && order.timeline.length > 0 && (
                      <div className="pt-2 border-t border-neutral-100">
                        <div className="text-xs font-bold text-neutral-900 mb-2">সর্বশেষ অডিট ও ইভেন্ট বিবরণ:</div>
                        <div className="space-y-2">
                          {order.timeline.map((evt, eIdx) => (
                            <div key={eIdx} className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-start gap-2.5 text-xs">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <strong className="text-neutral-900">{evt.label}</strong>
                                  <span className="text-[10px] text-neutral-400 font-mono">{evt.timestamp}</span>
                                </div>
                                <p className="text-[11px] text-neutral-600 mt-0.5">{evt.note}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100">
                      <div className="flex items-center gap-2 text-xs text-emerald-900">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>গরু বাজার ১০০% এসক্রো সুরক্ষিত লেনদেন (TrxID: <code className="font-bold">{order.transactionId}</code>)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${order.sellerPhone}`}
                          className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>খামারির সাথে কথা বলুন</span>
                        </a>
                        <button
                          onClick={() => setActivePage('marketplace')}
                          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <span>আরও গরু দেখুন</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Multiple Cow Purchase / Buyer Guide Banner (Requirement: User can buy multiple cows) */}
      <div className="bg-gradient-to-r from-emerald-50 to-neutral-50 rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
            <PackageCheck className="w-4 h-4 text-emerald-700" />
            <span>একাধিক গরু ক্রয়ের সুবিধা (Multiple Cow Purchase)</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900">
            আপনি কি একসাথে একাধিক গরু কিনতে চান?
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            গরু বাজারে একজন ক্রেতা যত খুশি গরু বুকিং করতে পারেন। প্রতিটি গরুর জন্য আলাদা বুকিং রশিদ, আলাদা ট্র্যাকিং কোড ও সরাসরি খামারি যোগাযোগ নম্বর সরবরাহ করা হয়।
          </p>
        </div>

        <button
          onClick={() => setActivePage('marketplace')}
          className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <span>মার্কেটপ্লেসে আরও গরু খুঁজুন</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
