import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Quotation, QuotationStatus, FinanceType } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { calculateFinance, formatCurrency, formatDate } from '../../utils/calculations';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Eye,
  Edit2,
  Copy,
  Trash2,
  ArrowRight,
  FileSpreadsheet,
  Download,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export const QuotationsListPage: React.FC = () => {
  const { quotations, duplicateQuotation, deleteQuotation } = useApp();
  const navigate = useNavigate();

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [financeTypeFilter, setFinanceTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'financeAmount' | 'customerName'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Active action menu row id
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filtered and sorted quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const custName = q.customerName || q.title || '';
      const dlrName = q.dealerName || '';
      const matchesSearch =
        searchTerm === '' ||
        q.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        custName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dlrName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.assets.some((a) => a.model.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
      const matchesType = financeTypeFilter === 'all' || q.financeDetails.financeType === financeTypeFilter;

      return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'customerName') {
        const nameA = a.customerName || a.title || '';
        const nameB = b.customerName || b.title || '';
        comparison = nameA.localeCompare(nameB);
      } else if (sortBy === 'financeAmount') {
        const amtA = a.loanAmount || calculateFinance(a.assets, a.financeDetails).financeAmount;
        const amtB = b.loanAmount || calculateFinance(b.assets, b.financeDetails).financeAmount;
        comparison = amtA - amtB;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [quotations, searchTerm, statusFilter, financeTypeFilter, sortBy, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage) || 1;
  const paginatedQuotations = filteredQuotations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: 'createdAt' | 'financeAmount' | 'customerName') => {
    if (sortBy === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
    const newQuote = duplicateQuotation(id);
    navigate(`/quotations/${newQuote.id}/edit`);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      deleteQuotation(id);
    }
  };

  const handleConvert = (q: Quotation, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/proposals/new?quotationId=${q.id}`);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Quotations Module</h1>
          <p className="text-xs text-slate-500">
            Generate and manage customer asset finance quotations, pricing schedules and terms
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/quotations/new')}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Quotation
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, customer, dealer, asset model..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-brand-500 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="saved">Saved</option>
                <option value="converted">Converted</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Finance:</span>
              <select
                value={financeTypeFilter}
                onChange={(e) => {
                  setFinanceTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-brand-500 focus:outline-none"
              >
                <option value="all">All Product Types</option>
                <option value="hire_purchase">Hire Purchase</option>
                <option value="finance_lease">Finance Lease</option>
                <option value="operating_lease">Operating Lease</option>
                <option value="contract_hire">Contract Hire</option>
              </select>
            </div>

            {(searchTerm || statusFilter !== 'all' || financeTypeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setFinanceTypeFilter('all');
                  setCurrentPage(1);
                }}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quotations Data Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="py-3 px-4 font-semibold">Reference</th>
                <th
                  onClick={() => toggleSort('customerName')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Customer</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Dealer</th>
                <th className="py-3 px-4 font-semibold">Asset Description</th>
                <th className="py-3 px-4 font-semibold">Finance Type</th>
                <th className="py-3 px-4 font-semibold">Asset Cost</th>
                <th className="py-3 px-4 font-semibold">VAT</th>
                <th
                  onClick={() => toggleSort('financeAmount')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Finance Amount</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th
                  onClick={() => toggleSort('createdAt')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Created Date</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedQuotations.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-600">No quotations found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting your search criteria or create a new quotation.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedQuotations.map((q) => {
                  const calc = calculateFinance(q.assets, q.financeDetails);
                  const primaryAsset = q.assets[0];
                  const additionalCount = q.assets.length - 1;

                  return (
                    <tr
                      key={q.id}
                      onClick={() => navigate(`/quotations/${q.id}`)}
                      className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-brand-600">
                        {q.reference}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{q.customerName}</div>
                        <div className="text-[11px] text-slate-400">{q.contactPerson}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{q.dealerName}</td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="truncate font-medium text-slate-800">
                          {primaryAsset ? `${primaryAsset.manufacturer} ${primaryAsset.model}` : '—'}
                        </div>
                        {additionalCount > 0 && (
                          <span className="text-[10px] text-brand-600 font-medium">
                            +{additionalCount} additional asset{additionalCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize text-slate-700 font-medium">
                          {q.financeDetails.financeType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {formatCurrency(calc.assetSubtotal)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatCurrency(calc.vatAmount)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatCurrency(calc.financeAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={q.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(q.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="relative inline-flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/quotations/${q.id}`);
                            }}
                            title="View Details"
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/quotations/${q.id}/edit`);
                            }}
                            title="Edit Quotation"
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {q.status !== 'converted' && (
                            <button
                              onClick={(e) => handleConvert(q, e)}
                              title="Convert to Proposal"
                              className="rounded p-1 text-brand-600 hover:bg-brand-50"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          )}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === q.id ? null : q.id);
                              }}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {activeMenuId === q.id && (
                              <div
                                className="absolute right-0 mt-1 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-xl z-20"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => handleDuplicate(q.id, e)}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                                  Duplicate
                                </button>
                                <button
                                  onClick={(e) => handleDelete(q.id, e)}
                                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 bg-white text-xs text-slate-500">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-900">
              {filteredQuotations.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(currentPage * itemsPerPage, filteredQuotations.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-900">{filteredQuotations.length}</span> quotations
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="rounded-lg border border-slate-200 px-3 py-1 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-slate-600 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="rounded-lg border border-slate-200 px-3 py-1 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
