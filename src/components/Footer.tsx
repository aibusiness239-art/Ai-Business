import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, PhoneCall, Mail, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setActivePage } = useApp();

  const navigateTo = (page: string) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-neutral-900 text-neutral-400 text-xs border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold text-base flex items-center justify-center">
                গ
              </div>
              <span className="text-lg font-bold text-white tracking-tight">গরু বাজার</span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              বাংলাদেশের প্রথম ও বিশ্বস্ত আধুনিক অনলাইন গরু কেনাবেচার ডিজিটাল মার্কেটপ্লেস। খামারি ও ক্রেতাদের নিরাপদ সেতুবন্ধন।
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>১০০% এসক্রো অ্যাডভান্স প্রটেকশন</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">মার্কেটপ্লেস ও লিংক</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigateTo('home')} className="hover:text-white transition-colors">
                  হোমপেজ
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('marketplace')} className="hover:text-white transition-colors">
                  সকল গরু ও গাভী
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('packages')} className="hover:text-white transition-colors">
                  খামারি সাবস্ক্রিপশন প্যাকেজ
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('safety')} className="hover:text-white transition-colors">
                  নিরাপত্তা ও পেমেন্ট নীতিমালা
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Breeds */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">জনপ্রিয় জাতসমূহ</h3>
            <ul className="space-y-2">
              <li>হোলস্টাইন ফ্রিজিয়ান ক্রস (দুধের গাভী)</li>
              <li>খাঁটি শাহীওয়াল ষাঁড়</li>
              <li>আমেরিকান ব্রাহমা বুল</li>
              <li>রেড চিটাগাং ক্যাটল (RCC)</li>
              <li>রেড সিন্ধি ও পাবনা ব্রিড</li>
            </ul>
          </div>

          {/* Col 4: Contact & Office */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">যোগাযোগ ও সহায়তা</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-white font-mono">{settings.hotline}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{settings.email}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
            </div>
            
            <div className="pt-2 text-[11px] text-neutral-500">
              পেমেন্ট সহযোগী: বিকাশ · নগদ · রকেট · ইসলামী ব্যাংক
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            © ২০২৬ গরু বাজার (Goru Bazar). সর্বস্বত্ব সংরক্ষিত।
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigateTo('safety')} className="hover:text-white">
              ব্যবহারের শর্তাবলী
            </button>
            <span>·</span>
            <button onClick={() => navigateTo('safety')} className="hover:text-white">
              প্রাইভেসি পলিসি
            </button>
            <span>·</span>
            <button onClick={() => navigateTo('safety')} className="hover:text-white">
              রিফান্ড পলিসি
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
