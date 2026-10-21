import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Dealer } from '../../types';
import { Modal } from '../../components/common/Modal';
import { formatCurrency } from '../../utils/calculations';
import {
  Store,
  Plus,
  Search,
  ArrowRight,
  ShieldCheck,
  Mail,
  Phone,
  Award,
  Building
} from 'lucide-react';

export const DealersListPage: React.FC = () => {
  const { dealers, addDealer } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // New Dealer State
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [tier, setTier] = useState<Dealer['tier']>('Gold');

  const filteredDealers = dealers.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDealer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const created = addDealer({
      name,
      contactName,
      email,
      phone,
      address,
      tier,
    });

    setModalOpen(false);
    navigate(`/dealers/${created.id}`);
  };

  const tierColor = (t: Dealer['tier']) => {
    switch (t) {
      case 'Platinum':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Gold':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Silver':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Equipment Dealer Network</h1>
          <p className="text-xs text-slate-500">
            Certified equipment suppliers, machinery dealerships, and commercial OEM distributors
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Enroll New Dealer
        </button>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search dealer branch, code, contact manager..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Dealers Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDealers.map((dealer) => (
          <div
            key={dealer.id}
            onClick={() => navigate(`/dealers/${dealer.id}`)}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-300 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-2.5 text-brand-600 border border-blue-100">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{dealer.name}</h3>
                    <span className="font-mono text-[10px] text-slate-500">{dealer.code}</span>
                  </div>
                </div>

                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${tierColor(dealer.tier)}`}>
                  {dealer.tier}
                </span>
              </div>

              <div className="mt-4 space-y-1 text-xs text-slate-600">
                <p className="font-medium text-slate-800">{dealer.contactName}</p>
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{dealer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{dealer.phone}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-medium">YTD Volume</span>
                <p className="font-bold text-brand-700">{formatCurrency(dealer.totalVolumeYTD)}</p>
              </div>

              <div className="flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700">
                <span>View Branch</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Dealer Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Enroll Equipment Dealer"
        description="Register a machinery dealership or franchise network partner"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateDealer} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700">Dealership Legal Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Midlands Truck & Van Centre Ltd"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700">Lead Sales Contact *</label>
            <input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Richard Hammond (Commercial Sales Director)"
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
                placeholder="e.g. sales@dealership.co.uk"
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
                placeholder="e.g. +44 121 789 0012"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700">Partnership Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none"
              >
                <option value="Platinum">Platinum (Volume &gt; £5M)</option>
                <option value="Gold">Gold (Volume &gt; £2M)</option>
                <option value="Silver">Silver (Volume &gt; £1M)</option>
                <option value="Standard">Standard</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700">Branch Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Tyburn Road, Birmingham, B24 9NZ"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none"
              />
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
              Save Dealership
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
