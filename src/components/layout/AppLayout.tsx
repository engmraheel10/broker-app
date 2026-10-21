import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { ToastContainer } from '../common/ToastContainer';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  Users,
  Truck,
  Briefcase,
  Store,
  Building2,
  UserCheck,
  BarChart3,
  History,
  Settings,
  Search,
  Bell,
  Plus,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  Shield,
  LogOut,
  ChevronRight,
  Landmark,
  Layers
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { currentUser, switchRole, quotations, proposals, users } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { 
      label: 'Quotations', 
      path: '/quotations', 
      icon: FileSpreadsheet, 
      badge: quotations.filter(q => q.status === 'draft' || q.status === 'saved').length 
    },
    { 
      label: 'Proposals', 
      path: '/proposals', 
      icon: FileText, 
      badge: proposals.filter(p => p.status === 'submitted' || p.status === 'under_review').length,
      badgeColor: 'bg-amber-500' 
    },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Assets', path: '/assets', icon: Truck },
    { label: 'Brokers', path: '/brokers', icon: Briefcase },
    { label: 'Dealers', path: '/dealers', icon: Store },
    { label: 'Lenders', path: '/lenders', icon: Landmark },
    { label: 'Users & Access', path: '/users', icon: UserCheck },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Audit History', path: '/audit', icon: History },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  // Breadcrumbs builder
  const generateBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'Home', path: '/dashboard' }];
    
    let curPath = '';
    for (const part of parts) {
      curPath += `/${part}`;
      const matchingNav = navItems.find(n => n.path === curPath);
      let label = matchingNav ? matchingNav.label : part;
      
      if (part === 'new') label = 'Create';
      if (part === 'edit') label = 'Edit';
      if (part.startsWith('qt-') || part.startsWith('pr-') || part.startsWith('cst-') || part.startsWith('brk-') || part.startsWith('dlr-')) {
        label = part.toUpperCase();
      }
      crumbs.push({ label, path: curPath });
    }
    return crumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const mockNotifications = [
    {
      id: 'notif-1',
      title: 'Investec Facility Approved',
      detail: 'Proposal PR-2026-440192 approved for Apex Logistics (£247,000)',
      time: '15m ago',
      unread: true,
      path: '/proposals/pr-1',
    },
    {
      id: 'notif-2',
      title: 'New Quotation Created',
      detail: 'Patrick Kavanagh requested quote for 2x Toyota Forklifts',
      time: '2h ago',
      unread: true,
      path: '/quotations/qt-5',
    },
    {
      id: 'notif-3',
      title: 'Lender Gateway Sync Completed',
      detail: 'Lombard & Investec rates and API parameters updated',
      time: '5h ago',
      unread: false,
      path: '/lenders',
    },
  ];

  // Quick search results
  const filteredQuotations = quotations.filter(q => 
    searchQuery && (
      q.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.assets.some(a => a.model.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  const filteredProposals = proposals.filter(p => 
    searchQuery && (
      p.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lenderName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Persistent Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-navy-900 text-slate-300 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-navy-800 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm font-bold text-lg">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-white">CAPITAS</span>
                <span className="rounded bg-brand-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-brand-300 border border-brand-500/30">
                  FINANCE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Broker & Asset Platform</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1.5 text-slate-400 hover:bg-navy-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role Context Chip */}
        <div className="mx-3 my-3 rounded-lg border border-navy-800 bg-navy-950/60 p-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-brand-400" />
              Role View:
            </span>
            <span className="font-semibold text-brand-300">{currentUser.role}</span>
          </div>
          <p className="mt-1 truncate text-xs text-white font-medium">
            {currentUser.organization}
          </p>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${
                      item.badgeColor || 'bg-brand-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom System Info */}
        <div className="border-t border-navy-800 p-3 text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Lender API Live
            </span>
            <span className="text-[10px] text-slate-400">v2.4.0 (Static Demo)</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.path}>
                  {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-400" />}
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="font-semibold text-slate-900">{crumb.label}</span>
                  ) : (
                    <NavLink
                      to={crumb.path}
                      className="hover:text-brand-600 transition-colors"
                    >
                      {crumb.label}
                    </NavLink>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Global Search Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-300 hover:bg-slate-100 transition-colors"
            >
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden md:inline">Search quotations, proposals, customers...</span>
              <span className="md:hidden">Search</span>
              <kbd className="hidden md:inline rounded bg-white px-1.5 py-0.5 text-[10px] font-mono border border-slate-200 text-slate-500">
                ⌘K
              </kbd>
            </button>

            {/* Quick Action Button */}
            <div className="relative">
              <button
                onClick={() => setQuickCreateOpen(!quickCreateOpen)}
                className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-brand-700 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Transaction</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {quickCreateOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95"
                  onClick={() => setQuickCreateOpen(false)}
                >
                  <NavLink
                    to="/quotations/new"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-brand-600" />
                    Create Quotation
                  </NavLink>
                  <NavLink
                    to="/proposals/new"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                  >
                    <FileText className="h-4 w-4 text-emerald-600" />
                    Create Proposal Wizard
                  </NavLink>
                  <div className="my-1 border-t border-slate-100" />
                  <NavLink
                    to="/customers"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                  >
                    <Users className="h-4 w-4 text-blue-600" />
                    Add Customer
                  </NavLink>
                </div>
              )}
            </div>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-600" />
              </button>

              {notificationsOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden"
                  onClick={() => setNotificationsOpen(false)}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50">
                    <span className="text-xs font-semibold text-slate-900">Notifications</span>
                    <span className="text-[11px] text-brand-600 font-medium">Mark all read</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {mockNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => navigate(notif.path)}
                        className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                          notif.unread ? 'bg-brand-50/40' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{notif.title}</span>
                          <span className="text-[10px] text-slate-400">{notif.time}</span>
                        </div>
                        <p className="mt-0.5 text-slate-600 text-[11px] leading-relaxed">
                          {notif.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 p-2 text-center bg-slate-50">
                    <NavLink
                      to="/audit"
                      className="text-[11px] font-medium text-brand-600 hover:underline"
                    >
                      View Full Audit History
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg p-1 text-left hover:bg-slate-100 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-xs font-semibold text-white">
                  {currentUser.avatarInitials}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-semibold text-slate-900 leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 leading-tight">{currentUser.role}</p>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white py-2 shadow-2xl z-50 animate-in fade-in"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                    <span className="mt-1 inline-block rounded bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 border border-brand-100">
                      {currentUser.role} • {currentUser.organization}
                    </span>
                  </div>

                  {/* Multi-tenant Role Switcher Demonstration */}
                  <div className="px-4 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Role Simulation
                    </p>
                    <div className="mt-1.5 space-y-1">
                      {(['Tenant Admin', 'Broker Admin', 'Broker User', 'Dealer Admin', 'Dealer User'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          onClick={(e) => {
                            e.stopPropagation();
                            switchRole(r);
                            setUserMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${
                            currentUser.role === r
                              ? 'bg-brand-50 font-semibold text-brand-700'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>{r}</span>
                          {currentUser.role === r && (
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 my-1" />

                  <div className="px-2">
                    <NavLink
                      to="/settings"
                      className="flex items-center gap-2 rounded px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <Settings className="h-3.5 w-3.5 text-slate-400" />
                      Platform Settings
                    </NavLink>
                    <NavLink
                      to="/audit"
                      className="flex items-center gap-2 rounded px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <History className="h-3.5 w-3.5 text-slate-400" />
                      System Audit Log
                    </NavLink>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Main Content with Scroll */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Global Quick Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSearchModalOpen(false)}
          />
          <div className="relative w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center border-b border-slate-200 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400 mr-2.5" />
              <input
                type="text"
                autoFocus
                placeholder="Search reference numbers, customers, assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm outline-none placeholder:text-slate-400 text-slate-900"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-4">
              {!searchQuery && (
                <div className="text-center py-6 text-xs text-slate-400">
                  Type at least 2 characters to search across quotations, proposals, and assets.
                </div>
              )}

              {searchQuery && (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Quotations ({filteredQuotations.length})
                    </h5>
                    {filteredQuotations.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No matching quotations</p>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {filteredQuotations.map((q) => (
                          <div
                            key={q.id}
                            onClick={() => {
                              navigate(`/quotations/${q.id}`);
                              setSearchModalOpen(false);
                            }}
                            className="p-2 text-xs rounded hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                          >
                            <div>
                              <span className="font-semibold text-brand-600">{q.reference}</span>
                              <span className="ml-2 text-slate-700">{q.customerName}</span>
                            </div>
                            <span className="text-slate-400">{q.dealerName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Proposals ({filteredProposals.length})
                    </h5>
                    {filteredProposals.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No matching proposals</p>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {filteredProposals.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              navigate(`/proposals/${p.id}`);
                              setSearchModalOpen(false);
                            }}
                            className="p-2 text-xs rounded hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                          >
                            <div>
                              <span className="font-semibold text-emerald-600">{p.reference}</span>
                              <span className="ml-2 text-slate-700">{p.customerName}</span>
                            </div>
                            <span className="text-slate-400">{p.lenderName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Toasts */}
      <ToastContainer />
    </div>
  );
};
