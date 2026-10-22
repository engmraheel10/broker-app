import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Quotation, Proposal, FinanceType, AssetCategoryType } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { calculateFinance, formatCurrency, formatDate } from '../../utils/calculations';
import {
  FolderKanban,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Copy,
  ArrowRight,
  Send,
  MoreVertical,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  Building2,
  Coins
} from 'lucide-react';

export const WorkspacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    quotations,
    proposals,
    deleteQuotation,
    deleteProposal,
    saveQuotation,
    saveProposal,
    duplicateQuotation,
    submitProposal,
    dealers,
    lenders,
    addToast
  } = useApp();

  // Active workspace filter: 'quotations' | 'proposals'
  const initialTab = searchParams.get('tab') === 'proposals' ? 'proposals' : 'quotations';
  const [activeTab, setActiveTab] = useState<'quotations' | 'proposals'>(initialTab);

  // Search & Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit Quotation Modal State
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAssetType, setEditAssetType] = useState<AssetCategoryType>('hard');
  const [editAssetQuantity, setEditAssetQuantity] = useState(1);
  const [editAssetCost, setEditAssetCost] = useState(0);
  const [editFinanceType, setEditFinanceType] = useState<FinanceType>('hire_purchase');
  const [editTermMonths, setEditTermMonths] = useState(48);
  const [editInterestRate, setEditInterestRate] = useState(6.5);
  const [editDeposit, setEditDeposit] = useState(10000);

  // Edit Proposal Modal State
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editContactPerson, setEditContactPerson] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLenderId, setEditLenderId] = useState('');
  const [editProposalStatus, setEditProposalStatus] = useState<any>('draft');

  // Handle Tab Switch
  const handleSwitchTab = (tab: 'quotations' | 'proposals') => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setSearchTerm('');
    setStatusFilter('all');
  };

  // Open Edit Quotation Modal
  const openEditQuotation = (q: Quotation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingQuotation(q);
    setEditTitle(q.title || q.customerName || q.reference);
    setEditAssetType(q.assetCategoryType || 'hard');
    setEditAssetQuantity(q.assetQuantity || (q.assets?.[0]?.quantity) || 1);
    setEditAssetCost(q.assetCost || (q.assets?.[0]?.unitPrice) || 50000);
    setEditFinanceType(q.financeDetails?.financeType || 'hire_purchase');
    setEditTermMonths(q.financeDetails?.termMonths || 48);
    setEditInterestRate(q.financeDetails?.interestRate || 6.5);
    setEditDeposit(q.financeDetails?.deposit || 10000);
  };

  const handleSaveQuotationEdit = () => {
    if (!editingQuotation) return;
    const updated = saveQuotation({
      ...editingQuotation,
      title: editTitle,
      assetCategoryType: editAssetType,
      assetQuantity: editAssetQuantity,
      assetCost: editAssetCost,
      financeDetails: {
        ...editingQuotation.financeDetails,
        financeType: editFinanceType,
        termMonths: editTermMonths,
        interestRate: editInterestRate,
        deposit: editDeposit,
      },
      assets: [
        {
          id: editingQuotation.assets?.[0]?.id || `ast-${Date.now()}`,
          category: editAssetType === 'hard' ? 'Hard Machinery' : 'Soft Asset',
          manufacturer: 'Asset Line',
          model: editTitle,
          description: `${editAssetType.toUpperCase()} Asset`,
          quantity: editAssetQuantity,
          unitPrice: editAssetCost,
          additionalCosts: 0,
        },
      ],
    });
    setEditingQuotation(null);
    addToast('Quotation Updated', `${updated.reference} updated successfully.`, 'success');
  };

  // Open Edit Proposal Modal
  const openEditProposal = (p: Proposal, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProposal(p);
    setEditCustomerName(p.customerName);
    setEditContactPerson(p.contactPerson);
    setEditEmail(p.email);
    setEditPhone(p.phone);
    setEditLenderId(p.lenderId);
    setEditProposalStatus(p.status);
  };

  const handleSaveProposalEdit = () => {
    if (!editingProposal) return;
    const selectedLnd = lenders.find(l => l.id === editLenderId);
    const updated = saveProposal({
      id: editingProposal.id,
      customerName: editCustomerName,
      contactPerson: editContactPerson,
      email: editEmail,
      phone: editPhone,
      lenderId: editLenderId,
      lenderName: selectedLnd ? selectedLnd.name : editingProposal.lenderName,
      status: editProposalStatus,
    });
    setEditingProposal(null);
    addToast('Proposal Updated', `${updated.reference} updated successfully.`, 'success');
  };

  // Filtered Quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const matchesSearch =
        searchTerm === '' ||
        q.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.title && q.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.customerName && q.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.financeDetails?.financeType && q.financeDetails.financeType.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [quotations, searchTerm, statusFilter]);

  // Filtered Proposals
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const matchesSearch =
        searchTerm === '' ||
        p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.lenderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brokerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.quotationReference && p.quotationReference.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [proposals, searchTerm, statusFilter]);

  return (
    <div className="space-y-5">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Workspace</h1>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {quotations.length + proposals.length} Total Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, edit, update, or convert all saved quotations and submitted proposals in one central hub.
          </p>
        </div>

        {/* Quick Actions to create */}
        <div className="mt-3 sm:mt-0 flex items-center gap-2">
          <button
            onClick={() => navigate('/quotations')}
            className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 text-slate-500" />
            <span>Create Quotation</span>
          </button>
          <button
            onClick={() => navigate('/proposals')}
            className="flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Proposal</span>
          </button>
        </div>
      </div>

      {/* Prominent Button Filter: Quotations vs Proposals */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => handleSwitchTab('quotations')}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'quotations'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Quotations</span>
            <span
              className={`rounded-full px-2 py-0.2 text-[10px] ${
                activeTab === 'quotations' ? 'bg-navy-800 text-slate-200' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {quotations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchTab('proposals')}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'proposals'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Proposals</span>
            <span
              className={`rounded-full px-2 py-0.2 text-[10px] ${
                activeTab === 'proposals' ? 'bg-navy-800 text-slate-200' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {proposals.length}
            </span>
          </button>
        </div>

        {/* Search & Status Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-md border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-brand-600 focus:outline-none w-56"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {activeTab === 'quotations' ? (
              <>
                <option value="saved">Saved</option>
                <option value="converted">Converted</option>
                <option value="draft">Draft</option>
              </>
            ) : (
              <>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="under_review">Under Review</option>
                <option value="draft">Draft</option>
                <option value="ready_to_submit">Ready to Submit</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* TAB 1: QUOTATIONS LIST */}
      {activeTab === 'quotations' && (
        <div className="rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Reference / Title</th>
                  <th className="py-2.5 px-3 font-semibold">Asset Type</th>
                  <th className="py-2.5 px-3 font-semibold">Finance Type</th>
                  <th className="py-2.5 px-3 font-semibold">Net Cost</th>
                  <th className="py-2.5 px-3 font-semibold">VAT</th>
                  <th className="py-2.5 px-3 font-semibold">Deposit</th>
                  <th className="py-2.5 px-3 font-semibold">Loan / Finance Amount</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Term</th>
                  <th className="py-2.5 px-3 font-semibold">Est. Repayment</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotations.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-10 text-center text-slate-400">
                      <FileSpreadsheet className="mx-auto h-7 w-7 text-slate-300 mb-2" />
                      <p className="font-medium text-slate-600 text-xs">No quotations found in Workspace.</p>
                      <button
                        onClick={() => navigate('/quotations')}
                        className="mt-2 text-xs font-semibold text-brand-600 hover:underline"
                      >
                        Create your first quotation &rarr;
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredQuotations.map((q) => {
                    const calc = calculateFinance(q.assets || [], q.financeDetails);
                    const netCost = q.assetCost || calc.assetSubtotal;
                    const vat = q.vatAmount !== undefined ? q.vatAmount : calc.vatAmount;
                    const loan = q.loanAmount || calc.financeAmount;

                    return (
                      <tr
                        key={q.id}
                        onClick={() => navigate(`/quotations/${q.id}`)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-3">
                          <div className="font-bold text-brand-600">{q.reference}</div>
                          <div className="text-[11px] text-slate-600 truncate max-w-[180px]">
                            {q.title || q.customerName}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                              q.assetCategoryType === 'soft'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {q.assetCategoryType === 'soft' ? 'Soft Asset' : 'Hard Asset'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700 capitalize">
                          {q.financeDetails?.financeType ? q.financeDetails.financeType.replace(/_/g, ' ') : 'HP'}
                        </td>
                        <td className="py-3 px-3 text-slate-800 font-medium">
                          {formatCurrency(netCost)}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {formatCurrency(vat)}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {formatCurrency(q.financeDetails?.deposit || calc.depositAmount)}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {formatCurrency(loan)}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-700 font-medium">
                          {q.financeDetails?.termMonths || 48}m
                        </td>
                        <td className="py-3 px-3 font-bold text-brand-700">
                          {formatCurrency(calc.estimatedRepayment)}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={q.status} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => navigate(`/quotations/${q.id}`)}
                              title="View Quotation Details"
                              className="rounded p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => openEditQuotation(q, e)}
                              title="Edit / Update Quotation"
                              className="rounded p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            {q.status !== 'converted' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/proposals/new?quotationId=${q.id}`);
                                }}
                                title="Convert to Proposal"
                                className="rounded p-1 text-emerald-600 hover:bg-emerald-50"
                              >
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateQuotation(q.id);
                              }}
                              title="Duplicate Quote"
                              className="rounded p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete quotation ${q.reference}?`)) {
                                  deleteQuotation(q.id);
                                }
                              }}
                              title="Delete Quotation"
                              className="rounded p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PROPOSALS LIST */}
      {activeTab === 'proposals' && (
        <div className="rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Reference</th>
                  <th className="py-2.5 px-3 font-semibold">Related Quotation</th>
                  <th className="py-2.5 px-3 font-semibold">Borrower / Customer</th>
                  <th className="py-2.5 px-3 font-semibold">Supplying Dealer</th>
                  <th className="py-2.5 px-3 font-semibold">Broker Intermediary</th>
                  <th className="py-2.5 px-3 font-semibold">Funder / Lender</th>
                  <th className="py-2.5 px-3 font-semibold">Finance Requested</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Last Updated</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProposals.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-slate-400">
                      <FileText className="mx-auto h-7 w-7 text-slate-300 mb-2" />
                      <p className="font-medium text-slate-600 text-xs">No proposals found in Workspace.</p>
                      <button
                        onClick={() => navigate('/proposals')}
                        className="mt-2 text-xs font-semibold text-brand-600 hover:underline"
                      >
                        Create your first proposal &rarr;
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredProposals.map((p) => {
                    const calc = calculateFinance(p.assets, p.financeDetails);
                    const canSubmit = p.status === 'ready_to_submit' || p.status === 'draft';

                    return (
                      <tr
                        key={p.id}
                        onClick={() => navigate(`/proposals/${p.id}`)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-3 font-bold text-brand-600">{p.reference}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                          {p.quotationReference ? (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/quotations/${p.quotationId}`);
                              }}
                              className="text-brand-600 hover:underline font-semibold"
                            >
                              {p.quotationReference}
                            </span>
                          ) : (
                            'Direct Proposal'
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{p.customerName}</div>
                          <div className="text-[11px] text-slate-400">{p.contactPerson}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-700">{p.dealerName}</td>
                        <td className="py-3 px-3 text-slate-700">{p.brokerName}</td>
                        <td className="py-3 px-3 font-semibold text-slate-900">{p.lenderName}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {formatCurrency(calc.financeAmount)}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={p.status} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-slate-500">{formatDate(p.updatedAt)}</td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => navigate(`/proposals/${p.id}`)}
                              title="View Proposal Details"
                              className="rounded p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => openEditProposal(p, e)}
                              title="Edit Proposal Details"
                              className="rounded p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            {canSubmit && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  submitProposal(p.id);
                                }}
                                title="Submit to Lender"
                                className="rounded p-1 text-emerald-600 hover:bg-emerald-50"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete proposal ${p.reference}?`)) {
                                  deleteProposal(p.id);
                                }
                              }}
                              title="Delete Proposal"
                              className="rounded p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT / UPDATE QUOTATION */}
      {editingQuotation && (
        <Modal
          isOpen={Boolean(editingQuotation)}
          onClose={() => setEditingQuotation(null)}
          title={`Update Quotation: ${editingQuotation.reference}`}
          description="Adjust loan parameters and financial terms directly in your workspace"
          maxWidth="lg"
          footer={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingQuotation(null)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuotationEdit}
                className="rounded-md bg-brand-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-700"
              >
                Save Updates
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Quotation Title / Name</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-1.5 text-slate-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Asset Classification</label>
                <select
                  value={editAssetType}
                  onChange={(e) => setEditAssetType(e.target.value as any)}
                  className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-slate-900 bg-white"
                >
                  <option value="hard">Hard Asset (Machinery, Vehicles)</option>
                  <option value="soft">Soft Asset (IT, Software, Fit-out)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Finance Product</label>
                <select
                  value={editFinanceType}
                  onChange={(e) => setEditFinanceType(e.target.value as any)}
                  className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-slate-900 bg-white"
                >
                  <option value="hire_purchase">Hire Purchase</option>
                  <option value="finance_lease">Finance Lease</option>
                  <option value="operating_lease">Operating Lease</option>
                  <option value="other">Commercial Loan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Net Asset Cost (£)</label>
                <input
                  type="number"
                  min="0"
                  value={editAssetCost}
                  onChange={(e) => setEditAssetCost(parseFloat(e.target.value) || 0)}
                  className="w-full rounded border border-slate-300 px-3 py-1.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Deposit (£)</label>
                <input
                  type="number"
                  min="0"
                  value={editDeposit}
                  onChange={(e) => setEditDeposit(parseFloat(e.target.value) || 0)}
                  className="w-full rounded border border-slate-300 px-3 py-1.5 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Term (Months)</label>
                <select
                  value={editTermMonths}
                  onChange={(e) => setEditTermMonths(parseInt(e.target.value) || 48)}
                  className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-slate-900 bg-white"
                >
                  <option value={12}>12 Months</option>
                  <option value={24}>24 Months</option>
                  <option value={36}>36 Months</option>
                  <option value={48}>48 Months</option>
                  <option value={60}>60 Months</option>
                  <option value={72}>72 Months</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  step="0.05"
                  value={editInterestRate}
                  onChange={(e) => setEditInterestRate(parseFloat(e.target.value) || 0)}
                  className="w-full rounded border border-slate-300 px-3 py-1.5 text-slate-900"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: EDIT / UPDATE PROPOSAL */}
      {editingProposal && (
        <Modal
          isOpen={Boolean(editingProposal)}
          onClose={() => setEditingProposal(null)}
          title={`Update Proposal: ${editingProposal.reference}`}
          description="Update borrower details, lender routing, and underwriting status"
          maxWidth="lg"
          footer={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingProposal(null)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProposalEdit}
                className="rounded-md bg-brand-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-700"
              >
                Save Updates
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Borrower / Company Name</label>
              <input
                type="text"
                value={editCustomerName}
                onChange={(e) => setEditCustomerName(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-1.5 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={editContactPerson}
                  onChange={(e) => setEditContactPerson(e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-1.5 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-1.5 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Assigned Lender</label>
                <select
                  value={editLenderId}
                  onChange={(e) => setEditLenderId(e.target.value)}
                  className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-slate-900 bg-white"
                >
                  {lenders.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Proposal Status</label>
                <select
                  value={editProposalStatus}
                  onChange={(e) => setEditProposalStatus(e.target.value)}
                  className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-slate-900 bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="ready_to_submit">Ready to Submit</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
