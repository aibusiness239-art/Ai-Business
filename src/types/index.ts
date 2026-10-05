export type Role = 'visitor' | 'buyer' | 'seller' | 'admin' | 'super_admin' | 'manager' | 'support';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  password?: string; // Credential for secure login
  role: Role;
  avatar?: string;
  district?: string;
  upazila?: string;
  address?: string;
  status: 'active' | 'blocked';
  createdAt: string;
  sellerProfile?: SellerProfile;
}

export interface SellerProfile {
  farmName: string;
  nidNumber?: string;
  tradeLicenseNumber?: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  rating: number;
  totalReviews: number;
  freeListingUsed: boolean;
  activePlanId: string;
  planExpiryDate: string;
  totalListingsAllowed: number;
  currentListingsCount: number;
  totalSoldCows: number;
  totalEarnings: number;
}

export type CowCategory = 'dairy' | 'beef' | 'qurbani' | 'heifer' | 'breeding';

export interface Cow {
  id: string;
  cowCode: string; // e.g. "GB-8021"
  name: string;
  breed: string; // e.g. "হোলস্টাইন ফ্রিজিয়ান", "শাহীওয়াল", "রেড চিটাগাং"
  category: CowCategory;
  categoryLabelBn: string;
  ageYears: number;
  ageMonths: number;
  gender: 'ষাঁড়' | 'গাভী' | 'বকনা' | 'দামড়া';
  weightKg: number;
  heightInch: number;
  milkProductionLitersDaily?: number;
  price: number;
  advanceType: 'fixed' | 'percentage';
  advanceValue: number; // e.g. 10 (%) or 20000 (Tk)
  calculatedAdvanceAmount: number;
  remainingAmount: number;
  images: string[];
  videoUrl?: string;
  district: string;
  upazila: string;
  fullAddress: string;
  healthStatus: string;
  vaccinations: string[]; // e.g. ["খুরা রোগ (FMD)", "অ্যানথ্রাক্স (তড়কা)", "এলএসডি (Lumpy Skin)"]
  feedingHabit: string;
  description: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerFarmName: string;
  sellerIsVerified: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  isFeatured: boolean;
  viewsCount: number;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  nameBn: string;
  price: number;
  durationDays: number;
  listingLimit: number;
  featuredSlots: number;
  isPrioritySupport: boolean;
  isFreePackage: boolean;
  features: string[];
  isActive: boolean;
  badge?: string;
}

export type OrderStatus =
  | 'advance_pending'
  | 'advance_paid'
  | 'seller_confirmation_pending'
  | 'confirmed'
  | 'processing'
  | 'ready_for_delivery'
  | 'completed'
  | 'cancelled'
  | 'refund_requested'
  | 'refunded';

export interface OrderTimelineItem {
  status: OrderStatus;
  label: string;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  orderNumber: string; // "ORD-2026-9041"
  cowId: string;
  cowName: string;
  cowCode: string;
  cowImage: string;
  cowBreed: string;
  cowTotalAmount: number;
  advanceAmount: number;
  remainingAmount: number;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  sellerId: string;
  sellerName: string;
  sellerFarmName: string;
  sellerPhone: string;
  paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'bank_transfer' | 'sslcommerz';
  transactionId: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: OrderStatus;
  deliveryType: 'farm_pickup' | 'home_delivery';
  timeline: OrderTimelineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  transactionId: string;
  paymentType: 'advance' | 'subscription' | 'remaining';
  orderId?: string;
  subscriptionPlanId?: string;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number;
  method: 'bkash' | 'nagad' | 'rocket' | 'bank_transfer' | 'sslcommerz';
  status: 'verified' | 'pending' | 'failed' | 'refunded';
  gatewayRef: string;
  verifiedAt: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: string;
  action: string;
  targetType: 'cow' | 'user' | 'seller' | 'order' | 'payment' | 'subscription' | 'settings' | 'build';
  targetId: string;
  details: string;
  timestamp: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  hotline: string;
  email: string;
  address: string;
  logoUrl?: string;
  logoText?: string;
  adminName?: string;
  defaultAdvancePercentage: number;
  minimumAdvanceAmount: number;
  freeListingLimit: number;
  requireCowApproval: boolean;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  bankAccountDetails: string;
  heroBannerTitle: string;
  heroBannerSubtitle: string;
  announcementText: string;
  isMaintenanceMode: boolean;
  adminUsername?: string;
  adminPassword?: string;
}

export interface BuildHistoryRecord {
  id: string;
  version: string;
  buildDate: string;
  adminName: string;
  status: 'success' | 'building' | 'failed';
  zipSizeKb: number;
  totalFiles: number;
  targetPlatform: string;
}

export interface CowReview {
  id: string;
  cowId: string;
  sellerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  date: string;
  isApproved: boolean;
}
