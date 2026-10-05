import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Cow, CowCategory } from '../types';
import { CowCard } from './CowCard';
import { Search, Filter, SlidersHorizontal, RotateCcw, MapPin, Check } from 'lucide-react';
import { BD_DISTRICTS, COW_BREEDS } from '../data/mockData';

export const Marketplace: React.FC = () => {
  const { cows } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBreed, setSelectedBreed] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(800000);
  const [minMilk, setMinMilk] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter logic
  const filteredCows = useMemo(() => {
    return cows.filter((cow) => {
      // Must not be rejected in public marketplace
      if (cow.status === 'rejected') return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = cow.name.toLowerCase().includes(q);
        const matchBreed = cow.breed.toLowerCase().includes(q);
        const matchCode = cow.cowCode.toLowerCase().includes(q);
        const matchDist = cow.district.toLowerCase().includes(q);
        const matchSeller = cow.sellerName.toLowerCase().includes(q) || cow.sellerFarmName.toLowerCase().includes(q);
        const matchDesc = cow.description.toLowerCase().includes(q);
        if (!matchName && !matchBreed && !matchCode && !matchDist && !matchSeller && !matchDesc) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'all' && cow.category !== selectedCategory) {
        return false;
      }

      // Breed
      if (selectedBreed !== 'all' && !cow.breed.includes(selectedBreed)) {
        return false;
      }

      // District
      if (selectedDistrict !== 'all' && cow.district !== selectedDistrict) {
        return false;
      }

      // Gender
      if (selectedGender !== 'all' && cow.gender !== selectedGender) {
        return false;
      }

      // Max Price
      if (cow.price > maxPrice) {
        return false;
      }

      // Milk yield
      if (minMilk > 0 && (!cow.milkProductionLitersDaily || cow.milkProductionLitersDaily < minMilk)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'views') return b.viewsCount - a.viewsCount;
      if (sortBy === 'featured') return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [cows, searchQuery, selectedCategory, selectedBreed, selectedDistrict, selectedGender, maxPrice, minMilk, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBreed('all');
    setSelectedDistrict('all');
    setSelectedGender('all');
    setMaxPrice(800000);
    setMinMilk(0);
    setSortBy('newest');
  };

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'সব জাতের গরু' },
    { key: 'dairy', label: 'দুধের গাভী' },
    { key: 'qurbani', label: 'কোরবানি ও মাংস' },
    { key: 'beef', label: 'মোটাতাজা ষাঁড়' },
    { key: 'breeding', label: 'উন্নত ব্রিডিং' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            গরু মার্কেটপ্লেস
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            বাংলাদেশের যাচাইকৃত খামার থেকে সুস্থ ও উন্নত জাতের গবাদিপশু অন্বেষণ করুন
          </p>
        </div>

        {/* Search bar inside header */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="জাত, জেলা, ওজন বা কোড দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
      </div>

      {/* Category Segmented Tabs (Interactive functional buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              selectedCategory === cat.key
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4 flex items-center justify-between">
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-medium text-neutral-700"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>ফিল্টার ও সাজানো ({filteredCows.length}টি ফলাফল)</span>
        </button>
      </div>

      {/* Main Layout: Left sidebar filters, Right product grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Filters Sidebar */}
        <aside className={`bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>ফিল্টার করুন</span>
            </h2>
            <button
              onClick={resetFilters}
              className="text-xs text-neutral-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>
          </div>

          {/* District Filter */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">জেলা নির্বাচন:</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">সমগ্র বাংলাদেশ (সকল জেলা)</option>
              {BD_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Breed Filter */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">গরুর জাত:</label>
            <select
              value={selectedBreed}
              onChange={(e) => setSelectedBreed(e.target.value)}
              className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">সকল জাত</option>
              {COW_BREEDS.map((b) => (
                <option key={b} value={b.split(' ')[0]}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">লিঙ্গ:</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['all', 'ষাঁড়', 'গাভী', 'বকনা'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGender(g)}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                    selectedGender === g
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-semibold'
                      : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {g === 'all' ? 'সকল' : g}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-2">
              <span>সর্বোচ্চ মূল্য:</span>
              <span className="font-mono text-emerald-800">৳ {maxPrice.toLocaleString('bn-BD')}</span>
            </div>
            <input
              type="range"
              min={100000}
              max={1000000}
              step={20000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
              <span>৳ ১ লাখ</span>
              <span>৳ ১০ লাখ</span>
            </div>
          </div>

          {/* Milk Yield (If looking for dairy) */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-2">
              <span>ন্যূনতম দৈনিক দুধ:</span>
              <span className="font-mono text-blue-700">{minMilk > 0 ? `${minMilk} লিটার` : 'যেকোনো'}</span>
            </div>
            <input
              type="range"
              min={0}
              max={35}
              step={2}
              value={minMilk}
              onChange={(e) => setMinMilk(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
              <span>০ লিটার</span>
              <span>৩৫ লিটার</span>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">সাজানোর নিয়ম (Sort):</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="newest">নতুন লিস্টিং আগে</option>
              <option value="price_asc">দাম: কম থেকে বেশি</option>
              <option value="price_desc">দাম: বেশি থেকে কম</option>
              <option value="views">সর্বাধিক জনপ্রিয়</option>
              <option value="featured">ফিচার্ড গরু আগে</option>
            </select>
          </div>
        </aside>

        {/* Cow Results Grid */}
        <main className="lg:col-span-3">
          {/* Results count bar */}
          <div className="flex items-center justify-between mb-4 text-xs text-neutral-500">
            <div>
              পাওয়া গেছে: <strong className="text-neutral-900 font-semibold">{filteredCows.length}টি গরু</strong>
            </div>
            {filteredCows.length > 0 && (
              <div className="text-neutral-500">
                নিরাপদ অ্যাডভান্স বুকিং সিস্টেমের আওতায়
              </div>
            )}
          </div>

          {filteredCows.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCows.map((cow) => (
                <CowCard key={cow.id} cow={cow} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto text-2xl">
                🔍
              </div>
              <h3 className="text-base font-bold text-neutral-900">কোনো গরু খুঁজে পাওয়া যায়নি</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                আপনার দেওয়া ফিল্টারে কোনো ফলাফল পাওয়া যায়নি। অনুগ্রহ করে ফিল্টার শিথিল করুন বা রিসেট করুন।
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold"
              >
                ফিল্টার রিসেট করুন
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};
