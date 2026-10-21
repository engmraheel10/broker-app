import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';
import { Truck, Search, Filter, ExternalLink, ShieldCheck, Tag } from 'lucide-react';

export const AssetsListPage: React.FC = () => {
  const { assets } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.dealerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.serialNumber && a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Asset & Collateral Register</h1>
          <p className="text-xs text-slate-500">
            Portfolio registry of commercial vehicles, construction plant, CNC machinery, and agricultural assets
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search manufacturer, model, serial no, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Commercial Vehicles">Commercial Vehicles</option>
            <option value="Construction & Earthmoving">Construction & Earthmoving</option>
            <option value="Engineering / CNC">Engineering / CNC</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Materials Handling">Materials Handling</option>
          </select>
        </div>
      </div>

      {/* Assets Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Equipment / Asset</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Serial / VIN No.</th>
                <th className="py-3 px-4 font-semibold">Year</th>
                <th className="py-3 px-4 font-semibold">Valuation</th>
                <th className="py-3 px-4 font-semibold">Dealer Supplier</th>
                <th className="py-3 px-4 font-semibold">Borrower Customer</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Linked Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{asset.manufacturer}</div>
                    <div className="text-slate-600">{asset.model}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{asset.category}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                    {asset.serialNumber || 'Pending Delivery'}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{asset.year || 2026}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(asset.value)}</td>
                  <td className="py-3 px-4 text-slate-700">{asset.dealerName}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{asset.customerName}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200 capitalize">
                      {asset.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {asset.proposalRef ? (
                      <span className="font-mono text-brand-600 font-semibold">{asset.proposalRef}</span>
                    ) : (
                      <span className="font-mono text-slate-500">{asset.quotationRef || '—'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
