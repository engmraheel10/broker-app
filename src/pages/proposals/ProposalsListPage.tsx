import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Proposal, ProposalStatus } from '../../types';
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
  Trash2,
  Send,
  FileText,
  Landmark,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ProposalsListPage: React.FC = () => {
  const { proposals, deleteProposal, submitProposal } = useApp();
  const navigate = useNavigate();

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [lenderFilter, setLenderFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'financeAmount' | 'customerName'>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filtered and sorted proposals
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const matchesSearch =
        searchTerm === '' ||
        p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.lenderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brokerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.dealerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesLender = lenderFilter === 'all' || p.lenderId === lenderFilter;

      return matchesSearch && matchesStatus && matchesLender;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'updatedAt') {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else if (sortBy === 'customerName') {
        comparison = a.customerName.localeCompare(b.customerName);
      } else if (sortBy === 'financeAmount') {
        const amtA = calculateFinance(a.assets, a.financeDetails).financeAmount;
        const amtB = calculateFinance(b.assets, b.financeDetails).financeAmount;
        comparison = amtA - amtB;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [proposals, searchTerm, statusFilter, lenderFilter, sortBy, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage) || 1;
  const paginatedProposals = filteredProposals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: 'updatedAt' | 'financeAmount' | 'customerName') => {
    if (sortBy === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const handleQuickSubmit = (p: Proposal, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Submit proposal ${p.reference} to ${p.lenderName}? (Simulated)`)) {
      submitProposal(p.id);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      deleteProposal(id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Credit Proposals</h1>
          <p className="text-xs text-slate-500">
            Track lender credit submissions, underwriting reviews, decisions, and broker allocations
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/proposals/new')}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Proposal Wizard
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
              placeholder="Search reference, customer, lender, broker..."
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
                <option value="ready_to_submit">Ready to Submit</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Lender:</span>
              <select
                value={lenderFilter}
                onChange={(e) => {
                  setLenderFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-brand-500 focus:outline-none"
              >
                <option value="all">All Lenders</option>
                <option value="lnd-investec">Investec Asset Finance</option>
                <option value="lnd-internal">Capitas Internal Credit</option>
                <option value="lnd-lombard">Lombard Asset Finance</option>
                <option value="lnd-aldermore">Aldermore Bank</option>
                <option value="lnd-close">Close Brothers</option>
              </select>
            </div>

            {(searchTerm || statusFilter !== 'all' || lenderFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setLenderFilter('all');
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

      {/* Proposals Data Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="py-3 px-4 font-semibold">Reference</th>
                <th className="py-3 px-4 font-semibold">Related Quotation</th>
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
                <th className="py-3 px-4 font-semibold">Broker</th>
                <th className="py-3 px-4 font-semibold text-center">Assets</th>
                <th className="py-3 px-4 font-semibold">Asset Value</th>
                <th
                  onClick={() => toggleSort('financeAmount')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Finance Amount</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Lender</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th
                  onClick={() => toggleSort('updatedAt')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Last Updated</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProposals.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-600">No proposals found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Start a new multi-step proposal or convert an existing quotation.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedProposals.map((p) => {
                  const calc = calculateFinance(p.assets, p.financeDetails);
                  const canSubmit = p.status === 'ready_to_submit' || p.status === 'draft';

                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/proposals/${p.id}`)}
                      className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-brand-600">
                        {p.reference}
                      </td>
                      <td className="py-3 px-4">
                        {p.quotationReference ? (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/quotations/${p.quotationId}`);
                            }}
                            className="text-brand-600 hover:underline font-mono text-[11px]"
                          >
                            {p.quotationReference}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Direct Entry</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{p.customerName}</div>
                        <div className="text-[11px] text-slate-400">{p.contactPerson}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{p.dealerName}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{p.brokerName}</div>
                        <div className="text-[10px] text-slate-400">{p.brokerOrg}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-700">
                        {p.assets.length}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {formatCurrency(calc.totalCostIncVAT)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatCurrency(calc.financeAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">
                          {p.lenderName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={p.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(p.updatedAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="relative inline-flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/proposals/${p.id}`);
                            }}
                            title="View Proposal Details"
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/proposals/${p.id}/edit`);
                            }}
                            title="Edit Proposal"
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {canSubmit && (
                            <button
                              onClick={(e) => handleQuickSubmit(p, e)}
                              title="Submit to Lender"
                              className="rounded p-1 text-emerald-600 hover:bg-emerald-50"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === p.id ? null : p.id);
                              }}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {activeMenuId === p.id && (
                              <div
                                className="absolute right-0 mt-1 w-32 rounded-lg border border-slate-200 bg-white py-1 shadow-xl z-20"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => handleDelete(p.id, e)}
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
              {filteredProposals.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(currentPage * itemsPerPage, filteredProposals.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-900">{filteredProposals.length}</span> proposals
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
