import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Cow,
  User,
  Order,
  PaymentRecord,
  SubscriptionPlan,
  OrderStatus,
  BuildHistoryRecord,
} from '../types';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Package,
  ShoppingBag,
  CreditCard,
  Crown,
  Settings,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Search,
  Filter,
  Trash2,
  Edit,
  ExternalLink,
  Plus,
  Play,
  Check,
  RefreshCw,
} from 'lucide-react';
import { generateNetlifyDistZip, triggerDownload } from '../utils/distBuilder';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    cows,
    orders,
    payments,
    plans,
    auditLogs,
    settings,
    buildHistory,
    approveCow,
    toggleFeaturedCow,
    deleteCow,
    verifySeller,
    toggleUserStatus,
    updateOrderStatus,
    updateSubscriptionPlan,
    createSubscriptionPlan,
    deleteSubscriptionPlan,
    updateSettings,
    addBuildRecord,
    changeAdminCredentials,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'users'
    | 'sellers'
    | 'cows'
    | 'orders'
    | 'payments'
    | 'plans'
    | 'settings'
    | 'audit'
    | 'build'
  >('overview');

  // Search/Filter states
  const [cowFilter, setCowFilter] = useState<'all' | 'pending' | 'approved' | 'featured'>('all');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  // Dist build states
  const [buildVersion, setBuildVersion] = useState('1.0.2');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildStepName, setBuildStepName] = useState('');
  const [lastBuiltBlob, setLastBuiltBlob] = useState<{ blob: Blob; filename: string; sizeKb: number } | null>(null);

  // Settings form states
  const [siteSettingsForm, setSiteSettingsForm] = useState(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Admin Credentials form state (Requirement: change admin username and password)
  const [adminNewUsername, setAdminNewUsername] = useState(settings.adminUsername || 'admin');
  const [adminCurrentPassword, setAdminCurrentPassword] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [credFeedback, setCredFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Plan form modal/state
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isNewPlanOpen, setIsNewPlanOpen] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState<SubscriptionPlan>({
    id: `plan-${Date.now()}`,
    name: 'Custom Package',
    nameBn: 'কাস্টম প্যাকেজ',
    price: 1500,
    durationDays: 60,
    listingLimit: 15,
    featuredSlots: 3,
    isPrioritySupport: true,
    isFreePackage: false,
    features: ['১৫টি গরু লিস্টিং', '৬০ দিন মেয়াদ', '৩টি ফিচার্ড স্লট', 'অগ্রাধিকার সাপোর্ট'],
    isActive: true,
  });

  // Analytics Computations
  const totalCows = cows.length;
  const pendingCows = cows.filter((c) => c.status === 'pending');
  const totalBuyers = users.filter((u) => u.role === 'buyer').length;
  const totalSellers = users.filter((u) => u.role === 'seller').length;
  const pendingSellers = users.filter((u) => u.role === 'seller' && u.sellerProfile?.verificationStatus === 'pending');
  
  const totalAdvanceCollected = payments
    .filter((p) => p.paymentType === 'advance' && p.status === 'verified')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalSubRevenue = payments
    .filter((p) => p.paymentType === 'subscription' && p.status === 'verified')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalMarketVolume = cows
    .filter((c) => c.status === 'approved')
    .reduce((sum, c) => sum + c.price, 0);

  // Build Dist Netlify Execution
  const handleStartBuild = async () => {
    setIsBuilding(true);
    setBuildProgress(5);
    setBuildStepName('প্রস্তুতি চলছে...');
    setLastBuiltBlob(null);

    try {
      const res = await generateNetlifyDistZip({
        version: buildVersion,
        adminName: currentUser ? currentUser.name : 'Super Admin',
        settings,
        cows,
        plans,
        onProgress: (pct, msg) => {
          setBuildProgress(pct);
          setBuildStepName(msg);
        },
      });

      setLastBuiltBlob(res);

      const record: BuildHistoryRecord = {
        id: `build-${Date.now()}`,
        version: buildVersion,
        buildDate: new Date().toLocaleString('bn-BD'),
        adminName: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Super Admin',
        status: 'success',
        zipSizeKb: res.sizeKb,
        totalFiles: 54,
        targetPlatform: 'Netlify SPA Production',
      };
      addBuildRecord(record);
    } catch (err) {
      console.error(err);
      setBuildStepName('বিল্ডে ত্রুটি ঘটেছে');
    } finally {
      setIsBuilding(false);
    }
  };

  const handleDownloadDist = () => {
    if (lastBuiltBlob) {
      triggerDownload(lastBuiltBlob.blob, lastBuiltBlob.filename);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(siteSettingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleUpdateAdminCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredFeedback(null);

    const targetUser = adminNewUsername.trim();
    if (!targetUser) {
      setCredFeedback({ type: 'error', message: 'নতুন অ্যাডমিন ইউজারনেম ফাঁকা রাখা যাবে না।' });
      return;
    }
    if (!adminCurrentPassword) {
      setCredFeedback({ type: 'error', message: 'নিরাপত্তার স্বার্থে অনুগ্রহ করে বর্তমান পাসওয়ার্ড দিন।' });
      return;
    }
    if (!adminNewPassword || adminNewPassword.length < 4) {
      setCredFeedback({ type: 'error', message: 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' });
      return;
    }
    if (adminNewPassword !== adminConfirmPassword) {
      setCredFeedback({ type: 'error', message: 'নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড দুটি হুবহু এক হতে হবে।' });
      return;
    }

    const res = changeAdminCredentials(targetUser, adminNewPassword, adminCurrentPassword);
    if (res.success) {
      setCredFeedback({ type: 'success', message: `${res.message} নতুন ইউজারনেম: "${targetUser}"` });
      setAdminCurrentPassword('');
      setAdminNewPassword('');
      setAdminConfirmPassword('');
      // Update form representation
      setSiteSettingsForm((prev) => ({
        ...prev,
        adminUsername: targetUser,
        adminPassword: adminNewPassword,
      }));
    } else {
      setCredFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Top Banner with Admin Context */}
      <div className="bg-neutral-900 text-white rounded-2xl p-6 shadow-lg mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">সেন্ট্রাল কন্ট্রোল প্যানেল</span>
          </div>
          <h1 className="text-xl font-bold mt-1">গরু বাজার অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            লগইন রয়েছেন: <strong className="text-emerald-400">{currentUser?.name}</strong> ({currentUser?.role})
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('build')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Netlify DIST বিল্ড ও ডাউনলোড</span>
          </button>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-1.5 border-b border-neutral-200 mb-6 overflow-x-auto scrollbar-none pb-2">
        {[
          { key: 'overview', label: 'ওভারভিউ', icon: LayoutDashboard },
          { key: 'cows', label: `গরু ব্যবস্থাপনা (${pendingCows.length ? `! ${pendingCows.length}` : cows.length})`, icon: Package },
          { key: 'sellers', label: `খামারি যাচাই (${pendingSellers.length})`, icon: ShieldCheck },
          { key: 'orders', label: `অর্ডারসমূহ (${orders.length})`, icon: ShoppingBag },
          { key: 'payments', label: `পেমেন্ট ও রাজস্ব`, icon: CreditCard },
          { key: 'users', label: `ব্যবহারকারী (${users.length})`, icon: Users },
          { key: 'plans', label: `সাবস্ক্রিপশন প্যাকেজ`, icon: Crown },
          { key: 'settings', label: `সাইট সেটিংস`, icon: Settings },
          { key: 'audit', label: `অডিট লগ`, icon: FileText },
          { key: 'build', label: `Netlify DIST বিল্ডার`, icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
              <div className="text-xs text-neutral-500">মোট সংগৃহীত বুকিং অ্যাডভান্স</div>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                ৳ {totalAdvanceCollected.toLocaleString('bn-BD')}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">এসক্রো হেফাজতে সংরক্ষিত</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
              <div className="text-xs text-neutral-500">সাবস্ক্রিপশন বাবদ আয়</div>
              <div className="text-2xl font-bold font-mono text-neutral-900 mt-1">
                ৳ {totalSubRevenue.toLocaleString('bn-BD')}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">খামারি প্যাকেজ ক্রয় থেকে</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
              <div className="text-xs text-neutral-500">সক্রিয় গরুর মূল্যমান</div>
              <div className="text-2xl font-bold font-mono text-neutral-900 mt-1">
                ৳ {(totalMarketVolume / 100000).toFixed(1)} লাখ
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">{totalCows}টি গরু তালিকাভুক্ত</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
              <div className="text-xs text-neutral-500">অনুমোদন অপেক্ষমান গরু</div>
              <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
                {pendingCows.length}টি
              </div>
              <div className="text-[11px] text-amber-700 mt-1">দ্রুত রিভিউ প্রয়োজন</div>
            </div>
          </div>

          {/* Quick Tasks & Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pending Approvals */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>অনুমোদন অপেক্ষমান গরু ({pendingCows.length})</span>
                </h3>
                <button onClick={() => setActiveTab('cows')} className="text-xs text-emerald-700 font-semibold hover:underline">
                  সকল গরু
                </button>
              </div>

              <div className="space-y-3">
                {pendingCows.length > 0 ? (
                  pendingCows.map((c) => (
                    <div key={c.id} className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <img src={c.images[0]} alt={c.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <div className="font-bold text-neutral-900">{c.name} ({c.cowCode})</div>
                          <div className="text-neutral-500">খামারি: {c.sellerFarmName} ({c.sellerPhone})</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => approveCow(c.id, true)}
                          className="px-2.5 py-1 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800"
                        >
                          অনুমোদন
                        </button>
                        <button
                          onClick={() => approveCow(c.id, false)}
                          className="px-2.5 py-1 bg-neutral-200 text-neutral-700 rounded-lg font-semibold hover:bg-red-50 hover:text-red-700"
                        >
                          বাতিল
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-neutral-500">
                    কোনো অপেক্ষমান গরু নেই। সকল লিস্টিং অনুমোদিত!
                  </div>
                )}
              </div>
            </div>

            {/* Pending Seller Verifications */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>খামারি ভেরিফিকেশন আবেদন ({pendingSellers.length})</span>
                </h3>
                <button onClick={() => setActiveTab('sellers')} className="text-xs text-emerald-700 font-semibold hover:underline">
                  সকল খামারি
                </button>
              </div>

              <div className="space-y-3">
                {pendingSellers.length > 0 ? (
                  pendingSellers.map((s) => (
                    <div key={s.id} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-neutral-900">{s.sellerProfile?.farmName}</div>
                        <div className="text-neutral-500">মালিক: {s.name} · মোবাইল: {s.phone}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">NID: {s.sellerProfile?.nidNumber || 'প্রদত্ত নয়'}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => verifySeller(s.id, true)}
                          className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                        >
                          ভেরিফাই
                        </button>
                        <button
                          onClick={() => verifySeller(s.id, false)}
                          className="px-2.5 py-1 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300"
                        >
                          বাতিল
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-neutral-500">
                    কোনো নতুন ভেরিফিকেশন আবেদন পেন্ডিং নেই।
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: COW MANAGEMENT */}
      {activeTab === 'cows' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-neutral-900">সকল গরু ও লিস্টিং ব্যবস্থাপনা ({cows.length})</h2>
            
            <div className="flex items-center gap-2">
              <select
                value={cowFilter}
                onChange={(e) => setCowFilter(e.target.value as any)}
                className="text-xs p-2 border border-neutral-300 rounded-lg bg-white"
              >
                <option value="all">সকল গরু</option>
                <option value="pending">অনুমোদন পেন্ডিং</option>
                <option value="approved">অনুমোদিত</option>
                <option value="featured">ফিচার্ড গরু</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-700 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="p-3">কোড ও নাম</th>
                  <th className="p-3">জাত ও বয়স</th>
                  <th className="p-3">মূল্য ও বুকিং অ্যাডভান্স</th>
                  <th className="p-3">খামারি ও জেলা</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3">ফিচার্ড</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {cows
                  .filter((c) => {
                    if (cowFilter === 'pending') return c.status === 'pending';
                    if (cowFilter === 'approved') return c.status === 'approved';
                    if (cowFilter === 'featured') return c.isFeatured;
                    return true;
                  })
                  .map((cow) => (
                    <tr key={cow.id} className="hover:bg-neutral-50/50">
                      <td className="p-3 flex items-center gap-2.5">
                        <img src={cow.images[0]} alt={cow.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <div className="font-bold text-neutral-900">{cow.name}</div>
                          <div className="text-[11px] text-neutral-400 font-mono">{cow.cowCode}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>{cow.breed}</div>
                        <div className="text-[11px] text-neutral-500">{cow.gender} · {cow.ageYears} বছর</div>
                      </td>
                      <td className="p-3 font-mono">
                        <div className="font-bold text-neutral-900">৳{cow.price.toLocaleString('bn-BD')}</div>
                        <div className="text-[11px] text-emerald-700">Adv: ৳{cow.calculatedAdvanceAmount.toLocaleString('bn-BD')}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-neutral-900">{cow.sellerFarmName}</div>
                        <div className="text-[11px] text-neutral-500">{cow.district} · {cow.sellerPhone}</div>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          cow.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : cow.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {cow.status === 'approved' ? 'অনুমোদিত' : cow.status === 'pending' ? 'পেন্ডিং' : 'বাতিল'}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleFeaturedCow(cow.id)}
                          className={`text-xs px-2 py-0.5 rounded font-medium border ${
                            cow.isFeatured
                              ? 'bg-amber-500 text-white border-amber-600'
                              : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                          }`}
                        >
                          {cow.isFeatured ? '★ ফিচার্ড' : '+ ফিচার্ড করুন'}
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        {cow.status === 'pending' ? (
                          <button
                            onClick={() => approveCow(cow.id, true)}
                            className="px-2 py-1 bg-emerald-700 text-white rounded font-semibold text-[11px]"
                          >
                            অনুমোদন
                          </button>
                        ) : (
                          <button
                            onClick={() => approveCow(cow.id, false)}
                            className="px-2 py-1 bg-neutral-200 text-neutral-700 rounded text-[11px] hover:bg-red-50 hover:text-red-700"
                          >
                            বাতিল
                          </button>
                        )}
                        <button
                          onClick={() => deleteCow(cow.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SELLER VERIFICATION */}
      {activeTab === 'sellers' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200">
            <h2 className="text-sm font-bold text-neutral-900">খামারি ও সেলার তালিকা এবং ভেরিফিকেশন</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-700 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="p-3">খামারের নাম ও মালিক</th>
                  <th className="p-3">মোবাইল ও ইমেইল</th>
                  <th className="p-3">অবস্থান</th>
                  <th className="p-3">ট্রেড লাইসেন্স ও NID</th>
                  <th className="p-3">লিস্টিং ব্যবহার</th>
                  <th className="p-3">ভেরিফিকেশন স্ট্যাটাস</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users
                  .filter((u) => u.role === 'seller')
                  .map((s) => (
                    <tr key={s.id} className="hover:bg-neutral-50/50">
                      <td className="p-3 font-medium text-neutral-900">
                        <div className="font-bold">{s.sellerProfile?.farmName}</div>
                        <div className="text-neutral-500">{s.name}</div>
                      </td>
                      <td className="p-3 font-mono">
                        <div>{s.phone}</div>
                        <div className="text-[11px] text-neutral-400">{s.email}</div>
                      </td>
                      <td className="p-3">{s.district}</td>
                      <td className="p-3 font-mono text-[11px]">
                        <div>NID: {s.sellerProfile?.nidNumber || 'তথ্য নেই'}</div>
                        <div>TRAD: {s.sellerProfile?.tradeLicenseNumber || 'তথ্য নেই'}</div>
                      </td>
                      <td className="p-3 font-mono">
                        {s.sellerProfile?.currentListingsCount || 0} / {s.sellerProfile?.totalListingsAllowed || 1}টি
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          s.sellerProfile?.isVerified
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {s.sellerProfile?.isVerified ? 'যাচাইকৃত (Verified)' : 'অপেক্ষমান'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {s.sellerProfile?.isVerified ? (
                          <button
                            onClick={() => verifySeller(s.id, false)}
                            className="px-2 py-1 bg-neutral-200 text-neutral-700 rounded text-[11px]"
                          >
                            বাতিল করুন
                          </button>
                        ) : (
                          <button
                            onClick={() => verifySeller(s.id, true)}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-semibold"
                          >
                            অনুমোদন দিন
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ORDER & ADVANCE MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900">ক্রেতা অর্ডার ও অ্যাডভান্স ট্র্যাকিং ({orders.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-700 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="p-3">অর্ডার নং</th>
                  <th className="p-3">গরু ও কোড</th>
                  <th className="p-3">ক্রেতার তথ্য</th>
                  <th className="p-3">খামারি</th>
                  <th className="p-3">বুকিং অ্যাডভান্স</th>
                  <th className="p-3">বর্তমান স্ট্যাটাস</th>
                  <th className="p-3 text-right">স্ট্যাটাস পরিবর্তন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-neutral-50/50">
                    <td className="p-3 font-mono font-bold text-neutral-900">{ord.orderNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-neutral-900">{ord.cowName}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{ord.cowCode}</div>
                    </td>
                    <td className="p-3">
                      <div>{ord.buyerName}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{ord.buyerPhone}</div>
                    </td>
                    <td className="p-3">
                      <div>{ord.sellerFarmName}</div>
                      <div className="text-[11px] text-neutral-400">{ord.sellerPhone}</div>
                    </td>
                    <td className="p-3 font-mono">
                      <div className="font-bold text-emerald-700">৳{ord.advanceAmount.toLocaleString('bn-BD')}</div>
                      <div className="text-[11px] text-neutral-400">মোট: ৳{ord.cowTotalAmount.toLocaleString('bn-BD')}</div>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className="text-xs p-1 border border-neutral-300 rounded bg-white"
                      >
                        <option value="advance_paid">Advance Paid</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="ready_for_delivery">Ready for Delivery</option>
                        <option value="completed">Completed</option>
                        <option value="refunded">Refunded</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PAYMENTS & REVENUE */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200">
            <h2 className="text-sm font-bold text-neutral-900">সকল লেনদেন ও পেমেন্ট রেকর্ড ({payments.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-700 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="p-3">লেনদেন আইডি (Txn ID)</th>
                  <th className="p-3">ধরন</th>
                  <th className="p-3">ব্যবহারকারী</th>
                  <th className="p-3">পরিমাণ</th>
                  <th className="p-3">মাধ্যম</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3">তারিখ ও সময়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/50">
                    <td className="p-3 font-mono font-bold text-neutral-900">{p.transactionId}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        p.paymentType === 'advance' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {p.paymentType === 'advance' ? 'বুকিং অ্যাডভান্স' : 'সাবস্ক্রিপশন'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-neutral-900">{p.userName}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{p.userPhone}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-neutral-900">
                      ৳ {p.amount.toLocaleString('bn-BD')}
                    </td>
                    <td className="p-3">
                      <div className="uppercase font-mono font-bold text-neutral-800">{p.method}</div>
                      {p.notes && (
                        <div className="text-[10px] text-neutral-500 max-w-xs truncate mt-0.5" title={p.notes}>
                          {p.notes}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-neutral-500">{p.verifiedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SUBSCRIPTION PLANS MANAGEMENT */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900">সাবস্ক্রিপশন প্যাকেজ ম্যানেজমেন্ট</h2>
            <button
              onClick={() => setIsNewPlanOpen(!isNewPlanOpen)}
              className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন প্যাকেজ তৈরি করুন</span>
            </button>
          </div>

          {/* Form to create new plan if opened */}
          {isNewPlanOpen && (
            <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-4 text-xs">
              <h3 className="font-bold text-neutral-900 text-sm">নতুন সাবস্ক্রিপশন প্যাকেজ ফর্ম</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">প্যাকেজের বাংলা নাম:</label>
                  <input
                    type="text"
                    value={newPlanForm.nameBn}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, nameBn: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">মূল্য (টাকা):</label>
                  <input
                    type="number"
                    value={newPlanForm.price}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, price: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">মেয়াদ (দিন):</label>
                  <input
                    type="number"
                    value={newPlanForm.durationDays}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, durationDays: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">লিস্টিং সীমা (গরুর সংখ্যা):</label>
                  <input
                    type="number"
                    value={newPlanForm.listingLimit}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, listingLimit: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">ফিচার্ড স্লট:</label>
                  <input
                    type="number"
                    value={newPlanForm.featuredSlots}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, featuredSlots: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPlanOpen(false)}
                  className="px-3 py-1.5 border rounded-lg text-neutral-600"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={() => {
                    createSubscriptionPlan({ ...newPlanForm, id: `plan-${Date.now()}` });
                    setIsNewPlanOpen(false);
                  }}
                  className="px-4 py-1.5 bg-emerald-700 text-white rounded-lg font-semibold"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-neutral-900">{p.nameBn}</span>
                  <button
                    onClick={() => deleteSubscriptionPlan(p.id)}
                    className="text-neutral-400 hover:text-red-600 p-1"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xl font-bold font-mono text-emerald-800">
                  ৳ {p.price.toLocaleString('bn-BD')}
                </div>

                <div className="text-xs text-neutral-600 space-y-1">
                  <div>মেয়াদ: <strong className="font-mono">{p.durationDays} দিন</strong></div>
                  <div>লিস্টিং সীমা: <strong className="font-mono text-emerald-700">{p.listingLimit}টি গরু</strong></div>
                  <div>ফিচার্ড স্লট: <strong className="font-mono">{p.featuredSlots}টি</strong></div>
                </div>

                <div className="pt-2 border-t border-neutral-100">
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">মূল্য পরিবর্তন:</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      defaultValue={p.price}
                      onBlur={(e) => updateSubscriptionPlan(p.id, { price: Number(e.target.value) })}
                      className="w-full text-xs p-1.5 border rounded-lg font-mono"
                    />
                    <span className="text-xs text-neutral-500">টাকা</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900">ব্যবহারকারী ও রোল ম্যানেজমেন্ট ({users.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-700 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="p-3">নাম</th>
                  <th className="p-3">মোবাইল</th>
                  <th className="p-3">ইমেইল</th>
                  <th className="p-3">রোল</th>
                  <th className="p-3">জেলা</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">ব্লক / আনব্লক</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/50">
                    <td className="p-3 font-bold text-neutral-900">{u.name}</td>
                    <td className="p-3 font-mono">{u.phone}</td>
                    <td className="p-3 font-mono">{u.email}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">{u.district || 'ঢাকা'}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`px-2 py-1 rounded text-[11px] font-medium ${
                          u.status === 'active' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        {u.status === 'active' ? 'ব্লক করুন' : 'সক্রিয় করুন'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: SITE SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 max-w-3xl shadow-sm">
          <h2 className="text-base font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
            মার্কেটপ্লেস ও অ্যাডভান্স পেমেন্ট রুলস সেটিংস
          </h2>

          {settingsSaved && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">ওয়েবসাইটের নাম:</label>
                <input
                  type="text"
                  value={siteSettingsForm.siteName}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, siteName: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">হটলাইন নম্বর:</label>
                <input
                  type="text"
                  value={siteSettingsForm.hotline}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, hotline: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ডিফল্ট বুকিং অ্যাডভান্স হার (%):</label>
                <input
                  type="number"
                  value={siteSettingsForm.defaultAdvancePercentage}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, defaultAdvancePercentage: Number(e.target.value) })}
                  className="w-full p-2.5 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">নতুন খামারির ফ্রি লিস্টিং সংখ্যা:</label>
                <input
                  type="number"
                  value={siteSettingsForm.freeListingLimit}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, freeListingLimit: Number(e.target.value) })}
                  className="w-full p-2.5 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-emerald-900">
                  অ্যাডমিন বিকাশ নম্বর (টাকা গ্রহণের বিকাশ নম্বর):
                </label>
                <input
                  type="text"
                  value={siteSettingsForm.bkashNumber}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, bkashNumber: e.target.value })}
                  placeholder="যেমন: ০১৭১১-৮৮৯৯০০ (মার্চেন্ট/পার্সোনাল)"
                  className="w-full p-2.5 border rounded-xl font-mono bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-emerald-900">
                  অ্যাডমিন নগদ নম্বর (টাকা গ্রহণের নগদ নম্বর):
                </label>
                <input
                  type="text"
                  value={siteSettingsForm.nagadNumber}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, nagadNumber: e.target.value })}
                  placeholder="যেমন: ০১৭২২-৩৩৪৪৫৫ (মার্চেন্ট/পার্সোনাল)"
                  className="w-full p-2.5 border rounded-xl font-mono bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-emerald-900">
                  অ্যাডমিন রকেট নম্বর (টাকা গ্রহণের রকেট নম্বর):
                </label>
                <input
                  type="text"
                  value={siteSettingsForm.rocketNumber}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, rocketNumber: e.target.value })}
                  placeholder="যেমন: ০১৯১১-২২৩৩৪৪-৮ (মার্চেন্ট/পার্সোনাল)"
                  className="w-full p-2.5 border rounded-xl font-mono bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-emerald-900">
                  অ্যাডমিন ব্যাংক অ্যাকাউন্ট ও ব্রাঞ্চ তথ্য:
                </label>
                <input
                  type="text"
                  value={siteSettingsForm.bankAccountDetails}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, bankAccountDetails: e.target.value })}
                  placeholder="ব্যাংকের নাম, হিসাব নম্বর, ব্রাঞ্চ"
                  className="w-full p-2.5 border rounded-xl bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">টপ অ্যানাউন্সমেন্ট নোটিশ:</label>
              <input
                type="text"
                value={siteSettingsForm.announcementText}
                onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, announcementText: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl"
              >
                পরিবর্তন সংরক্ষণ করুন
              </button>
            </div>
          </form>

          {/* Dedicated Section for Admin Credentials Change (Mandatory Requirement) */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
                <Crown className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  অ্যাডমিন ইউজারনেম ও পাসওয়ার্ড পরিবর্তন (Admin Credentials)
                </h3>
                <p className="text-[11px] text-neutral-500">
                  অ্যাডমিন প্যানেলে প্রবেশের মূল ইউজারনেম ও পাসওয়ার্ড এখান থেকে পরিবর্তন করুন।
                </p>
              </div>
            </div>

            <div className="my-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-neutral-500">বর্তমান ইউজারনেম: </span>
                <code className="font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-200 font-mono">
                  {settings.adminUsername || 'admin'}
                </code>
              </div>
              <div className="text-[11px] text-neutral-400">
                (ডিফল্ট পাসওয়ার্ড: <span className="font-mono">admin12345</span>)
              </div>
            </div>

            {credFeedback && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  credFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {credFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{credFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleUpdateAdminCredentials} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-neutral-700">
                    নতুন অ্যাডমিন ইউজারনেম (New Username):
                  </label>
                  <input
                    type="text"
                    required
                    value={adminNewUsername}
                    onChange={(e) => setAdminNewUsername(e.target.value)}
                    placeholder="যেমন: admin বা admin_director"
                    className="w-full p-2.5 border border-neutral-300 rounded-xl font-mono focus:ring-2 focus:ring-neutral-800 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-neutral-700">
                    বর্তমান পাসওয়ার্ড যাচাই (Current Password):
                  </label>
                  <input
                    type="password"
                    required
                    value={adminCurrentPassword}
                    onChange={(e) => setAdminCurrentPassword(e.target.value)}
                    placeholder="বর্তমান পাসওয়ার্ড দিন"
                    className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-800 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-neutral-700">
                    নতুন পাসওয়ার্ড (New Password):
                  </label>
                  <input
                    type="password"
                    required
                    value={adminNewPassword}
                    onChange={(e) => setAdminNewPassword(e.target.value)}
                    placeholder="কমপক্ষে ৪ অক্ষরের নতুন পাসওয়ার্ড"
                    className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-800 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-neutral-700">
                    নতুন পাসওয়ার্ড নিশ্চিত করুন (Confirm Password):
                  </label>
                  <input
                    type="password"
                    required
                    value={adminConfirmPassword}
                    onChange={(e) => setAdminConfirmPassword(e.target.value)}
                    placeholder="নতুন পাসওয়ার্ডটি পুনরায় লিখুন"
                    className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-800 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>অ্যাডমিন ক্রেডেনশিয়াল আপডেট করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 9: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200">
            <h2 className="text-sm font-bold text-neutral-900">সিস্টেম ও অ্যাডমিন অডিট হিস্টোরি ({auditLogs.length})</h2>
          </div>

          <div className="divide-y divide-neutral-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 flex items-start justify-between gap-4 hover:bg-neutral-50/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">{log.adminName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 font-mono text-neutral-600">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-neutral-600">{log.details}</p>
                </div>
                <div className="text-[11px] text-neutral-400 shrink-0 font-mono">{log.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 10: WEBSITE BUILD & NETLIFY DIST DOWNLOAD (Mandatory Requirement 15) */}
      {activeTab === 'build' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-700" />
                  <span>Website Production Build & Netlify DIST Generator</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  অ্যাডমিন ড্যাশবোর্ড থেকে সরাসরি সম্পূর্ণ Production Build প্যাকেজ (.ZIP) তৈরি ও ডাউনলোড করুন।
                  এই ZIP ফাইলটি সরাসরি Netlify-তে ড্র্যাগ-অ্যান্ড-ড্রপ করে লাইভ করা যাবে।
                </p>
              </div>
            </div>

            {/* Build Controls */}
            <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4 max-w-xl">
              <div className="flex items-center gap-3">
                <div className="w-48">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">বিল্ড সংস্করণ (Version):</label>
                  <input
                    type="text"
                    value={buildVersion}
                    onChange={(e) => setBuildVersion(e.target.value)}
                    placeholder="1.0.2"
                    className="w-full text-xs p-2 border border-neutral-300 rounded-lg bg-white font-mono font-bold"
                  />
                </div>
                <div className="flex-1 pt-5">
                  <button
                    type="button"
                    disabled={isBuilding}
                    onClick={handleStartBuild}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    {isBuilding ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>বিল্ড প্রক্রিয়া চলছে...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Build Website</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Build Progress Visual */}
              {isBuilding && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-neutral-600 font-medium">
                    <span>{buildStepName}</span>
                    <span className="font-mono">{buildProgress}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${buildProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Ready to Download Strip */}
              {lastBuiltBlob && !isBuilding && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2.5 text-xs text-emerald-900 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>প্রোডাকশন বিল্ড প্রস্তুত! ফাইল: {lastBuiltBlob.filename} ({lastBuiltBlob.sizeKb} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadDist}
                    className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download DIST (ZIP)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Netlify Specification Checklist */}
            <div className="mt-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 space-y-2">
              <div className="font-bold text-neutral-900">ডাউনলোড প্যাকেজের অন্তর্ভুক্ত ফাইলসমূহ:</div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-disc list-inside">
                <li><code>images/</code> (সকল গরুর ছবি ও ব্যানার প্যাকেজে স্বয়ংক্রিয়ভাবে অন্তর্ভুক্ত)</li>
                <li><code>index.html</code> (রেসপনসিভ এসইও ও ফুল মার্কেটপ্লেস কোড সহ)</li>
                <li><code>_redirects</code> (Netlify SPA রিডাইরেক্ট রুল: <code>/* /index.html 200</code>)</li>
                <li><code>netlify.toml</code> (সিকিউরিটি হেডার ও ইমেজ ক্যাশিং কনফিগ)</li>
                <li><code>robots.txt</code> & <code>sitemap.xml</code> (সার্চ ইঞ্জিন ফ্রেন্ডলি)</li>
                <li><code>README_NETLIFY.md</code> (১ মিনিটের ইনস্টলেশন ও ড্র্যাগ-ড্রপ গাইড)</li>
              </ul>
            </div>
          </div>

          {/* Build History Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="text-sm font-bold text-neutral-900">বিল্ড ও ডিপ্লয়মেন্ট ইতিহাস (Build History)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-600">
                <thead className="bg-neutral-50 text-neutral-700 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="p-3">ভার্সন</th>
                    <th className="p-3">বিল্ড তারিখ</th>
                    <th className="p-3">অ্যাডমিন</th>
                    <th className="p-3">টার্গেট প্ল্যাটফর্ম</th>
                    <th className="p-3">আকার (Size)</th>
                    <th className="p-3">স্ট্যাটাস</th>
                    <th className="p-3 text-right">ডাউনলোড</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {buildHistory.map((bh) => (
                    <tr key={bh.id} className="hover:bg-neutral-50/50">
                      <td className="p-3 font-mono font-bold text-neutral-900">v{bh.version}</td>
                      <td className="p-3">{bh.buildDate}</td>
                      <td className="p-3">{bh.adminName}</td>
                      <td className="p-3">{bh.targetPlatform}</td>
                      <td className="p-3 font-mono">{bh.zipSizeKb} KB</td>
                      <td className="p-3">
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          {bh.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={handleStartBuild}
                          className="px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded font-medium text-[11px]"
                        >
                          পুনরায় ডাউনলোড
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
