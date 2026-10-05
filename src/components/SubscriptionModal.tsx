import React, { useState } from 'react';
import { SubscriptionPlan, PaymentRecord } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  Check,
  Crown,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPlanId?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, preselectedPlanId }) => {
  const { currentUser, plans, purchaseSubscription, setAuthModalOpen } = useApp();

  const [selectedPlanId, setSelectedPlanId] = useState<string>(preselectedPlanId || 'plan-standard');
  const [step, setStep] = useState<'select' | 'pay' | 'success'>('select');
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord['method']>('bkash');
  const [accountNumber, setAccountNumber] = useState(currentUser?.phone || '০১৭১২-৩৪৫৬৭৮');
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [purchasedPlan, setPurchasedPlan] = useState<SubscriptionPlan | null>(null);

  if (!isOpen) return null;

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[1] || plans[0];

  const handleProceedToPayment = (plan: SubscriptionPlan) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setSelectedPlanId(plan.id);
    if (plan.price === 0) {
      // Free package: activate directly
      handleFreeActivation(plan);
      return;
    }
    setStep('pay');
  };

  const handleFreeActivation = async (plan: SubscriptionPlan) => {
    setIsProcessing(true);
    const res = await purchaseSubscription(plan.id, 'bkash', 'FREE_TRIAL');
    setIsProcessing(false);
    if (res.success) {
      setPurchasedPlan(plan);
      setStep('success');
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!accountNumber) {
      setErrorMessage('একাউন্ট নম্বর প্রদান করুন');
      return;
    }
    if (!pin) {
      setErrorMessage('পিন নম্বর প্রদান করুন');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const res = await purchaseSubscription(selectedPlan.id, paymentMethod, accountNumber);
      if (res.success) {
        setPurchasedPlan(selectedPlan);
        setStep('success');
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'পেমেন্ট প্রসেসিং ব্যর্থ হয়েছে');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-neutral-200">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span>খামারি সাবস্ক্রিপশন প্যাকেজ</span>
            </h2>
            <p className="text-xs text-neutral-500">
              আপনার খামারের গরু বিক্রির সুযোগ বাড়াতে উপযুক্ত প্যাকেজ বেছে নিন
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Select Plan */}
        {step === 'select' && (
          <div className="p-6">
            {/* Free listing highlight */}
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  🎁
                </div>
                <div>
                  <div className="font-semibold text-emerald-950 text-sm">নতুন খামারিদের জন্য ১টি লিস্টিং সম্পূর্ণ ফ্রি!</div>
                  <div className="text-xs text-emerald-800">
                    রেজিস্ট্রেশন করলেই প্রথম ১টি গরু কোনো ফি ছাড়াই ৩০ দিনের জন্য লিস্টিং করতে পারবেন।
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {plans.map((plan) => {
                const isPopular = plan.id === 'plan-standard';
                const isSelected = plan.id === selectedPlanId;

                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl p-5 border flex flex-col justify-between transition-all relative ${
                      isPopular
                        ? 'border-emerald-600 shadow-md bg-emerald-950/2'
                        : isSelected
                        ? 'border-neutral-400 bg-neutral-50/50'
                        : 'border-neutral-200 bg-white'
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm">
                        {plan.badge}
                      </div>
                    )}

                    <div>
                      <div className="text-base font-bold text-neutral-900 mt-1">{plan.nameBn}</div>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-neutral-900 font-mono">
                          ৳{plan.price.toLocaleString('bn-BD')}
                        </span>
                        <span className="text-xs text-neutral-500">/ {plan.durationDays} দিন</span>
                      </div>

                      <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2.5">
                        <div className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span>সর্বোচ্চ লিস্টিং: <strong className="text-emerald-700">{plan.listingLimit}টি গরু</strong></span>
                        </div>
                        {plan.featuredSlots > 0 && (
                          <div className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>ফিচার্ড স্পট: {plan.featuredSlots}টি গরু</span>
                          </div>
                        )}

                        <div className="pt-2 space-y-2">
                          {plan.features.map((f, i) => (
                            <div key={i} className="text-xs text-neutral-600 flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleProceedToPayment(plan)}
                      className={`mt-6 w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                        isPopular
                          ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                      }`}
                    >
                      <span>{plan.price === 0 ? 'বিনামূল্যে সক্রিয় করুন' : 'প্যাকেজটি বেছে নিন'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Checkout for Paid Plan */}
        {step === 'pay' && selectedPlan && (
          <div className="p-6 max-w-lg mx-auto space-y-5">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
              <div>
                <div className="text-xs text-emerald-800">নির্বাচিত প্যাকেজ</div>
                <div className="text-base font-bold text-emerald-950">{selectedPlan.nameBn}</div>
                <div className="text-xs text-neutral-600">{selectedPlan.listingLimit}টি গরু · {selectedPlan.durationDays} দিন মেয়াদ</div>
              </div>
              <div className="text-xl font-mono font-bold text-neutral-900">
                ৳{selectedPlan.price.toLocaleString('bn-BD')}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-2">
                পেমেন্ট মেথড নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    paymentMethod === 'bkash' ? 'border-pink-600 bg-pink-50 ring-1 ring-pink-600' : 'border-neutral-200'
                  }`}
                >
                  <div className="font-bold text-xs text-pink-700">বিকাশ</div>
                  <div className="text-[10px] text-neutral-500">01711...</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    paymentMethod === 'nagad' ? 'border-orange-600 bg-orange-50 ring-1 ring-orange-600' : 'border-neutral-200'
                  }`}
                >
                  <div className="font-bold text-xs text-orange-700">নগদ</div>
                  <div className="text-[10px] text-neutral-500">01722...</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    paymentMethod === 'bank_transfer' ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600' : 'border-neutral-200'
                  }`}
                >
                  <div className="font-bold text-xs text-emerald-700">ব্যাংক</div>
                  <div className="text-[10px] text-neutral-500">ইসলামী ব্যাংক</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                আপনার মোবাইল ব্যাংকিং অ্যাকাউন্ট নম্বর:
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="০১৭১২-XXXXXX"
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                গোপন পিন নম্বর দিন:
              </label>
              <input
                type="password"
                maxLength={5}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="• • • • •"
                className="w-full text-center tracking-widest text-lg font-mono py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="w-1/3 py-2.5 border border-neutral-300 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 text-xs"
              >
                প্যাকেজ পরিবর্তন
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmPurchase}
                className="w-2/3 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>যাচাই করা হচ্ছে...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>৳{selectedPlan.price.toLocaleString('bn-BD')} পরিশোধ করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Success Screen */}
        {step === 'success' && purchasedPlan && (
          <div className="p-8 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900">
              সাবস্ক্রিপশন সফলভাবে সক্রিয় হয়েছে!
            </h3>
            <p className="text-sm text-neutral-600">
              আপনার একাউন্টে <strong>{purchasedPlan.nameBn}</strong> যুক্ত হয়েছে। আপনি এখন আরও{' '}
              <strong>{purchasedPlan.listingLimit}টি গরু</strong> লিস্টিং করতে পারবেন।
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                লিস্টিং শুরু করুন
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
