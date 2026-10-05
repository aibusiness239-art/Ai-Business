import React from 'react';
import { ShieldCheck, Lock, AlertTriangle, CheckCircle, HelpCircle, PhoneCall } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SafetyPage: React.FC = () => {
  const { settings, setActivePage } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-200 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>নিরাপত্তা নীতিমালা</span>
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
          নিরাপদ গরু কেনাবেচার নির্দেশিকা
        </h1>
        <p className="text-xs text-neutral-500 leading-relaxed">
          গরু বাজার প্ল্যাটফর্মে ক্রেতা ও খামারি উভয়ের অর্থনৈতিক ও আইনি সুরক্ষাকে সর্বোচ্চ অগ্রাধিকার দেওয়া হয়।
        </p>
      </div>

      {/* Grid of Key Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">১. এসক্রো বুকিং অ্যাডভান্স</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            ক্রেতার দেওয়া অ্যাডভান্স সরাসরি খামারির কাছে যায় না। গরু ডেলিভারি ও ক্রেতার সন্তুষ্টির পরই ফান্ড রিলিজ হয়।
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">২. খামারি ও পশু ভেরিফিকেশন</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            এনআইডি, খামারের ট্রেড লাইসেন্স এবং নিয়মিত টিকাদান সনদ পর্যালোচনা করে খামারিকে যাচাইকৃত ব্লু ব্যাজ দেওয়া হয়।
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">৩. শতভাগ রিফান্ড পলিসি</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            বর্ণনার সাথে শারীরিক অমিল বা অসুস্থ পশু পাওয়া গেলে ক্রেতা তৎক্ষণাৎ সম্পূর্ণ অ্যাডভান্স টাকা ফেরত পাওয়ার অধিকার রাখেন।
          </p>
        </div>

      </div>

      {/* Detailed Guidelines */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm space-y-6 text-xs text-neutral-700 leading-relaxed">
        <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3">
          ক্রেতা ও বিক্রেতার সাধারণ নিয়মাবলী
        </h2>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-900">পশু ক্রয়ের পূর্বে ভিডিও বা সরাসরি পরিদর্শন:</strong>
              <p className="text-neutral-500 mt-0.5">
                বড় অঙ্কের গরু ক্রয়ের ক্ষেত্রে খামারির সাথে ভিডিও কলে গরুটির হাঁটাচলা ও খাবার খাওয়ার ভঙ্গি দেখুন অথবা সুবিধাজনক হলে সরাসরি খামারে যান।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-900">শুধুমাত্র অফিশিয়াল গেটওয়েতে লেনদেন:</strong>
              <p className="text-neutral-500 mt-0.5">
                প্ল্যাটফর্মের বাইরে কোনো ব্যক্তিগত নম্বরে অগ্রিম পাঠাবেন না। গরু বাজারের বিকাশ, নগদ বা ব্যাংক মাধ্যমে পাঠানো পেমেন্টই কেবল সুরক্ষা আইনের আওতায় পড়ে।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-900">ভেটেরিনারি প্রত্যয়নপত্র:</strong>
              <p className="text-neutral-500 mt-0.5">
                কোরবানির হাটের জন্য ক্ষতিকর স্টেরয়েড বা মোটাতাজাকরণ ওষুধমুক্ত অর্গানিক গরু নিশ্চিত করতে আমাদের খামারিরা অঙ্গীকারবদ্ধ।
              </p>
            </div>
          </div>
        </div>

        {/* Hotline help box */}
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PhoneCall className="w-6 h-6 text-emerald-700 shrink-0" />
            <div>
              <div className="font-bold text-emerald-950 text-sm">যেকোনো সহায়তায় কাস্টমার কেয়ার</div>
              <div className="text-neutral-600 text-xs">আমাদের অভিযোগ ও সুরক্ষা টিম সক্রিয় রয়েছে: {settings.hotline}</div>
            </div>
          </div>
          <button
            onClick={() => setActivePage('marketplace')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold shrink-0"
          >
            মার্কেটপ্লেসে ফিরুন
          </button>
        </div>

      </div>

    </div>
  );
};
