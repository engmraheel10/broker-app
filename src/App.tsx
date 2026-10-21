import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { QuotationsListPage } from './pages/quotations/QuotationsListPage';
import { QuotationFormPage } from './pages/quotations/QuotationFormPage';
import { QuotationDetailPage } from './pages/quotations/QuotationDetailPage';

import { ProposalsListPage } from './pages/proposals/ProposalsListPage';
import { ProposalWizardPage } from './pages/proposals/ProposalWizardPage';
import { ProposalDetailPage } from './pages/proposals/ProposalDetailPage';

import { CustomersListPage } from './pages/customers/CustomersListPage';
import { CustomerDetailPage } from './pages/customers/CustomerDetailPage';

import { AssetsListPage } from './pages/assets/AssetsListPage';

import { BrokersListPage } from './pages/brokers/BrokersListPage';
import { BrokerDetailPage } from './pages/brokers/BrokerDetailPage';

import { DealersListPage } from './pages/dealers/DealersListPage';
import { DealerDetailPage } from './pages/dealers/DealerDetailPage';

import { LendersPage } from './pages/lenders/LendersPage';
import { UsersPage } from './pages/users/UsersPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { AuditHistoryPage } from './pages/audit/AuditHistoryPage';
import { SettingsPage } from './pages/settings/SettingsPage';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Quotations Module */}
            <Route path="quotations" element={<QuotationsListPage />} />
            <Route path="quotations/new" element={<QuotationFormPage />} />
            <Route path="quotations/:id" element={<QuotationDetailPage />} />
            <Route path="quotations/:id/edit" element={<QuotationFormPage />} />

            {/* Proposals Module */}
            <Route path="proposals" element={<ProposalsListPage />} />
            <Route path="proposals/new" element={<ProposalWizardPage />} />
            <Route path="proposals/:id" element={<ProposalDetailPage />} />
            <Route path="proposals/:id/edit" element={<ProposalWizardPage />} />

            {/* Customer Directory */}
            <Route path="customers" element={<CustomersListPage />} />
            <Route path="customers/:id" element={<CustomerDetailPage />} />

            {/* Assets Register */}
            <Route path="assets" element={<AssetsListPage />} />

            {/* Brokers Module */}
            <Route path="brokers" element={<BrokersListPage />} />
            <Route path="brokers/:id" element={<BrokerDetailPage />} />

            {/* Dealers Module */}
            <Route path="dealers" element={<DealersListPage />} />
            <Route path="dealers/:id" element={<DealerDetailPage />} />

            {/* Administration & Operations */}
            <Route path="lenders" element={<LendersPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="audit" element={<AuditHistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
