import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Quotation, Proposal, Customer, AssetRecord, Broker, Dealer, 
  Lender, UserProfile, AuditRecord, UserRole, ProposalStatus,
  InventoryItem 
} from '../types';
import { 
  INITIAL_QUOTATIONS, INITIAL_PROPOSALS, INITIAL_CUSTOMERS, 
  INITIAL_ASSETS, INITIAL_BROKERS, INITIAL_DEALERS, INITIAL_LENDERS, 
  INITIAL_USERS, INITIAL_AUDIT_LOGS, INITIAL_INVENTORY 
} from '../data/mockData';
import { generateRef } from '../utils/calculations';

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  currentUser: UserProfile;
  switchRole: (role: UserRole) => void;
  quotations: Quotation[];
  saveQuotation: (q: Partial<Quotation> & { id?: string }) => Quotation;
  duplicateQuotation: (id: string) => Quotation;
  deleteQuotation: (id: string) => void;
  getQuotation: (id: string) => Quotation | undefined;
  
  proposals: Proposal[];
  saveProposal: (p: Partial<Proposal> & { id?: string }) => Proposal;
  submitProposal: (id: string) => Proposal;
  deleteProposal: (id: string) => void;
  getProposal: (id: string) => Proposal | undefined;
  
  customers: Customer[];
  addCustomer: (c: Partial<Customer>) => Customer;
  getCustomer: (id: string) => Customer | undefined;
  
  brokers: Broker[];
  addBroker: (b: Partial<Broker>) => Broker;
  getBroker: (id: string) => Broker | undefined;
  
  dealers: Dealer[];
  addDealer: (d: Partial<Dealer>) => Dealer;
  getDealer: (id: string) => Dealer | undefined;
  
  inventory: InventoryItem[];
  addInventoryItem: (item: Partial<InventoryItem>) => InventoryItem;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => InventoryItem;
  deleteInventoryItem: (id: string) => void;
  getInventoryItem: (id: string) => InventoryItem | undefined;

  assets: AssetRecord[];
  users: UserProfile[];
  addUser: (u: Partial<UserProfile>) => UserProfile;
  lenders: Lender[];
  auditLogs: AuditRecord[];
  
  toasts: Toast[];
  addToast: (title: string, message?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  QUOTATIONS: 'capitas_quotations_v1',
  PROPOSALS: 'capitas_proposals_v1',
  CUSTOMERS: 'capitas_customers_v1',
  BROKERS: 'capitas_brokers_v1',
  DEALERS: 'capitas_dealers_v1',
  INVENTORY: 'capitas_inventory_v1',
  USERS: 'capitas_users_v1',
  AUDIT: 'capitas_audit_v1',
  CURRENT_USER_ROLE: 'capitas_user_role_v1',
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
  }
  return fallback;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS));
  const [currentRole, setCurrentRole] = useState<UserRole>(() => 
    loadStorage<UserRole>(STORAGE_KEYS.CURRENT_USER_ROLE, 'Tenant Admin')
  );
  
  const currentUser = users.find(u => u.role === currentRole) || users[0];

  const [quotations, setQuotations] = useState<Quotation[]>(() => loadStorage(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS));
  const [proposals, setProposals] = useState<Proposal[]>(() => loadStorage(STORAGE_KEYS.PROPOSALS, INITIAL_PROPOSALS));
  const [customers, setCustomers] = useState<Customer[]>(() => loadStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS));
  const [brokers, setBrokers] = useState<Broker[]>(() => loadStorage(STORAGE_KEYS.BROKERS, INITIAL_BROKERS));
  const [dealers, setDealers] = useState<Dealer[]>(() => loadStorage(STORAGE_KEYS.DEALERS, INITIAL_DEALERS));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => loadStorage(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY));
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(() => loadStorage(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS));
  const [lenders] = useState<Lender[]>(INITIAL_LENDERS);
  const [assets] = useState<AssetRecord[]>(INITIAL_ASSETS);
  
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BROKERS, JSON.stringify(brokers));
  }, [brokers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEALERS, JSON.stringify(dealers));
  }, [dealers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ROLE, JSON.stringify(currentRole));
  }, [currentRole]);

  const addToast = (title: string, message?: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, title, message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const recordAudit = (action: string, entityType: string, entityReference: string, details: string) => {
    const newLog: AuditRecord = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      role: currentUser.role,
      action,
      entityType,
      entityReference,
      ipAddress: '192.168.1.104',
      details,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    addToast('Role Switched', `Active view updated to ${role} (${currentUser.organization})`, 'info');
  };

  // Quotation Operations
  const saveQuotation = (qData: Partial<Quotation> & { id?: string }): Quotation => {
    const now = new Date().toISOString();
    let updated: Quotation;

    if (qData.id && quotations.some(q => q.id === qData.id)) {
      // Update existing
      updated = {
        ...(quotations.find(q => q.id === qData.id)!),
        ...qData,
        updatedAt: now,
      } as Quotation;
      setQuotations(prev => prev.map(q => q.id === updated.id ? updated : q));
      recordAudit('UPDATE_QUOTATION', 'Quotation', updated.reference, `Updated quotation for ${updated.customerName}`);
      addToast('Quotation Saved', `Quotation ${updated.reference} was updated successfully.`);
    } else {
      // Create new
      const newRef = generateRef('QT');
      const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      updated = {
        id: `qt-${Date.now()}`,
        reference: newRef,
        title: qData.title || `Finance Quote - ${qData.financeDetails?.financeType ? qData.financeDetails.financeType.replace(/_/g, ' ') : 'Asset Facility'}`,
        assetCategoryType: qData.assetCategoryType || 'hard',
        assetQuantity: qData.assetQuantity || 1,
        assetCost: qData.assetCost || 0,
        vatAmount: qData.vatAmount || 0,
        vatRate: qData.vatRate || 20,
        vatTreatment: qData.vatTreatment || 'financed',
        loanAmount: qData.loanAmount || 0,
        customerType: qData.customerType || 'business',
        customerName: qData.customerName || (qData.title ? qData.title : 'Direct Finance Quote'),
        contactPerson: qData.contactPerson || '',
        email: qData.email || '',
        phone: qData.phone || '',
        address: qData.address || '',
        companyNumber: qData.companyNumber,
        dealerId: qData.dealerId || 'dlr-1',
        dealerName: qData.dealerName || 'Direct Facility',
        salesRep: currentUser.name,
        assets: qData.assets || [],
        financeDetails: qData.financeDetails || {
          financeType: 'hire_purchase',
          deposit: 10000,
          depositType: 'amount',
          termMonths: 48,
          interestRate: 6.5,
          paymentFrequency: 'monthly',
          balloonPayment: 0,
          documentationFee: 295,
          optionToPurchaseFee: 150,
        },
        status: qData.status || 'saved',
        notes: qData.notes || '',
        createdAt: now,
        updatedAt: now,
        validUntil,
      };
      setQuotations(prev => [updated, ...prev]);
      recordAudit('CREATE_QUOTATION', 'Quotation', updated.reference, `Created financial quote ${updated.reference}`);
      addToast('Quotation Saved', `Quotation ${updated.reference} has been saved to your Workspace.`);
    }
    return updated;
  };

  const duplicateQuotation = (id: string): Quotation => {
    const existing = quotations.find(q => q.id === id);
    if (!existing) throw new Error('Quotation not found');
    const now = new Date().toISOString();
    const newRef = generateRef('QT');
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const copy: Quotation = {
      ...existing,
      id: `qt-${Date.now()}`,
      reference: newRef,
      status: 'draft',
      notes: `Duplicated from ${existing.reference}`,
      convertedProposalId: undefined,
      createdAt: now,
      updatedAt: now,
      validUntil,
    };
    setQuotations(prev => [copy, ...prev]);
    recordAudit('DUPLICATE_QUOTATION', 'Quotation', newRef, `Duplicated from ${existing.reference}`);
    addToast('Quotation Duplicated', `Created duplicate quotation ${newRef}`);
    return copy;
  };

  const deleteQuotation = (id: string) => {
    const item = quotations.find(q => q.id === id);
    if (item) {
      setQuotations(prev => prev.filter(q => q.id !== id));
      recordAudit('DELETE_QUOTATION', 'Quotation', item.reference, `Deleted quotation ${item.reference}`);
      addToast('Quotation Removed', `Quotation ${item.reference} has been removed.`, 'info');
    }
  };

  const getQuotation = (id: string) => quotations.find(q => q.id === id || q.reference === id);

  // Proposal Operations
  const saveProposal = (pData: Partial<Proposal> & { id?: string }): Proposal => {
    const now = new Date().toISOString();
    let updated: Proposal;

    if (pData.id && proposals.some(p => p.id === pData.id)) {
      const existing = proposals.find(p => p.id === pData.id)!;
      updated = {
        ...existing,
        ...pData,
        updatedAt: now,
      };
      setProposals(prev => prev.map(p => p.id === updated.id ? updated : p));
      recordAudit('UPDATE_PROPOSAL', 'Proposal', updated.reference, `Updated proposal details for ${updated.customerName}`);
      addToast('Proposal Saved', `Proposal ${updated.reference} was updated.`);
    } else {
      const newRef = generateRef('PR');
      const defaultLender = lenders[0];
      const defaultBroker = brokers[0];

      updated = {
        id: `pr-${Date.now()}`,
        reference: newRef,
        quotationId: pData.quotationId,
        quotationReference: pData.quotationReference,
        customerType: pData.customerType || 'business',
        customerName: pData.customerName || 'Customer Ltd',
        contactPerson: pData.contactPerson || '',
        email: pData.email || '',
        phone: pData.phone || '',
        address: pData.address || '',
        companyNumber: pData.companyNumber,
        dealerId: pData.dealerId || 'dlr-1',
        dealerName: pData.dealerName || 'Atlas Plant & Machinery Ltd',
        brokerId: pData.brokerId || defaultBroker.id,
        brokerName: pData.brokerName || defaultBroker.name,
        brokerOrg: pData.brokerOrg || defaultBroker.organization,
        assets: pData.assets || [],
        financeDetails: pData.financeDetails || {
          financeType: 'hire_purchase',
          deposit: 15000,
          depositType: 'amount',
          termMonths: 48,
          interestRate: 6.5,
          paymentFrequency: 'monthly',
          balloonPayment: 0,
          documentationFee: 295,
          optionToPurchaseFee: 150,
        },
        documents: pData.documents || [],
        lenderId: pData.lenderId || defaultLender.id,
        lenderName: pData.lenderName || defaultLender.name,
        status: pData.status || 'draft',
        createdAt: now,
        updatedAt: now,
        activityHistory: [
          {
            id: `act-${Date.now()}`,
            timestamp: now,
            user: currentUser.name,
            role: currentUser.role,
            action: pData.quotationReference 
              ? `Created Proposal from Quotation ${pData.quotationReference}`
              : `Created Direct Proposal Draft`,
            badgeType: 'info',
          }
        ],
      };

      // If created from quotation, mark quotation as converted
      if (pData.quotationId) {
        setQuotations(prev => prev.map(q => 
          q.id === pData.quotationId 
            ? { ...q, status: 'converted', convertedProposalId: updated.id } 
            : q
        ));
      }

      setProposals(prev => [updated, ...prev]);
      recordAudit('CREATE_PROPOSAL', 'Proposal', updated.reference, `Proposal created for ${updated.customerName}`);
      addToast('Proposal Created', `Proposal ${updated.reference} created successfully.`);
    }
    return updated;
  };

  const submitProposal = (id: string): Proposal => {
    const existing = proposals.find(p => p.id === id);
    if (!existing) throw new Error('Proposal not found');
    const now = new Date().toISOString();

    const submitted: Proposal = {
      ...existing,
      status: 'submitted',
      submittedAt: now,
      updatedAt: now,
      activityHistory: [
        {
          id: `act-${Date.now()}`,
          timestamp: now,
          user: currentUser.name,
          role: currentUser.role,
          action: `Submitted to ${existing.lenderName} API Gateway (Demo Submission)`,
          details: 'Application payload dispatched with automated preliminary scoring check passed.',
          badgeType: 'success',
        },
        ...existing.activityHistory,
      ],
    };

    setProposals(prev => prev.map(p => p.id === id ? submitted : p));
    recordAudit('SUBMIT_PROPOSAL', 'Proposal', submitted.reference, `Dispatched application payload to ${submitted.lenderName}`);
    addToast('Proposal Submitted!', `Proposal ${submitted.reference} successfully submitted to ${submitted.lenderName}.`, 'success');
    return submitted;
  };

  const deleteProposal = (id: string) => {
    const item = proposals.find(p => p.id === id);
    if (item) {
      setProposals(prev => prev.filter(p => p.id !== id));
      recordAudit('DELETE_PROPOSAL', 'Proposal', item.reference, `Deleted proposal ${item.reference}`);
      addToast('Proposal Removed', `Proposal ${item.reference} has been removed.`, 'info');
    }
  };

  const getProposal = (id: string) => proposals.find(p => p.id === id || p.reference === id);

  // Customer Operations
  const addCustomer = (cData: Partial<Customer>): Customer => {
    const now = new Date().toISOString();
    const newCust: Customer = {
      id: `cst-${Date.now()}`,
      name: cData.name || 'New Customer',
      type: cData.type || 'business',
      contactPerson: cData.contactPerson || '',
      email: cData.email || '',
      phone: cData.phone || '',
      address: cData.address || '',
      companyNumber: cData.companyNumber,
      activeQuotationsCount: 0,
      activeProposalsCount: 0,
      totalFinanceRequested: 0,
      creditRating: 'A (Pending Initial Score)',
      status: 'active',
      createdAt: now,
    };
    setCustomers(prev => [newCust, ...prev]);
    recordAudit('CREATE_CUSTOMER', 'Customer', newCust.name, `Added new customer profile: ${newCust.name}`);
    addToast('Customer Created', `${newCust.name} has been added to customer records.`);
    return newCust;
  };

  const getCustomer = (id: string) => customers.find(c => c.id === id);

  // Broker Operations
  const addBroker = (bData: Partial<Broker>): Broker => {
    const newBroker: Broker = {
      id: `brk-${Date.now()}`,
      name: bData.name || 'New Broker',
      organization: bData.organization || 'Independent Brokerage',
      email: bData.email || '',
      phone: bData.phone || '',
      fcaNumber: bData.fcaNumber || 'FCA-PENDING',
      status: 'active',
      proposalsCount: 0,
      approvalRate: 100,
      commissionTier: bData.commissionTier || 'Tier 2 (1.50%)',
      region: bData.region || 'UK Nationwide',
    };
    setBrokers(prev => [newBroker, ...prev]);
    recordAudit('CREATE_BROKER', 'Broker', newBroker.name, `Registered broker partner ${newBroker.name}`);
    addToast('Broker Partner Added', `${newBroker.name} has been registered.`);
    return newBroker;
  };

  const getBroker = (id: string) => brokers.find(b => b.id === id);

  // Dealer Operations
  const addDealer = (dData: Partial<Dealer>): Dealer => {
    const newDealer: Dealer = {
      id: `dlr-${Date.now()}`,
      name: dData.name || 'New Equipment Dealer',
      code: `DLR-${Math.floor(100 + Math.random() * 900)}`,
      contactName: dData.contactName || '',
      email: dData.email || '',
      phone: dData.phone || '',
      address: dData.address || '',
      activeQuotationsCount: 0,
      activeProposalsCount: 0,
      totalVolumeYTD: 0,
      tier: dData.tier || 'Standard',
      status: 'active',
    };
    setDealers(prev => [newDealer, ...prev]);
    recordAudit('CREATE_DEALER', 'Dealer', newDealer.name, `Enrolled equipment dealer network member: ${newDealer.name}`);
    addToast('Dealer Enrolled', `${newDealer.name} added to dealer network.`);
    return newDealer;
  };

  const getDealer = (id: string) => dealers.find(d => d.id === id);

  // User Operations
  const addUser = (uData: Partial<UserProfile>): UserProfile => {
    const initials = (uData.name || 'U U')
      .split(' ')
      .map(p => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: uData.name || 'New User',
      email: uData.email || '',
      role: uData.role || 'Dealer User',
      organization: uData.organization || 'Capitas Partner Network',
      avatarInitials: initials,
      status: 'active',
    };
    setUsers(prev => [newUser, ...prev]);
    recordAudit('CREATE_USER', 'User', newUser.name, `Created system user account for ${newUser.name} (${newUser.role})`);
    addToast('User Added', `Account for ${newUser.name} created.`);
    return newUser;
  };

  // Inventory Operations
  const addInventoryItem = (itemData: Partial<InventoryItem>): InventoryItem => {
    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      dealerId: itemData.dealerId || (currentUser.organization.includes('Atlas') ? 'dlr-1' : 'dlr-1'),
      dealerName: itemData.dealerName || currentUser.organization || 'Atlas Plant & Machinery Ltd',
      title: itemData.title || 'New Equipment Asset',
      imageUrl: itemData.imageUrl || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80',
      categoryType: itemData.categoryType || 'hard',
      categoryName: itemData.categoryName || 'Commercial Equipment',
      manufacturer: itemData.manufacturer || 'Commercial Supplier',
      model: itemData.model || '',
      year: itemData.year || new Date().getFullYear(),
      vinOrSerial: itemData.vinOrSerial || `VIN-${Math.floor(100000 + Math.random() * 900000)}`,
      price: Number(itemData.price) || 50000,
      quantity: Number(itemData.quantity) || 1,
      status: itemData.status || 'in_stock',
      description: itemData.description || '',
      specifications: itemData.specifications || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInventory(prev => [newItem, ...prev]);
    recordAudit('CREATE_INVENTORY', 'Inventory', newItem.title, `Enrolled asset in dealer inventory: ${newItem.title} (£${newItem.price.toLocaleString()})`);
    addToast('Asset Added to Inventory', `${newItem.title} added to available stock.`);
    return newItem;
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>): InventoryItem => {
    let updatedItem: InventoryItem | undefined;
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        updatedItem = {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        return updatedItem;
      }
      return item;
    }));
    if (updatedItem) {
      recordAudit('UPDATE_INVENTORY', 'Inventory', updatedItem.title, `Updated asset stock record for ${updatedItem.title}`);
      addToast('Inventory Updated', `${updatedItem.title} details updated successfully.`);
      return updatedItem;
    }
    throw new Error(`Inventory item ${id} not found`);
  };

  const deleteInventoryItem = (id: string) => {
    const item = inventory.find(i => i.id === id);
    setInventory(prev => prev.filter(i => i.id !== id));
    if (item) {
      recordAudit('DELETE_INVENTORY', 'Inventory', item.title, `Removed asset ${item.title} from inventory`);
      addToast('Asset Removed', `${item.title} removed from dealer inventory.`, 'info');
    }
  };

  const getInventoryItem = (id: string) => inventory.find(i => i.id === id);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchRole,
        quotations,
        saveQuotation,
        duplicateQuotation,
        deleteQuotation,
        getQuotation,
        proposals,
        saveProposal,
        submitProposal,
        deleteProposal,
        getProposal,
        customers,
        addCustomer,
        getCustomer,
        brokers,
        addBroker,
        getBroker,
        dealers,
        addDealer,
        getDealer,
        inventory,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        getInventoryItem,
        assets,
        users,
        addUser,
        lenders,
        auditLogs,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
