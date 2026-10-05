import React, { useState } from 'react';
import { Cow, PaymentRecord, Order } from '../types';
import { useApp } from '../context/AppContext';
import { FALLBACK_COW_SVG } from '../utils/imageFallback';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Truck,
  Building,
  ArrowRight,
  Printer,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  CreditCard,
} from 'lucide-react';

interface AdvancePaymentModalProps {
  cow: Cow | null;
  onClose: () => void;
  onSuccess?: (order: Order) => void;
}

export const AdvancePaymentModal: React.FC<AdvancePaymentModalProps> = ({ cow, onClose, onSuccess }) => {
  const { currentUser, settings, processAdvancePayment, setAuthModalOpen, setActivePage } = useApp();

  // 3-Step Flow: 1: Delivery info, 2: Send Money to Admin & Enter TrxID, 3: Success Receipt
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMethod, setSelectedMethod] = useState<PaymentRecord['method']>('bkash');
  const [senderPhone, setSenderPhone] = useState(currentUser?.phone || '');
  const [deliveryType, setDeliveryType] = useState<'farm_pickup' | 'home_delivery'>('farm_pickup');
  const [address, setAddress] = useState(currentUser?.address || 'মিরপুর ১২, ঢাকা');
  const [transactionId, setTransactionId] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [copiedAdminNumber, setCopiedAdminNumber] = useState(false);

  // Flexible Advance Amount (Requirement: User can pay more or less advance amount)
  const defaultAdv = cow ? (cow.calculatedAdvanceAmount || Math.round(cow.price * 0.1)) : 15000;
  const [customAdvance, setCustomAdvance] = useState<number>(defaultAdv);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [createdPayment, setCreatedPayment] = useState<PaymentRecord | null>(null);

  if (!cow) return null;

  const effectiveAdvance = Math.min(cow.price, Math.max(1000, customAdvance || defaultAdv));
  const effectiveRemaining = Math.max(0, cow.price - effectiveAdvance);

  // Resolve admin recipient number according to selected payment method
  const getAdminRecipientInfo = () => {
    switch (selectedMethod) {
      case 'bkash':
        return {
          title: 'অ্যাডমিন বিকাশ নম্বর (bKash)',
          number: settings.bkashNumber || '০১৭১১-৮৮৯৯০০ (মার্চেন্ট)',
          color: 'pink',
          instruction: 'আপনার বিকাশ অ্যাপে গিয়ে Send Money অথবা Payment অপশন ব্যবহার করে নিচের অ্যাডমিন নম্বরে অ্যাডভান্স টাকা পাঠান।',
        };
      case 'nagad':
        return {
          title: 'অ্যাডমিন নগদ নম্বর (Nagad)',
          number: settings.nagadNumber || '০১৭২২-৩৩৪৪৫৫ (মার্চেন্ট)',
          color: 'orange',
          instruction: 'আপনার নগদ অ্যাপ বা ডায়াল করে Send Money অথবা Payment অপশন ব্যবহার করে নিচের অ্যাডমিন নম্বরে অ্যাডভান্স টাকা পাঠান।',
        };
      case 'rocket':
        return {
          title: 'অ্যাডমিন রকেট নম্বর (Rocket)',
          number: settings.rocketNumber || '০১৯১১-২২৩৩৪৪-৮ (মার্চেন্ট)',
          color: 'purple',
          instruction: 'আপনার রকেট ওয়ালেট বা ডায়াল করে Send Money বা Payment অপশনে গিয়ে নিচের অ্যাডমিন নম্বরে অ্যাডভান্স টাকা পাঠান।',
        };
      case 'bank_transfer':
      default:
        return {
          title: 'অ্যাডমিন ব্যাংক অ্যাকাউন্ট বিবরণ',
          number: settings.bankAccountDetails || 'ইসলামী ব্যাংক বাংলাদেশ লিমিটেড, হিসাব: ২০৫০১৭৭০১০০০৯৮৭৬, ব্রাঞ্চ: ফার্মগেট, ঢাকা',
          color: 'emerald',
          instruction: 'ইন্টারনেট ব্যাংকিং, EFT বা ব্যাংক ডিপোজিটের মাধ্যমে নিচের অ্যাডমিন ব্যাংক অ্যাকাউন্টে অ্যাডভান্স টাকা জমা দিন।',
        };
    }
  };

  const currentAdminRecipient = getAdminRecipientInfo();

  const handleCopyAdminNumber = () => {
    navigator.clipboard.writeText(currentAdminRecipient.number);
    setCopiedAdminNumber(true);
    setTimeout(() => setCopiedAdminNumber(false), 2000);
  };

  const handleProceedToPayment = () => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    if (!address.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার সম্পূর্ণ যোগাযোগের ঠিকানা লিখুন।');
      return;
    }
    setErrorMessage('');
    setStep(2);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!senderPhone.trim()) {
      setErrorMessage('যে নম্বর থেকে টাকা পাঠিয়েছেন সেই প্রেরক মোবাইল নম্বরটি দিন।');
      return;
    }

    if (!transactionId.trim() || transactionId.trim().length < 4) {
      setErrorMessage('টাকা পাঠানোর পর বিকাশ/নগদ/রকেট থেকে প্রাপ্ত বৈধ ট্রানজেকশন আইডি (TrxID) প্রদান করুন।');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await processAdvancePayment(
        cow,
        selectedMethod,
        senderPhone.trim(),
        deliveryType,
        `ঠিকানা: ${address.trim()}${paymentNotes ? ` | নোট: ${paymentNotes}` : ''}`,
        transactionId.trim(),
        effectiveAdvance
      );

      if (res.success && res.order && res.payment) {
        setCreatedOrder(res.order);
        setCreatedPayment(res.payment);
        setStep(3);
        onSuccess?.(res.order);
      } else {
        setErrorMessage(res.message || 'পেমেন্ট সম্পন্ন হতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'সার্ভার সংযোগ সমস্যা।');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-neutral-200">
        
        {/* Modal Top Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>নিরাপদ বুকিং অ্যাডভান্স পেমেন্ট</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              বাংলাদেশ ব্যাংক ও গরু বাজার এসক্রো সুরক্ষা বিধিমালার আওতায়
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cow Brief Summary Strip */}
        <div className="p-4 bg-emerald-50/70 border-b border-emerald-100/70 flex items-center gap-3">
          <img
            src={cow.images[0] || '/images/cow_sahiwal.jpg'}
            alt={cow.name}
            className="w-14 h-14 rounded-xl object-cover border border-emerald-200 shrink-0"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              if (el.src !== FALLBACK_COW_SVG) {
                el.src = FALLBACK_COW_SVG;
              }
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-emerald-800">{cow.cowCode} · {cow.breed}</div>
            <div className="text-sm font-bold text-neutral-900 truncate">{cow.name}</div>
            <div className="text-xs text-neutral-600">খামার: {cow.sellerFarmName} ({cow.district})</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-neutral-500">মোট মূল্য</div>
            <div className="text-base font-bold text-neutral-900 font-mono">৳{cow.price.toLocaleString('bn-BD')}</div>
          </div>
        </div>

        {/* Clean 3-Step Indicator */}
        {step < 3 && (
          <div className="px-6 pt-4 flex items-center justify-between text-xs font-semibold text-neutral-500 border-b border-neutral-100 pb-3">
            <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-emerald-700 font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-neutral-200'}`}>1</span>
              <span>ডেলিভারি তথ্য</span>
            </div>
            <span className="text-neutral-300">→</span>
            <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-emerald-700 font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 2 ? 'bg-emerald-600 text-white' : 'bg-neutral-200'}`}>2</span>
              <span>অ্যাডমিন নম্বরে পেমেন্ট ও TrxID</span>
            </div>
            <span className="text-neutral-300">→</span>
            <div className="flex items-center gap-1.5 text-neutral-400">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] bg-neutral-200">3</span>
              <span>বুকিং রশিদ</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Delivery Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2">
                  ডেলিভারি গ্রহণের মাধ্যম নির্বাচন করুন:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('farm_pickup')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      deliveryType === 'farm_pickup'
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-medium ring-1 ring-emerald-600'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-sm font-bold">খামার থেকে সরাসরি পিকআপ</span>
                    </div>
                    <span className="text-xs text-neutral-500">
                      নিজে খামারে গিয়ে গরু দেখে বুঝে নেবেন
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('home_delivery')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      deliveryType === 'home_delivery'
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-medium ring-1 ring-emerald-600'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-sm font-bold">হোম ডেলিভারি (ট্রাক)</span>
                    </div>
                    <span className="text-xs text-neutral-500">
                      খামারি নিরাপদ ট্রাকে আপনার ঠিকানায় পাঠাবেন
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  আপনার সম্পূর্ণ যোগাযোগের ঠিকানা:
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="বাড়ি/গ্রাম, রাস্তা, থানা/উপজেলা, জেলা"
                  className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* Flexible Advance Amount Customizer (Requirement: User can pay more or less advance) */}
              <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-950">
                    বুকিং অ্যাডভান্সের পরিমাণ (আপনার পছন্দমতো কম/বেশি করতে পারেন):
                  </label>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                    স্বনির্ধারিত অ্যাডভান্স
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 font-bold text-sm">৳</span>
                  <input
                    type="number"
                    min={1000}
                    max={cow.price}
                    step={1000}
                    value={customAdvance}
                    onChange={(e) => setCustomAdvance(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 text-sm font-bold font-mono border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                {/* Percentage Preset Quick Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-neutral-500 font-medium">দ্রুত পছন্দ:</span>
                  {[
                    { label: '১০%', pct: 0.10 },
                    { label: '২০%', pct: 0.20 },
                    { label: '৩০%', pct: 0.30 },
                    { label: '৫০%', pct: 0.50 },
                    { label: '১০০% ফুল পেমেন্ট', pct: 1.0 },
                  ].map((preset) => {
                    const presetAmount = Math.round(cow.price * preset.pct);
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setCustomAdvance(presetAmount)}
                        className={`px-2.5 py-1 text-[11px] rounded-lg border font-semibold transition-all ${
                          customAdvance === presetAmount
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Financial Calculation Box */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>গরুর মোট নির্ধারিত মূল্য:</span>
                  <span className="font-mono font-semibold">৳ {cow.price.toLocaleString('bn-BD')}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold border-b border-neutral-200 pb-2 text-sm">
                  <span>পরিশোধের জন্য নির্ধারিত অ্যাডভান্স:</span>
                  <span className="font-mono text-base">৳ {effectiveAdvance.toLocaleString('bn-BD')}</span>
                </div>
                <div className="flex justify-between text-neutral-500 text-xs pt-1">
                  <span>ডেলিভারির সময় অবশিষ্ট পরিশোধযোগ্য:</span>
                  <span className="font-mono font-bold text-neutral-800">
                    ৳ {effectiveRemaining.toLocaleString('bn-BD')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToPayment}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>পরবর্তী: অ্যাডমিন নম্বরে পেমেন্ট করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Send Money to Admin Number & Submit TrxID (Replaces fake OTP & PIN) */}
          {step === 2 && (
            <form onSubmit={handleConfirmPayment} className="space-y-4">
              
              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2">
                  পেমেন্ট মাধ্যম বেছে নিন:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('bkash')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedMethod === 'bkash'
                        ? 'border-pink-600 bg-pink-50 text-pink-900 font-bold ring-2 ring-pink-600/30'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-pink-700">bKash</div>
                    <div className="text-[10px] text-neutral-500">বিকাশ</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('nagad')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedMethod === 'nagad'
                        ? 'border-orange-600 bg-orange-50 text-orange-900 font-bold ring-2 ring-orange-600/30'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-orange-700">Nagad</div>
                    <div className="text-[10px] text-neutral-500">নগদ</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('rocket')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedMethod === 'rocket'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold ring-2 ring-purple-600/30'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-purple-700">Rocket</div>
                    <div className="text-[10px] text-neutral-500">রকেট</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('bank_transfer')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedMethod === 'bank_transfer'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-600/30'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-emerald-800">Bank</div>
                    <div className="text-[10px] text-neutral-500">ব্যাংক ট্রান্সফার</div>
                  </button>
                </div>
              </div>

              {/* Admin Recipient Number Display Card (Requirement: Admin sets number, buyer sends money there) */}
              <div className="p-4 bg-emerald-50/80 border-2 border-emerald-300/80 rounded-2xl space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <PhoneCall className="w-4 h-4 text-emerald-700" />
                    <span>{currentAdminRecipient.title}</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-full">
                    টাকা পাঠানোর নম্বর
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-emerald-200">
                  <div className="font-mono text-sm sm:text-base font-bold text-neutral-900 tracking-wide select-all">
                    {currentAdminRecipient.number}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAdminNumber}
                    className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 shadow-xs"
                  >
                    {copiedAdminNumber ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-200" />
                        <span>কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>কপি করুন</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  💡 {currentAdminRecipient.instruction} প্রদেয় বুকিং অ্যাডভান্স: <strong className="font-mono text-emerald-950">৳{effectiveAdvance.toLocaleString('bn-BD')}</strong>
                </p>
              </div>

              {/* Buyer Confirmation Form: Sender Phone & TrxID */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    যে নম্বর থেকে টাকা পাঠিয়েছেন (প্রেরক নম্বর):
                  </label>
                  <input
                    type="text"
                    required
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="যেমন: ০১৭১২-৩৪৫৬৭৮"
                    className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    ট্রানজেকশন আইডি (Transaction ID / TrxID):
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="যেমন: 9J7A6B8C বা পেমেন্ট ট্রানজেকশন নম্বর"
                    className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono uppercase bg-white font-bold"
                  />
                  <span className="text-[11px] text-neutral-500 block mt-1">
                    টাকা পাঠানোর পর বিকাশ/নগদ এর এসএমএস বা অ্যাপ থেকে পাওয়া TrxID এখানে দিন।
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    রেফারেন্স / অতিরিক্ত নোট (ঐচ্ছিক):
                  </label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="যেমন: কোরবানির ষাঁড় বুকিং"
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              {/* Escrow Protection Notice */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>১০০% নিরাপদ এসক্রো গ্যারান্টি:</strong> অ্যাডমিন নম্বরে পাঠানো এই টাকা গরু বাজার কেন্দ্রীয় এসক্রো তহবিলে নিরাপদ থাকবে। গরু সুস্থ অবস্থায় বুঝে পাওয়ার পরেই খামারিকে পেমেন্ট ছাড় করা হবে।
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 border border-neutral-300 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-colors text-xs"
                >
                  পিছনে যান
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-2/3 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md text-xs"
                >
                  {isProcessing ? (
                    <span>যাচাই করা হচ্ছে...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>অ্যাডভান্স পেমেন্ট সম্পন্ন ও বুকিং নিশ্চিত করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Order Created & Payment Verified Receipt */}
          {step === 3 && createdOrder && createdPayment && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2.5">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">
                  বুকিং অ্যাডভান্স সফলভাবে গৃহীত হয়েছে!
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  আপনার বুকিং ও ট্রানজেকশন আইডি অ্যাডমিন ও বিক্রেতা খামারির কাছে সফলভাবে নিবন্ধিত হয়েছে।
                </p>
              </div>

              {/* Official Escrow Invoice Receipt */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-xs space-y-2.5">
                <div className="flex justify-between border-b border-neutral-200 pb-2">
                  <span className="text-neutral-500">অর্ডার নম্বর:</span>
                  <span className="font-mono font-bold text-neutral-900">{createdOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">লেনদেন আইডি (TrxID):</span>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {createdPayment.transactionId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">প্রেরক নম্বর:</span>
                  <span className="font-mono font-semibold text-neutral-800">{senderPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">প্রাপক অ্যাডমিন নম্বর:</span>
                  <span className="font-mono font-semibold text-neutral-800">{currentAdminRecipient.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">পরিশোধিত অ্যাডভান্স:</span>
                  <span className="font-mono font-bold text-emerald-950 text-sm">
                    ৳ {createdPayment.amount.toLocaleString('bn-BD')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">গরুর নাম ও কোড:</span>
                  <span className="font-medium text-neutral-800">{cow.name} ({cow.cowCode})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">খামারের নাম:</span>
                  <span className="font-medium text-neutral-800">{cow.sellerFarmName} ({cow.sellerPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">ডেলিভারির সময় অবশিষ্ট প্রদেয়:</span>
                  <span className="font-mono text-neutral-800 font-bold">
                    ৳ {createdOrder.remainingAmount.toLocaleString('bn-BD')}
                  </span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-2 text-[11px] text-neutral-500">
                  <span>পেমেন্ট তারিখ ও সময়:</span>
                  <span>{createdPayment.verifiedAt}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:flex-1 py-3 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors text-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>রশিদ প্রিন্ট / সেভ করুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setActivePage('buyer-dashboard');
                  }}
                  className="w-full sm:flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md text-xs"
                >
                  <span>আমার অর্ডারে দেখুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
