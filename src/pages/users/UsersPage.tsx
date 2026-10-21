import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile, UserRole } from '../../types';
import { Modal } from '../../components/common/Modal';
import {
  UserCheck,
  Plus,
  Search,
  Shield,
  Building,
  Mail,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { users, addUser, currentUser, switchRole, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // New User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Dealer User');
  const [organization, setOrganization] = useState('Atlas Plant & Machinery Ltd');

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addUser({
      name,
      email,
      role,
      organization,
    });

    setModalOpen(false);
    setName('');
    setEmail('');
  };

  const roleBadgeColor = (r: UserRole) => {
    switch (r) {
      case 'Tenant Admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Broker Admin':
        return 'bg-brand-50 text-brand-700 border-brand-200';
      case 'Broker User':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Dealer Admin':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">User & Access Management</h1>
          <p className="text-xs text-slate-500">
            Multi-tenant role permissions across Tenant Administrators, Broker Partners, and Dealership Teams
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add User Account
        </button>
      </div>

      {/* Role Switcher Callout Banner */}
      <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-brand-600" />
            <div>
              <p className="text-xs font-bold text-brand-900">Active Impersonation / View Simulator</p>
              <p className="text-[11px] text-brand-700">
                You are currently viewing the platform as: <strong>{currentUser.name}</strong> ({currentUser.role} at {currentUser.organization})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600 font-medium hidden sm:inline">Switch Role:</span>
            <select
              value={currentUser.role}
              onChange={(e) => switchRole(e.target.value as UserRole)}
              className="rounded-lg border border-brand-300 bg-white px-2.5 py-1 text-xs font-semibold text-brand-900 focus:outline-none"
            >
              <option value="Tenant Admin">Tenant Admin</option>
              <option value="Broker Admin">Broker Admin</option>
              <option value="Broker User">Broker User</option>
              <option value="Dealer Admin">Dealer Admin</option>
              <option value="Dealer User">Dealer User</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user by name, email, role, or org..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-brand-500"
            />
          </div>
          <span className="text-xs text-slate-500">{filteredUsers.length} Registered Accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">User Profile</th>
                <th className="py-3 px-4 font-semibold">Email Address</th>
                <th className="py-3 px-4 font-semibold">Assigned Role</th>
                <th className="py-3 px-4 font-semibold">Organization / Tenant</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Switch As</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const isCurrent = u.role === currentUser.role;

                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-xs font-bold text-white">
                          {u.avatarInitials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          {isCurrent && (
                            <span className="text-[10px] text-brand-600 font-semibold">(Current Session)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${roleBadgeColor(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{u.organization}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => switchRole(u.role)}
                        disabled={isCurrent}
                        className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isCurrent ? 'Active' : 'Simulate View'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add System User"
        description="Provision platform access and assign multi-tenant organizational permissions"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rachel Adams"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rachel@capitasfinance.co.uk"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none"
              >
                <option value="Tenant Admin">Tenant Admin</option>
                <option value="Broker Admin">Broker Admin</option>
                <option value="Broker User">Broker User</option>
                <option value="Dealer Admin">Dealer Admin</option>
                <option value="Dealer User">Dealer User</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700">Organization Name</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Capitas Commercial Finance Ltd"
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
              Create User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
