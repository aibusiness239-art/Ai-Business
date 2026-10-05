import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './components/Home';
import { Marketplace } from './components/Marketplace';
import { CowDetails } from './components/CowDetails';
import { PackagesPage } from './components/PackagesPage';
import { SafetyPage } from './components/SafetyPage';
import { SellerDashboard } from './components/SellerDashboard';
import { BuyerDashboard } from './components/BuyerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { DashboardGuard } from './components/DashboardGuard';
import { AuthModal } from './components/AuthModal';
import { AdvancePaymentModal } from './components/AdvancePaymentModal';
import { SubscriptionModal } from './components/SubscriptionModal';

const AppContent: React.FC = () => {
  const {
    activePage,
    setActivePage,
    selectedCowId,
    authModalOpen,
    setAuthModalOpen,
    paymentModalCow,
    setPaymentModalCow,
    subscriptionModalOpen,
    setSubscriptionModalOpen,
  } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans">
      <Header />

      <main className="flex-1">
        {activePage === 'home' && <Home />}
        {activePage === 'marketplace' && <Marketplace />}
        {activePage === 'cow-details' && selectedCowId && (
          <CowDetails cowId={selectedCowId} onBack={() => setActivePage('marketplace')} />
        )}
        {activePage === 'packages' && <PackagesPage />}
        {activePage === 'safety' && <SafetyPage />}
        {activePage === 'seller-dashboard' && (
          <DashboardGuard requiredRole="seller">
            <SellerDashboard />
          </DashboardGuard>
        )}
        {activePage === 'buyer-dashboard' && (
          <DashboardGuard requiredRole="buyer">
            <BuyerDashboard />
          </DashboardGuard>
        )}
        {activePage === 'admin-dashboard' && (
          <DashboardGuard requiredRole="admin">
            <AdminDashboard />
          </DashboardGuard>
        )}
      </main>

      <Footer />

      {/* Global Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <AdvancePaymentModal cow={paymentModalCow} onClose={() => setPaymentModalCow(null)} />
      <SubscriptionModal isOpen={subscriptionModalOpen} onClose={() => setSubscriptionModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
