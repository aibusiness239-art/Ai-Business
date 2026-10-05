// High-fidelity fallback SVG cattle & farm illustrations as data URIs
// Ensures NO image ever shows broken icon in Netlify DIST, local, or production

export const FALLBACK_COW_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="50%" stop-color="#047857" />
      <stop offset="100%" stop-color="#022c22" />
    </linearGradient>
    <linearGradient id="cowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <circle cx="400" cy="270" r="160" fill="#ffffff" opacity="0.08"/>
  <circle cx="400" cy="270" r="130" fill="#ffffff" opacity="0.06"/>
  <!-- Stylized Bull / Cow Silhouette -->
  <g transform="translate(240, 160) scale(1.1)" fill="#ffffff" opacity="0.92">
    <path d="M 70 120 C 60 90, 80 50, 110 50 C 130 50, 140 70, 150 90 C 180 80, 220 85, 250 110 C 270 125, 280 150, 275 180 C 265 200, 245 220, 230 225 L 230 290 C 230 300, 210 300, 210 290 L 210 230 C 190 230, 160 235, 140 230 L 140 290 C 140 300, 120 300, 120 290 L 120 220 C 95 210, 80 190, 75 160 Z" />
    <!-- Horns -->
    <path d="M 85 75 C 65 40, 45 45, 40 60 C 50 75, 75 80, 85 85 Z" fill="#fef3c7"/>
    <path d="M 125 70 C 145 35, 165 40, 170 55 C 160 70, 135 75, 125 80 Z" fill="#fef3c7"/>
  </g>
  <text x="400" y="470" font-family="'Hind Siliguri', sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="1">
    গরু বাজার · প্রিমিয়াম গবাদিপশু
  </text>
  <text x="400" y="505" font-family="'Hind Siliguri', sans-serif" font-size="16" fill="#a7f3d0" text-anchor="middle">
    ১০০% বিশ্বস্ত খামার ও নিরাপদ বুকিং
  </text>
</svg>
`)}`;

export const FALLBACK_HERO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="100%" height="100%">
  <defs>
    <linearGradient id="heroBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="40%" stop-color="#047857" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#heroBg)"/>
  <circle cx="600" cy="300" r="260" fill="#ffffff" opacity="0.05"/>
  <circle cx="600" cy="300" r="180" fill="#ffffff" opacity="0.04"/>
  <text x="600" y="290" font-family="'Hind Siliguri', sans-serif" font-size="52" font-weight="bold" fill="#ffffff" text-anchor="middle">
    গরু বাজার (Goru Bazar)
  </text>
  <text x="600" y="350" font-family="'Hind Siliguri', sans-serif" font-size="24" fill="#a7f3d0" text-anchor="middle">
    বাংলাদেশের প্রথম ও বিশ্বস্ত আধুনিক ডিজিটাল গবাদিপশু মার্কেটপ্লেস
  </text>
  <text x="600" y="400" font-family="'Hind Siliguri', sans-serif" font-size="18" fill="#d1fae5" text-anchor="middle">
    যাচাইকৃত খামারি · এসক্রো অ্যাডভান্স পেমেন্ট · কোরবানি ও ডেইরি ক্যাটল
  </text>
</svg>
`)}`;

/**
 * Normalizes image paths so they work both locally, in subpaths, and in Netlify DIST.
 */
export function getSafeImageUrl(imgUrl?: string, isHero = false): string {
  if (!imgUrl || typeof imgUrl !== 'string' || imgUrl.trim() === '') {
    return isHero ? FALLBACK_HERO_SVG : FALLBACK_COW_SVG;
  }
  const clean = imgUrl.trim();
  // If already absolute URL or data URI
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return clean;
  }
  // Ensure starts with /
  if (clean.startsWith('/')) {
    return clean;
  }
  return `/${clean}`;
}
