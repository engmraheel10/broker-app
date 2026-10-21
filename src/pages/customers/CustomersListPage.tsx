import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Customer, CustomerType } from '../../types';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/calculations';
import {
  Users,
  Plus,
  Search,
  Building2,
  User,
  ArrowRight,
  Eye,
  Mail,
  Phone,
  CheckCircle2
} from 'lucide-react';

export const CustomersListPage: React.FC = () => {
  const { customers, addCustomer } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  // New Customer Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<CustomerType>('business');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [companyNumber, setCompanyNumber] = useState('');

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.companyNumber && c.companyNumber.includes(searchTerm));

    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const created = addCustomer({
      name,
      type,
      contactPerson,
      email,
      phone,
      address,
      companyNumber: type === 'business' ? companyNumber : undefined,
    });

    setModalOpen(false);
    setName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCompanyNumber('');
    navigate(`/customers/${created.id}`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Customer Directory</h1>
          <p className="text-xs text-slate-500">
            Manage commercial borrowers, limited corporations, and sole-trader profiles
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, contact person, registration number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Entity Types</option>
            <option value="business">Limited Companies</option>
            <option value="individual">Sole Traders / Individuals</option>
          </select>
        </div>
      </div>

      {/* Customer List Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map((cust) => (
          <div
            key={cust.id}
            onClick={() => navigate(`/customers/${cust.id}`)}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-300 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                    {cust.type === 'business' ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{cust.name}</h3>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      {cust.type === 'business' ? 'Limited Company' : 'Sole Trader'}
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                  {cust.creditRating || 'Active'}
                </span>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                <p className="font-medium text-slate-800">{cust.contactPerson}</p>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{cust.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{cust.phone}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-[11px] text-slate-400">Total Requested</span>
                <p className="font-bold text-brand-700">{formatCurrency(cust.totalFinanceRequested)}</p>
              </div>
              <div className="flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700">
                <span>View Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Customer Profile"
        description="Register a commercial enterprise or individual for credit facilities"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
          <div className="flex items-center gap-4 border-b pb-3">
            <span className="font-medium text-slate-700">Entity:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="cType"
                checked={type === 'business'}
                onChange={() => setType('business')}
                className="text-brand-600"
              />
              <span>Limited Company</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="cType"
                checked={type === 'individual'}
                onChange={() => setType('individual')}
                className="text-brand-600"
              />
              <span>Individual / Sole Trader</span>
            </label>
          </div>

          <div>
            <label className="block font-medium text-slate-700">
              {type === 'business' ? 'Company Name *' : 'Full Name *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'business' ? 'e.g. BlueSky Distribution Ltd' : 'e.g. John Doe'}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:border-brand-500"
            />
          </div>

          {type === 'business' && (
            <div>
              <label className="block font-medium text-slate-700">Companies House Number</label>
              <input
                type="text"
                value={companyNumber}
                onChange={(e) => setCompanyNumber(e.target.value)}
                placeholder="e.g. 10928412"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700">Contact Person</label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Sarah Connor (Director)"
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
                placeholder="e.g. accounts@bluesky.co.uk"
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
                placeholder="e.g. +44 121 445 9210"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700">Registered Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 12 High Street, Birmingham, B1 1AA"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none"
            />
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
              className="rounded-lg bg-brand-600 px-4 py-2 font-bold text-white hover:bg-brand-700 shadow-sm"
            >
              Save Customer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
