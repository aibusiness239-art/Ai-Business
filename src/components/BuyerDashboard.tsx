import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingBag,
  Heart,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  ExternalLink,
  Printer,
} from 'lucide-react';
import { CowCard } from './CowCard';

export const BuyerDashboard: React.FC = () => {
  const { currentUser, orders, cows, wishlist, setSelectedCowId, setActivePage } = useApp();
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile'>('orders');

  if (!currentUser) return null;

  const myOrders = orders.filter((o) => o.buyerId === currentUser.id);
  const wishlistedCows = cows.filter((c) => wishlist.includes(c.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Header Profile Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white font-bold text-2xl flex items-center justify-center shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{currentUser.name}</h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              ক্রেতা একাউন্ট · মোবাইল: {currentUser.phone} · জেলা: {currentUser.district}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-center">
            <div className="text-[11px] text-emerald-800 font-medium">বুকিংকৃত গরু</div>
            <div className="text-lg font-bold font-mono text-emerald-950">{myOrders.length}টি</div>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-center">
            <div className="text-[11px] text-neutral-500 font-medium">পছন্দের তালিকায়</div>
            <div className="text-lg font-bold font-mono text-neutral-900">{wishlist.length}টি</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'orders' ? 'border-emerald-700 text-emerald-700' : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>আমার বুকিং ও অর্ডার ({myOrders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'wishlist' ? 'border-emerald-700 text-emerald-700' : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>পছন্দের গরু ({wishlistedCows.length})</span>
        </button>
      </div>

      {/* TAB 1: My Orders with Timeline */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {myOrders.length > 0 ? (
            myOrders.map((ord) => (
              <div key={ord.id} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                
                {/* Order Top Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-2">
                  <div>
                    <span className="text-xs text-neutral-500">অর্ডার নম্বর: </span>
                    <strong className="text-sm font-mono text-neutral-900">{ord.orderNumber}</strong>
                    <span className="text-neutral-400 mx-2">·</span>
                    <span className="text-xs text-neutral-500">{ord.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                      {ord.orderStatus === 'confirmed' ? 'খামারি কনফার্মড' : 'অ্যাডভান্স পেইড'}
                    </span>
                    <button
                      onClick={() => window.print()}
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 border rounded-lg hover:bg-neutral-50"
                      title="ইনভয়েস প্রিন্ট"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Row */}
                <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Cow Info (5 cols) */}
                  <div className="md:col-span-5 flex items-center gap-3">
                    <img src={ord.cowImage} alt={ord.cowName} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">{ord.cowName}</h3>
                      <div className="text-xs text-neutral-500">জাত: {ord.cowBreed} · কোড: {ord.cowCode}</div>
                      <div className="text-xs text-emerald-700 font-medium">খামার: {ord.sellerFarmName} ({ord.sellerPhone})</div>
                    </div>
                  </div>

                  {/* Financials (4 cols) */}
                  <div className="md:col-span-4 bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">মোট মূল্য:</span>
                      <strong className="font-mono">৳{ord.cowTotalAmount.toLocaleString('bn-BD')}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>পরিশোধিত অ্যাডভান্স:</span>
                      <strong className="font-mono">৳{ord.advanceAmount.toLocaleString('bn-BD')}</strong>
                    </div>
                    <div className="flex justify-between text-neutral-500">
                      <span>বাকি প্রদেয়:</span>
                      <strong className="font-mono text-neutral-900">৳{ord.remainingAmount.toLocaleString('bn-BD')}</strong>
                    </div>
                    <div className="pt-1 border-t border-neutral-200 text-[11px] text-neutral-500 flex justify-between font-mono">
                      <span>Txn ID: {ord.transactionId}</span>
                      <span className="capitalize">{ord.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Quick details link (3 cols) */}
                  <div className="md:col-span-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedCowId(ord.cowId);
                        setActivePage('cow-details');
                      }}
                      className="px-3 py-2 border border-neutral-300 hover:border-emerald-600 text-neutral-700 text-xs font-semibold rounded-lg inline-flex items-center gap-1"
                    >
                      <span>গরুর বিবরণ দেখুন</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

                {/* Timeline Progress */}
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <h4 className="text-xs font-bold text-neutral-700 mb-3">অর্ডার প্রগ্রেস টাইমলাইন:</h4>
                  <div className="space-y-3">
                    {ord.timeline.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs">
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-[10px]">
                          ✓
                        </div>
                        <div>
                          <div className="font-bold text-neutral-900 flex items-center gap-2">
                            <span>{step.label}</span>
                            <span className="text-neutral-400 font-normal font-mono text-[11px]">({step.timestamp})</span>
                          </div>
                          <p className="text-neutral-500 mt-0.5">{step.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-900">আপনার কোনো সক্রিয় অর্ডার নেই</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                মার্কেটপ্লেস ঘুরে আপনার পছন্দের গরু নির্বাচন করুন এবং অ্যাডভান্স পরিশোধের মাধ্যমে বুকিং নিশ্চিত করুন।
              </p>
              <button
                onClick={() => setActivePage('marketplace')}
                className="mt-4 px-4 py-2 bg-emerald-700 text-white font-semibold rounded-xl text-xs"
              >
                মার্কেটপ্লেসে যান
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Wishlisted cows */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistedCows.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistedCows.map((cow) => (
                <CowCard key={cow.id} cow={cow} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
              <Heart className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-900">পছন্দের তালিকায় কোনো গরু নেই</h3>
              <p className="text-xs text-neutral-500 mt-1">যেকোনো গরুর কার্ডে হার্ট আইকনে ক্লিক করে সংরক্ষণ করুন।</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
