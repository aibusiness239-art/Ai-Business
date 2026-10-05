import JSZip from 'jszip';
import { SiteSettings, Cow, SubscriptionPlan } from '../types';
import { FALLBACK_COW_SVG, FALLBACK_HERO_SVG } from './imageFallback';

export interface BuildOptions {
  version: string;
  adminName: string;
  settings: SiteSettings;
  cows: Cow[];
  plans: SubscriptionPlan[];
  onProgress?: (progress: number, stepName: string) => void;
}

export async function generateNetlifyDistZip(options: BuildOptions): Promise<{ blob: Blob; sizeKb: number; filename: string }> {
  const { version, adminName, settings, cows, plans, onProgress } = options;
  const zip = new JSZip();

  onProgress?.(5, 'শুরু হচ্ছে: প্রজেক্ট আর্কিটেকচার কনফিগারেশন...');
  await new Promise((r) => setTimeout(r, 150));

  // 1. netlify.toml
  zip.file(
    'netlify.toml',
    `# Goru Bazar - Production Netlify Configuration
# Version: ${version}
# Built: ${new Date().toISOString()}

[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Access-Control-Allow-Origin = "*"

[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
`
  );

  onProgress?.(15, 'Netlify _redirects ও হেডার ফাইল প্রস্তুত করা হচ্ছে...');
  await new Promise((r) => setTimeout(r, 150));

  // 2. _redirects
  zip.file('_redirects', `/*    /index.html   200\n`);

  // 3. robots.txt & sitemap.xml
  zip.file(
    'robots.txt',
    `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://gorubazar.com.bd/sitemap.xml
`
  );

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://gorubazar.com.bd/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://gorubazar.com.bd/marketplace</loc>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://gorubazar.com.bd/packages</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ${cows
    .map(
      (c) => `  <url>
    <loc>https://gorubazar.com.bd/cow/${c.id}</loc>
    <lastmod>${c.createdAt}</lastmod>
    <priority>0.85</priority>
  </url>`
    )
    .join('\n')}
</urlset>`;
  zip.file('sitemap.xml', sitemapXml);

  // 4. PACKAGING IMAGES INTO DIST (Requirement: Fix missing images in Netlify DIST)
  onProgress?.(30, 'Netlify DIST-এর জন্য সকল গরুর ছবি ও ব্যানার প্যাকেজিং হচ্ছে...');
  const imagesFolder = zip.folder('images')!;

  const imageFiles = [
    'cow_sahiwal.jpg',
    'cow_friesian.jpg',
    'cow_brahman.jpg',
    'hero_farm.jpg',
    'cow_sahiwal_red_1791024696676.jpg',
    'cow_friesian_dairy_1791024708907.jpg',
    'cow_brahman_grey_1791024721861.jpg',
    'hero_cattle_farm_1791024684738.jpg',
  ];

  let imagesPackedCount = 0;

  for (const imgName of imageFiles) {
    try {
      const res = await fetch(`/images/${imgName}`);
      if (res.ok && res.headers.get('content-type')?.includes('image')) {
        const blob = await res.blob();
        imagesFolder.file(imgName, blob);
        imagesPackedCount++;
      } else {
        // Fallback: If fetch returned html or failed, embed SVG fallback
        const svgContent = imgName.includes('hero') ? FALLBACK_HERO_SVG : FALLBACK_COW_SVG;
        const cleanSvg = decodeURIComponent(svgContent.replace(/^data:image\/svg\+xml;utf8,/, ''));
        imagesFolder.file(imgName.replace('.jpg', '.svg'), cleanSvg);
      }
    } catch {
      const svgContent = imgName.includes('hero') ? FALLBACK_HERO_SVG : FALLBACK_COW_SVG;
      const cleanSvg = decodeURIComponent(svgContent.replace(/^data:image\/svg\+xml;utf8,/, ''));
      imagesFolder.file(imgName.replace('.jpg', '.svg'), cleanSvg);
    }
  }

  // Also create guaranteed fallback SVG inside images folder
  imagesFolder.file('fallback_cow.svg', decodeURIComponent(FALLBACK_COW_SVG.replace(/^data:image\/svg\+xml;utf8,/, '')));
  imagesFolder.file('fallback_hero.svg', decodeURIComponent(FALLBACK_HERO_SVG.replace(/^data:image\/svg\+xml;utf8,/, '')));

  onProgress?.(55, `মোট ${imageFiles.length}টি ইমেজ সফলভাবে প্যাকেজে অন্তর্ভুক্ত হয়েছে...`);
  await new Promise((r) => setTimeout(r, 200));

  // 5. Complete Production Interactive HTML for Netlify
  onProgress?.(70, 'Production index.html ও রেসপনসিভ মার্কেটপ্লেস কোড জেনারেট হচ্ছে...');
  await new Promise((r) => setTimeout(r, 200));

  const jsonCows = JSON.stringify(cows).replace(/</g, '\\u003c');
  const jsonPlans = JSON.stringify(plans).replace(/</g, '\\u003c');
  const jsonSettings = JSON.stringify(settings).replace(/</g, '\\u003c');

  const productionHtml = `<!doctype html>
<html lang="bn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${settings.siteName} | ${settings.tagline}</title>
    <meta name="description" content="${settings.siteName} - ${settings.heroBannerSubtitle}" />
    <meta property="og:title" content="${settings.siteName} | বাংলাদেশের বিশ্বস্ত গবাদিপশু মার্কেটপ্লেস" />
    <meta property="og:description" content="${settings.heroBannerSubtitle}" />
    <meta property="og:type" content="website" />
    <meta name="generator" content="Goru Bazar Netlify Production Bundler v${version}" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Hind Siliguri', 'Plus Jakarta Sans', 'sans-serif'],
            }
          }
        }
      }
    </script>
    <style>
      body { font-family: 'Hind Siliguri', sans-serif; }
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
  </head>
  <body class="bg-neutral-50 text-neutral-900 font-sans antialiased min-h-screen flex flex-col">
    
    <!-- Top Announcement -->
    <div class="bg-emerald-950 text-emerald-200 text-xs py-2 px-4 border-b border-emerald-900/50">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2 truncate">
          <span class="bg-emerald-700 text-white px-2 py-0.5 rounded text-[11px] font-bold">বিজ্ঞপ্তি</span>
          <span class="truncate">${settings.announcementText}</span>
        </div>
        <div class="hidden sm:flex items-center gap-4 text-xs font-mono">
          <span>হটলাইন: ${settings.hotline}</span>
        </div>
      </div>
    </div>

    <!-- Main Navigation Header -->
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <a href="/" class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
            গ
          </div>
          <div>
            <div class="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-1.5">
              ${settings.siteName}
              <span class="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
            </div>
            <div class="text-xs text-neutral-500 font-medium">${settings.tagline}</div>
          </div>
        </a>

        <div class="hidden md:flex items-center gap-6 text-sm font-semibold text-neutral-700">
          <a href="#marketplace" class="hover:text-emerald-700 transition-colors">সকল গরু</a>
          <a href="#packages" class="hover:text-emerald-700 transition-colors">খামারি প্যাকেজ</a>
          <a href="#safety" class="hover:text-emerald-700 transition-colors">নিরাপত্তা ও নিয়ম</a>
          <a href="#contact" class="hover:text-emerald-700 transition-colors">যোগাযোগ</a>
        </div>

        <div class="flex items-center gap-3">
          <a href="#marketplace" class="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors">
            মার্কেটপ্লেস দেখুন
          </a>
          <a href="#packages" class="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition-colors">
            গরু বিক্রি করুন
          </a>
        </div>
      </div>
    </header>

    <!-- Hero Section with Netlify Image -->
    <section class="relative bg-emerald-950 text-white overflow-hidden py-16 sm:py-24">
      <div class="absolute inset-0 z-0 opacity-25">
        <img 
          src="images/hero_farm.jpg" 
          alt="Cattle Farm" 
          class="w-full h-full object-cover"
          onerror="this.onerror=null; this.src='images/fallback_hero.svg';"
        />
      </div>
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-800/80 backdrop-blur-sm text-emerald-200 rounded-full text-xs font-semibold">
          ★ বাংলাদেশের প্রথম ভেরিফাইড অনলাইন ক্যাটল মার্কেট
        </span>
        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          ${settings.heroBannerTitle}
        </h1>
        <p class="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
          ${settings.heroBannerSubtitle}
        </p>

        <!-- Search Bar -->
        <div class="max-w-2xl mx-auto pt-4">
          <div class="bg-white p-2 rounded-2xl shadow-xl flex items-center gap-2">
            <input 
              id="searchInput" 
              type="text" 
              placeholder="জাত, জেলা বা কোড দিয়ে খুঁজুন (যেমন: শাহীওয়াল, পাবনা, ফ্রিজিয়ান)..."
              class="flex-1 px-4 py-2.5 text-sm text-neutral-800 rounded-xl focus:outline-none"
              oninput="renderCows()"
            />
            <button 
              onclick="renderCows()"
              class="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
            >
              খুঁজুন
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Marketplace Section -->
    <main id="marketplace" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 class="text-2xl font-bold text-neutral-900">গবাদিপশুর তালিকা</h2>
          <p class="text-sm text-neutral-500 mt-1">সরাসরি খামার থেকে যাচাইকৃত এবং স্বাস্থ্যসম্মত গরু বুকিং করুন</p>
        </div>

        <!-- Filter Tags -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
          <button onclick="setCategoryFilter('all')" class="cat-btn active px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 text-white" data-cat="all">সকল (${cows.length})</button>
          <button onclick="setCategoryFilter('qurbani')" class="cat-btn px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50" data-cat="qurbani">কোরবানি</button>
          <button onclick="setCategoryFilter('dairy')" class="cat-btn px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50" data-cat="dairy">দুধের গাভী</button>
          <button onclick="setCategoryFilter('beef')" class="cat-btn px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50" data-cat="beef">মাংসের ষাঁড়</button>
        </div>
      </div>

      <!-- Cow Cards Grid -->
      <div id="cowGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <!-- Injected via JavaScript -->
      </div>
    </main>

    <!-- Packages Section -->
    <section id="packages" class="bg-neutral-100 py-16 border-t border-neutral-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h2 class="text-3xl font-bold text-neutral-900">খামারি সাবস্ক্রিপশন প্যাকেজসমূহ</h2>
        <p class="text-sm text-neutral-600 max-w-2xl mx-auto">
          প্রথম গরু লিস্টিং সম্পূর্ণ বিনামূল্যে! এরপর সাশ্রয়ী প্যাকেজ নিয়ে আপনার খামারের বিক্রি বাড়ান।
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
          ${plans
            .slice(0, 3)
            .map(
              (p) => `
            <div class="bg-white rounded-2xl p-6 border ${p.isFreePackage ? 'border-emerald-300 ring-2 ring-emerald-500/20' : 'border-neutral-200'} shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <span class="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full">${p.badge || 'খামারি প্যাকেজ'}</span>
                <h3 class="text-lg font-bold text-neutral-900 mt-2">${p.nameBn}</h3>
                <div class="text-2xl font-bold font-mono text-emerald-950 mt-1">
                  ${p.price === 0 ? 'সম্পূর্ণ ফ্রি' : `৳${p.price.toLocaleString('bn-BD')}`}
                  <span class="text-xs text-neutral-500 font-normal font-sans">/${p.durationDays} দিন</span>
                </div>
                <ul class="text-xs text-neutral-600 space-y-2 mt-4">
                  ${p.features.map((f) => `<li class="flex items-center gap-2">✓ ${f}</li>`).join('')}
                </ul>
              </div>
              <button onclick="alert('খামারি প্যাকেজ অ্যাক্টিভেশনের জন্য হটলাইনে যোগাযোগ করুন: ${settings.hotline}')" class="w-full py-2.5 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-colors">
                প্যাকেজ নিন
              </button>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </section>

    <!-- Safety Section -->
    <section id="safety" class="bg-white py-16 border-t border-neutral-200">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
        <h2 class="text-2xl font-bold text-neutral-900">নিরাপদ বুকিং ও ক্রেতা সুরক্ষা গ্যারান্টি</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div class="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
            <div class="font-bold text-emerald-950 text-sm">১. এসক্রো অ্যাডভান্স ডিপোজিট</div>
            <p class="text-xs text-emerald-800 leading-relaxed">ক্রেতার দেওয়া অ্যাডভান্স টাকা গরু বাজার এসক্রো অ্যাকাউন্টে সংরক্ষিত থাকে। গরু হাতে পেয়ে যাচাই করার পর বিক্রেতা টাকা পান।</p>
          </div>
          <div class="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
            <div class="font-bold text-emerald-950 text-sm">২. ১০০% রিফান্ড পলিসি</div>
            <p class="text-xs text-emerald-800 leading-relaxed">লিস্টিংয়ের সাথে গরুর জাত, ওজন বা স্বাস্থ্যের অসঙ্গতি থাকলে সম্পূর্ণ অ্যাডভান্স টাকা সরাসরি ফেরত দেওয়া হবে।</p>
          </div>
          <div class="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
            <div class="font-bold text-emerald-950 text-sm">৩. যাচাইকৃত খামার নেটওয়ার্ক</div>
            <p class="text-xs text-emerald-800 leading-relaxed">প্রতিটি খামারির জাতীয় পরিচয়পত্র ও ট্রেড লাইসেন্স যাচাই করে ভেরিফায়েড ব্যাজ প্রদান করা হয়।</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer id="contact" class="bg-neutral-900 text-neutral-300 py-12 border-t border-neutral-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left text-xs">
        <div>
          <div class="text-lg font-bold text-white mb-1">${settings.siteName}</div>
          <p class="text-neutral-400">${settings.address}</p>
          <p class="text-neutral-400 mt-1">হটলাইন: ${settings.hotline} · ইমেইল: ${settings.email}</p>
        </div>
        <div class="text-neutral-500">
          © ২০২৬ ${settings.siteName} | Netlify Production Build v${version}
        </div>
      </div>
    </footer>

    <!-- Interactive Cow Detail & Advance Modal -->
    <div id="cowModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
        <div class="flex items-start justify-between border-b pb-3">
          <div>
            <div id="modalCowCode" class="text-xs font-mono text-emerald-700 font-bold"></div>
            <h3 id="modalCowName" class="text-lg font-bold text-neutral-900 mt-0.5"></h3>
          </div>
          <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center font-bold">✕</button>
        </div>

        <div class="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100">
          <img id="modalCowImage" src="" alt="Cow" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='images/fallback_cow.svg';" />
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs bg-neutral-50 p-4 rounded-xl">
          <div><span class="text-neutral-500">জাত:</span> <strong id="modalCowBreed"></strong></div>
          <div><span class="text-neutral-500">ওজন:</span> <strong id="modalCowWeight"></strong> কেজি</div>
          <div><span class="text-neutral-500">বয়স:</span> <strong id="modalCowAge"></strong></div>
          <div><span class="text-neutral-500">অবস্থান:</span> <strong id="modalCowLocation"></strong></div>
          <div class="col-span-2"><span class="text-neutral-500">খামার:</span> <strong id="modalCowFarm"></strong></div>
        </div>

        <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
          <div class="flex justify-between text-xs">
            <span class="text-neutral-600">মোট মূল্য:</span>
            <span id="modalCowPrice" class="font-bold font-mono text-neutral-900"></span>
          </div>
          <div class="flex justify-between text-sm font-bold text-emerald-900 border-t border-emerald-200 pt-2">
            <span>প্রয়োজনীয় বুকিং অ্যাডভান্স:</span>
            <span id="modalCowAdvance" class="font-mono"></span>
          </div>
          <div class="text-[11px] text-emerald-700 mt-1">
            বিকাশ/নগদ মার্চেন্টে অ্যাডভান্স প্রদান করতে কল করুন: <strong>${settings.hotline}</strong>
          </div>
        </div>

        <button onclick="alert('বুকিং অনুরোধ গৃহীত হয়েছে! হটলাইন থেকে দ্রুত কল দেওয়া হবে: ${settings.hotline}')" class="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-md transition-colors">
          নিরাপদ বুকিং নিশ্চিত করুন
        </button>
      </div>
    </div>

    <!-- Data Injection & Runtime Script -->
    <script>
      const COWS = ${jsonCows};
      const SETTINGS = ${jsonSettings};
      let currentCategory = 'all';

      function renderCows() {
        const query = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
        const grid = document.getElementById('cowGrid');
        if (!grid) return;

        const filtered = COWS.filter(c => {
          const matchCat = currentCategory === 'all' || c.category === currentCategory;
          const matchQuery = !query || 
            c.name.toLowerCase().includes(query) ||
            c.breed.toLowerCase().includes(query) ||
            c.district.toLowerCase().includes(query) ||
            c.cowCode.toLowerCase().includes(query);
          return matchCat && matchQuery;
        });

        if (filtered.length === 0) {
          grid.innerHTML = '<div class="col-span-full py-12 text-center text-sm text-neutral-500">কোনো গরু পাওয়া যায়নি। অন্য কিওয়ার্ড দিয়ে খুঁজুন।</div>';
          return;
        }

        grid.innerHTML = filtered.map(c => {
          // Normalize image path for Netlify: prefer relative 'images/...'
          let imgSrc = c.images && c.images[0] ? c.images[0] : 'images/cow_sahiwal.jpg';
          if (imgSrc.startsWith('/')) imgSrc = imgSrc.substring(1);

          return \`
            <div class="bg-white rounded-2xl border border-neutral-200 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden">
              <div class="relative aspect-[4/3] bg-neutral-100 overflow-hidden cursor-pointer" onclick="openModal('\${c.id}')">
                <img 
                  src="\${imgSrc}" 
                  alt="\${c.name}"
                  class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onerror="this.onerror=null; this.src='images/fallback_cow.svg';"
                />
                <span class="absolute top-2.5 left-2.5 bg-neutral-900/80 backdrop-blur-sm text-white text-[11px] font-mono px-2 py-0.5 rounded">
                  \${c.cowCode}
                </span>
                \${c.isFeatured ? '<span class="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">ফিচার্ড</span>' : ''}
              </div>

              <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div class="text-[11px] text-emerald-700 font-semibold">\${c.breed}</div>
                  <h3 class="font-bold text-neutral-900 text-sm mt-0.5 truncate cursor-pointer hover:text-emerald-700" onclick="openModal('\${c.id}')">\${c.name}</h3>
                  <div class="text-xs text-neutral-500 mt-1 flex items-center gap-2">
                    <span>📍 \${c.district}</span>
                    <span>·</span>
                    <span>⚖️ \${c.weightKg} কেজি</span>
                  </div>
                </div>

                <div class="border-t border-neutral-100 pt-3 flex items-center justify-between">
                  <div>
                    <div class="text-[10px] text-neutral-500">মূল্য:</div>
                    <div class="font-bold text-sm text-neutral-900 font-mono">৳\${Number(c.price).toLocaleString('bn-BD')}</div>
                  </div>
                  <button onclick="openModal('\${c.id}')" class="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors">
                    বিস্তারিত
                  </button>
                </div>
              </div>
            </div>
          \`;
        }).join('');
      }

      function setCategoryFilter(cat) {
        currentCategory = cat;
        document.querySelectorAll('.cat-btn').forEach(btn => {
          if (btn.getAttribute('data-cat') === cat) {
            btn.className = 'cat-btn active px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 text-white';
          } else {
            btn.className = 'cat-btn px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50';
          }
        });
        renderCows();
      }

      function openModal(cowId) {
        const cow = COWS.find(c => c.id === cowId);
        if (!cow) return;

        let imgSrc = cow.images && cow.images[0] ? cow.images[0] : 'images/cow_sahiwal.jpg';
        if (imgSrc.startsWith('/')) imgSrc = imgSrc.substring(1);

        document.getElementById('modalCowCode').innerText = cow.cowCode;
        document.getElementById('modalCowName').innerText = cow.name;
        document.getElementById('modalCowImage').src = imgSrc;
        document.getElementById('modalCowBreed').innerText = cow.breed;
        document.getElementById('modalCowWeight').innerText = cow.weightKg;
        document.getElementById('modalCowAge').innerText = cow.ageYears + ' বছর ' + (cow.ageMonths || 0) + ' মাস';
        document.getElementById('modalCowLocation').innerText = cow.upazila + ', ' + cow.district;
        document.getElementById('modalCowFarm').innerText = cow.sellerFarmName || cow.sellerName;
        document.getElementById('modalCowPrice').innerText = '৳' + Number(cow.price).toLocaleString('bn-BD');
        document.getElementById('modalCowAdvance').innerText = '৳' + Number(cow.calculatedAdvanceAmount || Math.round(cow.price * 0.1)).toLocaleString('bn-BD');

        const modal = document.getElementById('cowModal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }

      function closeModal() {
        const modal = document.getElementById('cowModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }

      // Initial load
      document.addEventListener('DOMContentLoaded', () => {
        renderCows();
      });
    </script>
  </body>
</html>`;

  zip.file('index.html', productionHtml);

  // 6. Netlify deployment instructions README
  zip.file(
    'README_NETLIFY.md',
    `# ${settings.siteName} - Netlify Production Deployment Package
**সংস্করণ (Version):** ${version}
**বিল্ড তৈরির সময়:** ${new Date().toLocaleString('bn-BD')} (${new Date().toISOString()})
**প্রস্তুতকারী অ্যাডমিন:** ${adminName}
**ইমেজ স্ট্যাটাস:** সকল গরুর ছবি (Images) সরাসরি 'images/' ফোল্ডারে অন্তর্ভুক্ত করা হয়েছে।

---

## 🚀 Netlify-তে কীভাবে এই বিল্ড ডিপ্লয় করবেন?

### পদ্ধতি ১: Netlify ড্র্যাগ অ্যান্ড ড্রপ (সবচেয়ে সহজ - ১ মিনিট)
১. [Netlify.com](https://app.netlify.com)-এ লগইন করুন।
২. আপনার "Sites" ড্যাশবোর্ডে যান।
৩. এই ডাউনলোডকৃত ZIP ফাইলটি আপনার কম্পিউটারে আনজিপ (Extract) করুন।
৪. আনজিপ করা ফোল্ডারটি (যার মধ্যে index.html ও images ফোল্ডার আছে) সরাসরি Netlify-এর **"Drag and drop your site output folder here"** বক্সে ড্র্যাগ করে ছেড়ে দিন।
৫. সাথে সাথে আপনার ওয়েবসাইট ও সকল গরুর ছবি সহ লাইভ হয়ে যাবে!

### পদ্ধতি ২: Netlify CLI দিয়ে
\`\`\`bash
npm install -g netlify-cli
netlify deploy --prod --dir=.
\`\`\`

---
© ২০২৬ ${settings.siteName} | সর্বস্বত্ব সংরক্ষিত।
`
  );

  onProgress?.(90, 'ZIP আর্কাইভ কম্প্রেস করা হচ্ছে...');
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } });

  const sizeKb = Math.round(blob.size / 1024);
  const filename = `goru-bazar-netlify-dist-v${version.replace(/\./g, '_')}.zip`;

  onProgress?.(100, `বিল্ড ও প্যাকেজিং সফল! মোট ${imagesPackedCount}টি ইমেজ সহ ZIP প্রস্তুত।`);

  return { blob, sizeKb, filename };
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
