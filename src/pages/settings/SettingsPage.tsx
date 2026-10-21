import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building,
  Coins,
  Cpu,
  Bell,
  Save,
  Check,
  ShieldCheck,
  Key
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'org' | 'finance' | 'integrations' | 'notifications'>('org');

  // Org state
  const [companyName, setCompanyName] = useState('Capitas Commercial Finance Ltd');
  const [fcaNumber, setFcaNumber] = useState('FCA-892019');
  const [vatNumber, setVatNumber] = useState('GB 992 4810 22');
  const [address, setAddress] = useState('Capitas House, Colmore Row, Birmingham, B3 2BJ');

  // Finance defaults
  const [vatRate, setVatRate] = useState(20);
  const [defaultTerm, setDefaultTerm] = useState(48);
  const [defaultRate, setDefaultRate] = useState(6.5);
  const [defaultDocFee, setDefaultDocFee] = useState(295);

  // Toggles
  const [emailOnSubmit, setEmailOnSubmit] = useState(true);
  const [emailOnDecision, setEmailOnDecision] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Configuration Saved', 'Platform parameters and defaults updated successfully.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Platform Settings & Configuration</h1>
          <p className="text-xs text-slate-500">
            Tenant organization profile, financial calculation defaults, lender API gateways, and notifications
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
        >
          <Save className="h-4 w-4" />
          Save Settings
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-xs font-medium">
          {[
            { id: 'org', label: 'Organization & Licensing', icon: Building },
            { id: 'finance', label: 'Financial Defaults & Pricing', icon: Coins },
            { id: 'integrations', label: 'Lender API Gateways', icon: Cpu },
            { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 border-b-2 py-3 px-1 transition-colors ${
                  isActive
                    ? 'border-brand-600 text-brand-600 font-bold'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab 1: Organization */}
      {activeTab === 'org' && (
        <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Tenant Entity Profile</h3>

          <div className="grid grid-cols-1 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700">Company Legal Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700">FCA Authorisation Number</label>
                <input
                  type="text"
                  value={fcaNumber}
                  onChange={(e) => setFcaNumber(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700">VAT Registration Number</label>
                <input
                  type="text"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700">Headquarters Registered Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Finance Defaults */}
      {activeTab === 'finance' && (
        <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Financial Calculation Engine Defaults</h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700">Standard VAT Rate (%)</label>
              <input
                type="number"
                value={vatRate}
                onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700">Default Duration (Months)</label>
              <input
                type="number"
                value={defaultTerm}
                onChange={(e) => setDefaultTerm(parseInt(e.target.value) || 48)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700">Default Annual Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={defaultRate}
                onChange={(e) => setDefaultRate(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700">Standard Documentation Fee (£)</label>
              <input
                type="number"
                value={defaultDocFee}
                onChange={(e) => setDefaultDocFee(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </form>
      )}

      {/* Tab 3: Lender Integrations */}
      {activeTab === 'integrations' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 max-w-2xl text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Lender API Gateways & Credentials</h3>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Investec Asset Finance Gateway</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                  Connected
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">Direct integration for commercial equipment quoting & automated underwriting</p>
              <div className="pt-2">
                <label className="block font-mono text-[10px] text-slate-400">PRODUCTION_API_KEY</label>
                <input
                  type="password"
                  disabled
                  value="inv_live_8849201948201948201"
                  className="mt-1 w-full rounded bg-slate-100 border border-slate-200 px-3 py-1.5 font-mono text-slate-600"
                />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Lombard Broker Portal API</span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
                  Demo Active
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">Specialist heavy commercial vehicles and green asset facilities</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Notifications */}
      {activeTab === 'notifications' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 max-w-2xl text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Notification & Alert Preferences</h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <div>
                <p className="font-semibold text-slate-900">Email on Proposal Submission</p>
                <p className="text-[11px] text-slate-500">Notify broker and dealer when application is transmitted to lender</p>
              </div>
              <input
                type="checkbox"
                checked={emailOnSubmit}
                onChange={(e) => setEmailOnSubmit(e.target.checked)}
                className="h-4 w-4 rounded text-brand-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <div>
                <p className="font-semibold text-slate-900">Email on Lender Decision</p>
                <p className="text-[11px] text-slate-500">Immediate dispatch when credit facility is Approved, Referred, or Rejected</p>
              </div>
              <input
                type="checkbox"
                checked={emailOnDecision}
                onChange={(e) => setEmailOnDecision(e.target.checked)}
                className="h-4 w-4 rounded text-brand-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <div>
                <p className="font-semibold text-slate-900">Weekly Pipeline Digest</p>
                <p className="text-[11px] text-slate-500">Summary of active quotations and proposal progress every Monday 8:00 AM</p>
              </div>
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
                className="h-4 w-4 rounded text-brand-600"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
