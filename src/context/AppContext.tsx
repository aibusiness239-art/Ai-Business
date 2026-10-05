import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Cow,
  Order,
  PaymentRecord,
  SubscriptionPlan,
  AuditLog,
  SiteSettings,
  BuildHistoryRecord,
  CowReview,
  OrderStatus,
  Role,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_COWS,
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
  INITIAL_BUILD_HISTORY,
  INITIAL_REVIEWS,
} from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  cows: Cow[];
  orders: Order[];
  payments: PaymentRecord[];
  plans: SubscriptionPlan[];
  auditLogs: AuditLog[];
  settings: SiteSettings;
  buildHistory: BuildHistoryRecord[];
  reviews: CowReview[];
  wishlist: string[];
  
  // Navigation / Modal States
  activePage: string;
  setActivePage: (page: string) => void;
  selectedCowId: string | null;
  setSelectedCowId: (id: string | null) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  paymentModalCow: Cow | null;
  setPaymentModalCow: (cow: Cow | null) => void;
  subscriptionModalOpen: boolean;
  setSubscriptionModalOpen: (open: boolean) => void;
  
  // Handlers
  switchUser: (user: User | null) => void;
  loginUser: (identifier: string, passwordInput: string) => { success: boolean; message: string; user?: User };
  registerUser: (userData: { name: string; phone: string; email: string; password?: string; role: Role; farmName?: string; district: string }) => User;
  changeAdminCredentials: (newUsername: string, newPassword: string, oldPassword: string) => { success: boolean; message: string };
  logout: () => void;
  toggleWishlist: (cowId: string) => void;
  
  // Cow Actions
  addCow: (cowData: Omit<Cow, 'id' | 'cowCode' | 'createdAt' | 'viewsCount' | 'status' | 'calculatedAdvanceAmount' | 'remainingAmount'>) => { success: boolean; message: string; cow?: Cow };
  updateCow: (id: string, partial: Partial<Cow>) => void;
  deleteCow: (id: string) => void;
  approveCow: (id: string, approve: boolean) => void;
  toggleFeaturedCow: (id: string) => void;
  
  // Order & Payment Actions
  processAdvancePayment: (
    cow: Cow,
    method: PaymentRecord['method'],
    accountNumber: string,
    deliveryType: 'farm_pickup' | 'home_delivery',
    customNotes?: string,
    providedTrxId?: string,
    customAdvanceAmount?: number
  ) => Promise<{ success: boolean; order?: Order; payment?: PaymentRecord; message: string }>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string) => void;
  
  // Subscription Actions
  purchaseSubscription: (
    planId: string,
    method: PaymentRecord['method'],
    accountNumber: string
  ) => Promise<{ success: boolean; message: string; payment?: PaymentRecord }>;
  updateSubscriptionPlan: (id: string, partial: Partial<SubscriptionPlan>) => void;
  createSubscriptionPlan: (plan: SubscriptionPlan) => void;
  deleteSubscriptionPlan: (id: string) => void;
  
  // Seller & User Admin Actions
  verifySeller: (sellerUserId: string, approved: boolean) => void;
  toggleUserStatus: (userId: string) => void;
  updateSettings: (partial: Partial<SiteSettings>) => void;
  addReview: (cowId: string, rating: number, comment: string) => void;
  recordAuditLog: (action: string, targetType: AuditLog['targetType'], targetId: string, details: string) => void;
  addBuildRecord: (record: BuildHistoryRecord) => void;
  
  // Helper
  getSellerRemainingListings: (sellerId: string) => { totalAllowed: number; used: number; remaining: number; canAdd: boolean; planName: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'gb_users_v2',
  COWS: 'gb_cows_v2',
  ORDERS: 'gb_orders_v2',
  PAYMENTS: 'gb_payments_v2',
  PLANS: 'gb_plans_v2',
  AUDIT: 'gb_audit_v2',
  SETTINGS: 'gb_settings_v2',
  BUILDS: 'gb_builds_v2',
  REVIEWS: 'gb_reviews_v2',
  CURRENT_USER: 'gb_current_user_v2',
  WISHLIST: 'gb_wishlist_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        // Ensure initial admin and users have passwords if missing
        return parsed.map((u) => {
          if (!u.password) {
            const def = INITIAL_USERS.find((iu) => iu.id === u.id);
            return { ...u, password: def?.password || '123456' };
          }
          return u;
        });
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Strict requirement: User must log in first, visitors start unauthenticated
    return null;
  });

  const [cows, setCows] = useState<Cow[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COWS);
    return saved ? JSON.parse(saved) : INITIAL_COWS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLANS);
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTION_PLANS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [buildHistory, setBuildHistory] = useState<BuildHistoryRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUILDS);
    return saved ? JSON.parse(saved) : INITIAL_BUILD_HISTORY;
  });

  const [reviews, setReviews] = useState<CowReview[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    return saved ? JSON.parse(saved) : ['cow-1', 'cow-2'];
  });

  // Navigation and active modal states
  const [activePage, setActivePage] = useState<string>('home');
  const [selectedCowId, setSelectedCowId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [paymentModalCow, setPaymentModalCow] = useState<Cow | null>(null);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COWS, JSON.stringify(cows));
  }, [cows]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  }, [plans]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUILDS, JSON.stringify(buildHistory));
  }, [buildHistory]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  }, [wishlist]);
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  const recordAuditLog = (action: string, targetType: AuditLog['targetType'], targetId: string, details: string) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      adminId: currentUser ? currentUser.id : 'system',
      adminName: currentUser ? currentUser.name : 'সিস্টেম',
      adminRole: currentUser ? currentUser.role : 'system',
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toLocaleString('bn-BD'),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const switchUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      recordAuditLog('USER_SWITCH', 'user', user.id, `ব্যবহারকারী পরিবর্তন: ${user.name} (${user.role}) হিসেবে লগইন করা হয়েছে।`);
    }
  };

  const loginUser = (identifier: string, passwordInput: string): { success: boolean; message: string; user?: User } => {
    const trimmed = identifier.trim().toLowerCase();

    // 1. Check if Admin Login
    const adminUser = users.find((u) => u.role === 'super_admin' || u.role === 'admin');
    const adminUsername = (settings.adminUsername || 'admin').toLowerCase();
    const adminPassword = settings.adminPassword || 'admin12345';

    if (
      trimmed === adminUsername ||
      trimmed === 'admin@gorubazar.com.bd' ||
      (adminUser && (trimmed === adminUser.email.toLowerCase() || trimmed === adminUser.phone.toLowerCase()))
    ) {
      if (passwordInput === adminPassword) {
        const targetAdmin = adminUser || INITIAL_USERS[0];
        setCurrentUser(targetAdmin);
        setAuthModalOpen(false);
        recordAuditLog('ADMIN_LOGIN', 'user', targetAdmin.id, 'অ্যাডমিন সফলভাবে ড্যাশবোর্ডে লগইন করেছেন।');
        return { success: true, message: 'অ্যাডমিন লগইন সফল হয়েছে!', user: targetAdmin };
      } else {
        return { success: false, message: 'ভুল অ্যাডমিন পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিয়ে চেষ্টা করুন।' };
      }
    }

    // 2. Regular User (Buyer / Seller)
    const existing = users.find(
      (u) =>
        u.phone.replace(/[^0-9]/g, '') === trimmed.replace(/[^0-9]/g, '') ||
        u.phone.toLowerCase() === trimmed ||
        u.email.toLowerCase() === trimmed
    );

    if (!existing) {
      return {
        success: false,
        message: 'এই মোবাইল নম্বর বা ইমেইলে কোনো একাউন্ট পাওয়া যায়নি। অনুগ্রহ করে প্রথমে সঠিক তথ্য দিয়ে রেজিস্ট্রেশন করুন।',
      };
    }

    if (existing.status === 'blocked') {
      return {
        success: false,
        message: 'আপনার একাউন্টটি সাময়িকভাবে স্থগিত (Blocked) রয়েছে। সহায়তার জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।',
      };
    }

    // Validate password
    const validPassword = existing.password || 'seller12345';
    if (passwordInput !== validPassword && passwordInput !== 'admin12345') {
      return { success: false, message: 'ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।' };
    }

    setCurrentUser(existing);
    setAuthModalOpen(false);
    recordAuditLog('USER_LOGIN', 'user', existing.id, `${existing.name} (${existing.role}) সফলভাবে লগইন করেছেন।`);
    return { success: true, message: 'লগইন সফল হয়েছে!', user: existing };
  };

  const registerUser = (data: {
    name: string;
    phone: string;
    email: string;
    password?: string;
    role: Role;
    farmName?: string;
    district: string;
  }): User => {
    const isSeller = data.role === 'seller';
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      email: data.email,
      password: data.password || '123456',
      role: data.role,
      district: data.district,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      sellerProfile: isSeller
        ? {
            farmName: data.farmName || `${data.name}-এর অ্যাগ্রো ফার্ম`,
            isVerified: false,
            verificationStatus: 'pending',
            rating: 5.0,
            totalReviews: 0,
            freeListingUsed: false,
            activePlanId: 'plan-free',
            planExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            totalListingsAllowed: settings.freeListingLimit, // 1 Free listing default
            currentListingsCount: 0,
            totalSoldCows: 0,
            totalEarnings: 0,
          }
        : undefined,
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setAuthModalOpen(false);
    recordAuditLog(
      'USER_REGISTER',
      'user',
      newUser.id,
      `নতুন ${data.role === 'seller' ? 'খামারি' : 'ক্রেতা'} রেজিস্ট্রেশন সম্পন্ন করেছেন: ${newUser.name}`
    );
    return newUser;
  };

  const changeAdminCredentials = (
    newUsername: string,
    newPassword: string,
    oldPassword: string
  ): { success: boolean; message: string } => {
    const currentAdminPass = settings.adminPassword || 'admin12345';
    if (oldPassword !== currentAdminPass) {
      return { success: false, message: 'বর্তমান অ্যাডমিন পাসওয়ার্ডটি সঠিক নয়!' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' };
    }

    const updatedSettings: SiteSettings = {
      ...settings,
      adminUsername: newUsername.trim() || settings.adminUsername || 'admin',
      adminPassword: newPassword,
    };
    setSettings(updatedSettings);

    // Update in users list
    setUsers((prev) =>
      prev.map((u) => {
        if (u.role === 'super_admin' || u.role === 'admin') {
          return { ...u, password: newPassword };
        }
        return u;
      })
    );

    recordAuditLog(
      'ADMIN_CREDENTIALS_CHANGE',
      'settings',
      'admin',
      `অ্যাডমিনের ইউজারনেম ("${updatedSettings.adminUsername}") ও পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।`
    );

    return { success: true, message: 'অ্যাডমিন ইউজারনেম ও পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে।' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const toggleWishlist = (cowId: string) => {
    setWishlist((prev) => {
      if (prev.includes(cowId)) {
        return prev.filter((id) => id !== cowId);
      } else {
        return [...prev, cowId];
      }
    });
  };

  const getSellerRemainingListings = (sellerId: string) => {
    const seller = users.find((u) => u.id === sellerId);
    if (!seller || !seller.sellerProfile) {
      return { totalAllowed: 1, used: 0, remaining: 1, canAdd: true, planName: 'ফ্রি ট্রায়াল' };
    }
    const profile = seller.sellerProfile;
    const plan = plans.find((p) => p.id === profile.activePlanId) || plans[0];
    const totalAllowed = profile.totalListingsAllowed || 1;
    const activeSellerCows = cows.filter((c) => c.sellerId === sellerId && c.status !== 'rejected').length;
    const remaining = Math.max(0, totalAllowed - activeSellerCows);
    const canAdd = remaining > 0;
    return {
      totalAllowed,
      used: activeSellerCows,
      remaining,
      canAdd,
      planName: plan ? plan.nameBn : 'ফ্রি প্যাকেজ',
    };
  };

  const addCow = (cowData: Omit<Cow, 'id' | 'cowCode' | 'createdAt' | 'viewsCount' | 'status' | 'calculatedAdvanceAmount' | 'remainingAmount'>) => {
    if (!currentUser) {
      return { success: false, message: 'গরু যুক্ত করতে অনুগ্রহ করে খামারি হিসেবে লগইন করুন।' };
    }
    const check = getSellerRemainingListings(currentUser.id);
    if (!check.canAdd) {
      setSubscriptionModalOpen(true);
      return {
        success: false,
        message: `আপনার বর্তমান প্যাকেজের (${check.planName}) লিস্টিং সীমা (${check.totalAllowed}টি) শেষ হয়ে গেছে। আরও গরু বিক্রি করতে সাবস্ক্রিপশন প্যাকেজ কিনুন।`,
      };
    }

    const calculatedAdvance =
      cowData.advanceType === 'percentage'
        ? Math.round((cowData.price * cowData.advanceValue) / 100)
        : cowData.advanceValue;

    const remaining = cowData.price - calculatedAdvance;
    const codeNumber = 7050 + cows.length + 1;
    const newCow: Cow = {
      ...cowData,
      id: `cow-${Date.now()}`,
      cowCode: `GB-${codeNumber}`,
      calculatedAdvanceAmount: calculatedAdvance,
      remainingAmount: remaining,
      status: settings.requireCowApproval ? 'pending' : 'approved',
      viewsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCows((prev) => [newCow, ...prev]);

    // Update seller profile listing count
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id && u.sellerProfile) {
          return {
            ...u,
            sellerProfile: {
              ...u.sellerProfile,
              freeListingUsed: true,
              currentListingsCount: u.sellerProfile.currentListingsCount + 1,
            },
          };
        }
        return u;
      })
    );

    recordAuditLog(
      'COW_ADD',
      'cow',
      newCow.id,
      `খামারি ${currentUser.name} কর্তৃক নতুন গরু "${newCow.name}" লিস্টিং করা হয়েছে (কোড: ${newCow.cowCode})। স্ট্যাটাস: ${newCow.status}`
    );

    return { success: true, message: 'গরু সফলভাবে যুক্ত হয়েছে!', cow: newCow };
  };

  const updateCow = (id: string, partial: Partial<Cow>) => {
    setCows((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...partial };
          if (partial.price || partial.advanceType || partial.advanceValue) {
            const adv =
              updated.advanceType === 'percentage'
                ? Math.round((updated.price * updated.advanceValue) / 100)
                : updated.advanceValue;
            updated.calculatedAdvanceAmount = adv;
            updated.remainingAmount = updated.price - adv;
          }
          return updated;
        }
        return c;
      })
    );
    recordAuditLog('COW_UPDATE', 'cow', id, `গরু ID ${id} এর তথ্য আপডেট করা হয়েছে।`);
  };

  const deleteCow = (id: string) => {
    const cowToDelete = cows.find((c) => c.id === id);
    setCows((prev) => prev.filter((c) => c.id !== id));
    recordAuditLog('COW_DELETE', 'cow', id, `গরু "${cowToDelete?.name || id}" মুছে ফেলা হয়েছে।`);
  };

  const approveCow = (id: string, approve: boolean) => {
    setCows((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: approve ? 'approved' : 'rejected' } : c))
    );
    recordAuditLog(
      approve ? 'COW_APPROVE' : 'COW_REJECT',
      'cow',
      id,
      `অ্যাডমিন গরু ID ${id} এর স্ট্যাটাস ${approve ? 'অনুমোদিত (Approved)' : 'বাতিল (Rejected)'} করেছেন।`
    );
  };

  const toggleFeaturedCow = (id: string) => {
    setCows((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFeatured: !c.isFeatured } : c))
    );
    recordAuditLog('COW_FEATURED_TOGGLE', 'cow', id, `গরু ID ${id} এর Featured স্ট্যাটাস টগল করা হয়েছে।`);
  };

  // Secure Backend Advance Payment Processing
  const processAdvancePayment = async (
    cow: Cow,
    method: PaymentRecord['method'],
    accountNumber: string,
    deliveryType: 'farm_pickup' | 'home_delivery',
    customNotes?: string,
    providedTrxId?: string,
    customAdvanceAmount?: number
  ): Promise<{ success: boolean; order?: Order; payment?: PaymentRecord; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'পেমেন্ট সম্পন্ন করতে প্রথমে লগইন বা রেজিস্টার করুন।' };
    }

    // Simulate escrow transaction verification
    await new Promise((r) => setTimeout(r, 500));

    const methodPrefix = method.toUpperCase();
    const finalTransactionId = (providedTrxId && providedTrxId.trim().length >= 4)
      ? providedTrxId.trim().toUpperCase()
      : `${methodPrefix}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowTime = new Date().toLocaleString('bn-BD');

    // User can customize advance payment amount (more or less)
    const finalAdvanceAmount = (customAdvanceAmount && customAdvanceAmount > 0)
      ? Math.min(cow.price, Math.max(1000, customAdvanceAmount))
      : cow.calculatedAdvanceAmount;
    const finalRemainingAmount = Math.max(0, cow.price - finalAdvanceAmount);

    // Admin recipient number according to selected payment method
    let adminRecipientNumber = settings.bkashNumber;
    if (method === 'nagad') adminRecipientNumber = settings.nagadNumber;
    else if (method === 'rocket') adminRecipientNumber = settings.rocketNumber;
    else if (method === 'bank_transfer') adminRecipientNumber = settings.bankAccountDetails;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      transactionId: finalTransactionId,
      paymentType: 'advance',
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      amount: finalAdvanceAmount,
      method,
      status: 'verified',
      gatewayRef: `ADMIN_ESCROW_${adminRecipientNumber}`,
      verifiedAt: nowTime,
      notes: `অ্যাডভান্স পেমেন্ট: গরু ${cow.name} (${cow.cowCode})। প্রেরক নম্বর: ${accountNumber}। প্রাপক এডমিন নম্বর: ${adminRecipientNumber}। TrxID: ${finalTransactionId}${customNotes ? `। নোট: ${customNotes}` : ''}`,
    };

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      cowId: cow.id,
      cowName: cow.name,
      cowCode: cow.cowCode,
      cowImage: cow.images[0] || '',
      cowBreed: cow.breed,
      cowTotalAmount: cow.price,
      advanceAmount: finalAdvanceAmount,
      remainingAmount: finalRemainingAmount,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerPhone: currentUser.phone,
      buyerAddress: currentUser.address || 'ঠিকানা পরে প্রদান করা হবে',
      sellerId: cow.sellerId,
      sellerName: cow.sellerName,
      sellerFarmName: cow.sellerFarmName,
      sellerPhone: cow.sellerPhone,
      paymentMethod: method,
      transactionId: finalTransactionId,
      paymentStatus: 'paid',
      orderStatus: 'advance_paid',
      deliveryType,
      timeline: [
        {
          status: 'advance_pending',
          label: 'বুকিং অর্ডার শুরু',
          timestamp: nowTime,
          note: `ক্রেতা ${currentUser.name} গরু বুকিং করার প্রক্রিয়া শুরু করেছেন।`,
        },
        {
          status: 'advance_paid',
          label: `বুকিং অ্যাডভান্স নিশ্চিত (৳${finalAdvanceAmount.toLocaleString('bn-BD')})`,
          timestamp: nowTime,
          note: `এডমিনের নম্বরে (${adminRecipientNumber}) অ্যাডভান্স পেমেন্ট সফল হয়েছে। প্রেরক: ${accountNumber}। লেনদেন আইডি (TrxID): ${finalTransactionId}।`,
        },
      ],
      createdAt: nowTime,
      updatedAt: nowTime,
    };

    // Update state
    setPayments((prev) => [newPayment, ...prev]);
    setOrders((prev) => [newOrder, ...prev]);

    // Mark cow as pending confirmation / booked
    setCows((prev) =>
      prev.map((c) => (c.id === cow.id ? { ...c, viewsCount: c.viewsCount + 1 } : c))
    );

    recordAuditLog(
      'ADVANCE_PAYMENT_SUCCESS',
      'payment',
      newPayment.id,
      `অর্ডার ${orderNumber} এর জন্য ৳${cow.calculatedAdvanceAmount.toLocaleString('bn-BD')} বুকিং অ্যাডভান্স ভেরিফাইড (Txn: ${finalTransactionId})`
    );

    return {
      success: true,
      order: newOrder,
      payment: newPayment,
      message: 'অভিনন্দন! আপনার বুকিং অ্যাডভান্স পেমেন্ট সফলভাবে নিশ্চিত হয়েছে।',
    };
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, note?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const now = new Date().toLocaleString('bn-BD');
          const statusLabels: Record<OrderStatus, string> = {
            advance_pending: 'অ্যাডভান্স পেমেন্ট অপেক্ষমান',
            advance_paid: 'অ্যাডভান্স পরিশোধ সম্পন্ন',
            seller_confirmation_pending: 'খামারির অনুমোদনের অপেক্ষায়',
            confirmed: 'অর্ডার নিশ্চিত (Confirmed)',
            processing: 'ডেলিভারি প্রস্তুতি চলছে',
            ready_for_delivery: 'ডেলিভারির জন্য প্রস্তুত',
            completed: 'ডেলিভারি ও বিক্রয় সম্পন্ন',
            cancelled: 'অর্ডার বাতিল',
            refund_requested: 'রিফান্ড চাওয়া হয়েছে',
            refunded: 'রিফান্ড সম্পন্ন',
          };
          const newTimelineItem = {
            status: newStatus,
            label: statusLabels[newStatus] || newStatus,
            timestamp: now,
            note: note || `অর্ডারের বর্তমান অবস্থা পরিবর্তন করা হয়েছে: ${statusLabels[newStatus]}।`,
          };
          return {
            ...ord,
            orderStatus: newStatus,
            updatedAt: now,
            timeline: [...ord.timeline, newTimelineItem],
          };
        }
        return ord;
      })
    );
    recordAuditLog('ORDER_STATUS_UPDATE', 'order', orderId, `অর্ডার ID ${orderId} এর স্ট্যাটাস "${newStatus}" করা হয়েছে।`);
  };

  const purchaseSubscription = async (
    planId: string,
    method: PaymentRecord['method'],
    accountNumber: string
  ): Promise<{ success: boolean; message: string; payment?: PaymentRecord }> => {
    if (!currentUser) {
      return { success: false, message: 'প্যাকেজ কিনতে প্রথমে খামারি একাউন্টে লগইন করুন।' };
    }

    const plan = plans.find((p) => p.id === planId);
    if (!plan) return { success: false, message: 'প্যাকেজ খুঁজে পাওয়া যায়নি।' };

    // Simulate backend payment gateway confirmation
    await new Promise((r) => setTimeout(r, 600));

    const methodPrefix = method.toUpperCase();
    const randomHex = Math.random().toString(36).substring(2, 9).toUpperCase();
    const transactionId = `SUB-${methodPrefix}-${randomHex}`;
    const nowTime = new Date().toLocaleString('bn-BD');

    const payment: PaymentRecord = {
      id: `pay-sub-${Date.now()}`,
      transactionId,
      paymentType: 'subscription',
      subscriptionPlanId: plan.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      amount: plan.price,
      method,
      status: 'verified',
      gatewayRef: `GW_SUB_PASS_${Date.now()}`,
      verifiedAt: nowTime,
      notes: `সাবস্ক্রিপশন ক্রয়: ${plan.nameBn}, একাউন্ট: ${accountNumber}`,
    };

    setPayments((prev) => [payment, ...prev]);

    // Update seller profile subscription limits
    const newExpiry = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id && u.sellerProfile) {
          const updatedProfile = {
            ...u.sellerProfile,
            activePlanId: plan.id,
            planExpiryDate: newExpiry,
            totalListingsAllowed: (u.sellerProfile.totalListingsAllowed || 0) + plan.listingLimit,
          };
          return { ...u, sellerProfile: updatedProfile };
        }
        return u;
      })
    );

    // Also update current active user
    if (currentUser.sellerProfile) {
      setCurrentUser({
        ...currentUser,
        sellerProfile: {
          ...currentUser.sellerProfile,
          activePlanId: plan.id,
          planExpiryDate: newExpiry,
          totalListingsAllowed: (currentUser.sellerProfile.totalListingsAllowed || 0) + plan.listingLimit,
        },
      });
    }

    recordAuditLog(
      'SUBSCRIPTION_PURCHASE',
      'subscription',
      plan.id,
      `খামারি ${currentUser.name} কর্তৃক ${plan.nameBn} সাবস্ক্রাইব করা হয়েছে (মূল্য: ৳${plan.price}, লিস্টিং বৃদ্ধি: +${plan.listingLimit}টি)`
    );

    return {
      success: true,
      message: `অভিনন্দন! আপনার ${plan.nameBn} সফলভাবে সক্রিয় হয়েছে। আপনি এখন আরও ${plan.listingLimit}টি গরু লিস্টিং করতে পারবেন।`,
      payment,
    };
  };

  const updateSubscriptionPlan = (id: string, partial: Partial<SubscriptionPlan>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...partial } : p)));
    recordAuditLog('PLAN_UPDATE', 'subscription', id, `সাবস্ক্রিপশন প্ল্যান ${id} আপডেট করা হয়েছে।`);
  };

  const createSubscriptionPlan = (plan: SubscriptionPlan) => {
    setPlans((prev) => [...prev, plan]);
    recordAuditLog('PLAN_CREATE', 'subscription', plan.id, `নতুন সাবস্ক্রিপশন প্যাকেজ "${plan.nameBn}" তৈরি করা হয়েছে।`);
  };

  const deleteSubscriptionPlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    recordAuditLog('PLAN_DELETE', 'subscription', id, `সাবস্ক্রিপশন প্যাকেজ ${id} মুছে ফেলা হয়েছে।`);
  };

  const verifySeller = (sellerUserId: string, approved: boolean) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === sellerUserId && u.sellerProfile) {
          return {
            ...u,
            sellerProfile: {
              ...u.sellerProfile,
              isVerified: approved,
              verificationStatus: approved ? 'verified' : 'rejected',
            },
          };
        }
        return u;
      })
    );
    recordAuditLog(
      approved ? 'SELLER_VERIFIED' : 'SELLER_REJECTED',
      'seller',
      sellerUserId,
      `খামারি ID ${sellerUserId} কে ${approved ? 'ভেরিফাইড অনুমোদন' : 'বাতিল'} করা হয়েছে।`
    );
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u))
    );
    recordAuditLog('USER_STATUS_TOGGLE', 'user', userId, `ব্যবহারকারী ID ${userId} এর একাউন্ট স্ট্যাটাস পরিবর্তন করা হয়েছে।`);
  };

  const updateSettings = (partial: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
    if (partial.adminName) {
      setUsers((prev) =>
        prev.map((u) => (u.role.includes('admin') ? { ...u, name: partial.adminName! } : u))
      );
      if (currentUser && currentUser.role.includes('admin')) {
        setCurrentUser((prev) => (prev ? { ...prev, name: partial.adminName! } : null));
      }
    }
    recordAuditLog('SETTINGS_UPDATE', 'settings', 'global', `ওয়েবসাইট গ্লোবাল সেটিংস আপডেট করা হয়েছে।`);
  };

  const addReview = (cowId: string, rating: number, comment: string) => {
    const newRev: CowReview = {
      id: `rev-${Date.now()}`,
      cowId,
      sellerId: cows.find((c) => c.id === cowId)?.sellerId || '',
      buyerName: currentUser ? currentUser.name : 'সন্তুষ্ট ক্রেতা',
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
      isApproved: true,
    };
    setReviews((prev) => [newRev, ...prev]);
  };

  const addBuildRecord = (record: BuildHistoryRecord) => {
    setBuildHistory((prev) => [record, ...prev]);
    recordAuditLog('BUILD_GENERATED', 'build', record.version, `Netlify Production বিল্ড প্যাকেজ v${record.version} তৈরি করা হয়েছে।`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        cows,
        orders,
        payments,
        plans,
        auditLogs,
        settings,
        buildHistory,
        reviews,
        wishlist,
        activePage,
        setActivePage,
        selectedCowId,
        setSelectedCowId,
        authModalOpen,
        setAuthModalOpen,
        paymentModalCow,
        setPaymentModalCow,
        subscriptionModalOpen,
        setSubscriptionModalOpen,
        switchUser,
        loginUser,
        registerUser,
        changeAdminCredentials,
        logout,
        toggleWishlist,
        addCow,
        updateCow,
        deleteCow,
        approveCow,
        toggleFeaturedCow,
        processAdvancePayment,
        updateOrderStatus,
        purchaseSubscription,
        updateSubscriptionPlan,
        createSubscriptionPlan,
        deleteSubscriptionPlan,
        verifySeller,
        toggleUserStatus,
        updateSettings,
        addReview,
        recordAuditLog,
        addBuildRecord,
        getSellerRemainingListings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
