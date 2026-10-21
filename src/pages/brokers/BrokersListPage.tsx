import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Broker } from '../../types';
import { Modal } from '../../components/common/Modal';
import {
  Briefcase,
  Plus,
  Search,
  ArrowRight,
  ShieldCheck,
  Mail,
  Phone,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

export const BrokersListPage: React.FC = () => {
  const { brokers, addBroker } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // New Broker State
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fcaNumber, setFcaNumber] = useState('');
  const [commissionTier, setCommissionTier] = useState('Tier 1 Prime (1.75%)');
  const [region, setRegion] = useState('Midlands & South East');

  const filteredBrokers = brokers.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.fcaNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateBroker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const created = addBroker({
      name,
      organization,
      email,
      phone,
      fcaNumber: fcaNumber || `FCA-${Math.floor(100000 + Math.random() * 900000)}`,
      commissionTier,
      region,
    });

    setModalOpen(false);
    navigate(`/brokers/${created.id}`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Broker Intermediary Directory</h1>
          <p className="text-xs text-slate-500">
            Authorized commercial finance brokers, packaging agents, and FCA-regulated partners
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Broker Partner
        </button>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search broker name, firm, FCA license..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Brokers Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {filteredBrokers.map((broker) => (
          <div
            key={broker.id}
            onClick={() => navigate(`/brokers/${broker.id}`)}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-300 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-purple-50 p-2.5 text-purple-700 border border-purple-100">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{broker.name}</h3>
                    <p className="text-xs font-semibold text-slate-600">{broker.organization}</p>
                    <span className="mt-0.5 inline-block rounded bg-slate-100 px-2 py-0.2 text-[10px] font-mono text-slate-600">
                      {broker.fcaNumber}
                    </span>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200 capitalize">
                  {broker.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{broker.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{broker.phone}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Proposals</span>
                  <p className="font-bold text-slate-900">{broker.proposalsCount} Active</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Approval Rate</span>
                  <p className="font-bold text-emerald-600">{broker.approvalRate}%</p>
                </div>
              </div>

              <div className="flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700">
                <span>Manage Broker</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Broker Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register Broker Partner"
        description="Enroll an authorized broker firm into the intermediary network"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateBroker} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700">Broker Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alistair Montgomery"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700">Firm / Organization *</label>
            <input
              type="text"
              required
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. Montgomery Commercial Finance Ltd"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. a.montgomery@brokerage.co.uk"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700">Telephone *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +44 207 946 0991"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700">FCA Registration Number</label>
              <input
                type="text"
                value={fcaNumber}
                onChange={(e) => setFcaNumber(e.target.value)}
                placeholder="e.g. FCA-881920"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700">Commission Tier</label>
              <select
                value={commissionTier}
                onChange={(e) => setCommissionTier(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none"
              >
                <option value="Tier 1 Prime (1.75%)">Tier 1 Prime (1.75%)</option>
                <option value="Tier 2 (1.50%)">Tier 2 (1.50%)</option>
                <option value="Tier 3 Standard (1.25%)">Tier 3 Standard (1.25%)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-4 py-2 font-bold text-white hover:bg-brand-700"
            >
              Save Broker
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
