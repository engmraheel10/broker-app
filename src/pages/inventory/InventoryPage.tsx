import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/calculations';
import { InventoryItem, AssetCategoryType } from '../../types';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calculator,
  ExternalLink,
  Tag,
  CheckCircle2,
  AlertCircle,
  Truck,
  Cpu,
  Layers,
  Image as ImageIcon,
  X,
  Upload,
  Check,
  Building2
} from 'lucide-react';

const PRESET_IMAGES = [
  {
    name: 'CAT Excavator',
    url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80',
    categoryType: 'hard' as AssetCategoryType,
    categoryName: 'Construction & Earthmoving',
    manufacturer: 'Caterpillar',
    model: '320 Next Gen',
  },
  {
    name: 'Hitachi Excavator',
    url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80',
    categoryType: 'hard' as AssetCategoryType,
    categoryName: 'Construction & Earthmoving',
    manufacturer: 'Hitachi',
    model: 'ZX210LC-6',
  },
  {
    name: 'JCB Backhoe',
    url: 'https://images.unsplash.com/photo-1579487785973-74d2ca7abdd5?auto=format&fit=crop&w=600&q=80',
    categoryType: 'hard' as AssetCategoryType,
    categoryName: 'Plant & Machinery',
    manufacturer: 'JCB',
    model: '3CX Eco Sitemaster',
  },
  {
    name: 'Scania Truck',
    url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80',
    categoryType: 'hard' as AssetCategoryType,
    categoryName: 'Commercial Vehicles',
    manufacturer: 'Scania',
    model: 'R 500 V8 Highline',
  },
  {
    name: 'Electric Forklift',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    categoryType: 'hard' as AssetCategoryType,
    categoryName: 'Materials Handling',
    manufacturer: 'Toyota',
    model: 'Traigo 48 8FBE20T',
  },
  {
    name: 'CNC Milling Lathe',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    categoryType: 'hard' as AssetCategoryType,
    categoryName: 'Engineering / CNC',
    manufacturer: 'DMG MORI',
    model: 'NLX 2500 / 700',
  },
  {
    name: 'Cloud Server SAN',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    categoryType: 'soft' as AssetCategoryType,
    categoryName: 'Technology & Software',
    manufacturer: 'Dell Technologies',
    model: 'PowerEdge R760 SAN Cluster',
  },
];

export const InventoryPage: React.FC = () => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, currentUser } = useApp();
  const navigate = useNavigate();

  const isDealer = currentUser.role === 'Dealer Admin' || currentUser.role === 'Dealer User';

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<'all' | 'hard' | 'soft'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryType, setCategoryType] = useState<AssetCategoryType>('hard');
  const [categoryName, setCategoryName] = useState('Construction & Earthmoving');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [vinOrSerial, setVinOrSerial] = useState('');
  const [price, setPrice] = useState<number>(75000);
  const [quantity, setQuantity] = useState<number>(1);
  const [status, setStatus] = useState<'in_stock' | 'reserved' | 'sold'>('in_stock');
  const [description, setDescription] = useState('');

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    // If dealer, show their dealership's inventory or all available stock
    const matchesDealer = isDealer
      ? (item.dealerName === currentUser.organization || item.dealerId === 'dlr-1' || true)
      : true;

    const matchesSearch =
      searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.vinOrSerial && item.vinOrSerial.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryTypeFilter === 'all' || item.categoryType === categoryTypeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesDealer && matchesSearch && matchesCategory && matchesStatus;
  });

  const totalValue = filteredInventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalUnits = filteredInventory.reduce((sum, item) => sum + item.quantity, 0);
  const hardAssetCount = filteredInventory.filter(i => i.categoryType === 'hard').length;
  const softAssetCount = filteredInventory.filter(i => i.categoryType === 'soft').length;

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setImageUrl(PRESET_IMAGES[0].url);
    setCategoryType('hard');
    setCategoryName('Construction & Earthmoving');
    setManufacturer('Caterpillar');
    setModel('CAT 320 Next Gen');
    setYear(new Date().getFullYear());
    setVinOrSerial(`CAT-${Math.floor(100000 + Math.random() * 900000)}`);
    setPrice(145000);
    setQuantity(1);
    setStatus('in_stock');
    setDescription('Brand-new asset ready for immediate delivery and commercial finance underwriting.');
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setImageUrl(item.imageUrl || '');
    setCategoryType(item.categoryType);
    setCategoryName(item.categoryName);
    setManufacturer(item.manufacturer);
    setModel(item.model);
    setYear(item.year || new Date().getFullYear());
    setVinOrSerial(item.vinOrSerial || '');
    setPrice(item.price);
    setQuantity(item.quantity);
    setStatus(item.status);
    setDescription(item.description || '');
    setModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || price <= 0) return;

    if (editingItem) {
      updateInventoryItem(editingItem.id, {
        title,
        imageUrl,
        categoryType,
        categoryName,
        manufacturer,
        model,
        year,
        vinOrSerial,
        price,
        quantity,
        status,
        description,
      });
    } else {
      addInventoryItem({
        title,
        imageUrl,
        categoryType,
        categoryName,
        manufacturer,
        model,
        year,
        vinOrSerial,
        price,
        quantity,
        status,
        description,
      });
    }
    setModalOpen(false);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_IMAGES[0]) => {
    setImageUrl(preset.url);
    setCategoryType(preset.categoryType);
    setCategoryName(preset.categoryName);
    setManufacturer(preset.manufacturer);
    setModel(preset.model);
    setTitle(`${preset.manufacturer} ${preset.model}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs">
              <Package className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Dealer Asset Inventory</h1>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2.5 py-0.5 border border-emerald-200">
              {currentUser.organization}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Manage your machinery, vehicles, and equipment stock. When creating quotations, you can select directly from this inventory.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/quotations')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Calculator className="h-3.5 w-3.5 text-slate-500" />
            <span>Open Quote Calculator</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Asset to Inventory</span>
          </button>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Stock Value</p>
          <p className="mt-1.5 text-xl font-bold text-slate-900">{formatCurrency(totalValue)}</p>
          <p className="mt-1 text-[11px] text-slate-500">{totalUnits} total physical units</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Stock Assets Listed</p>
          <p className="mt-1.5 text-xl font-bold text-slate-900">{filteredInventory.length}</p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Ready for Quote</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Hard Assets</p>
          <p className="mt-1.5 text-xl font-bold text-amber-700">{hardAssetCount}</p>
          <p className="mt-1 text-[11px] text-slate-500">Machinery, Vehicles, Plant</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Soft Assets</p>
          <p className="mt-1.5 text-xl font-bold text-purple-700">{softAssetCount}</p>
          <p className="mt-1 text-[11px] text-slate-500">IT, SAN, Software licenses</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search asset title, manufacturer, model, VIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Category Type Filter */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={() => setCategoryTypeFilter('all')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                categoryTypeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setCategoryTypeFilter('hard')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                categoryTypeFilter === 'hard'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hard Asset
            </button>
            <button
              onClick={() => setCategoryTypeFilter('soft')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                categoryTypeFilter === 'soft'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Soft Asset
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 ml-auto sm:ml-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Items List */}
      {filteredInventory.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Package className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900">No assets found in inventory</h3>
          <p className="mt-1 text-xs text-slate-500">
            {searchTerm ? 'No assets matched your search filters.' : 'Add your first asset to stock to enable dealer quotation selection.'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Asset Now</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInventory.map((item) => (
            <div
              key={item.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all overflow-hidden group"
            >
              {/* Asset Image Header */}
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}

                {/* Badges on image */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs ${
                      item.categoryType === 'hard' ? 'bg-amber-600' : 'bg-purple-600'
                    }`}
                  >
                    {item.categoryType === 'hard' ? 'Hard Asset' : 'Soft Asset'}
                  </span>
                  <span className="rounded-md bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-white shadow-xs">
                    {item.categoryName}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-xs ${
                      item.status === 'in_stock'
                        ? 'bg-emerald-600 text-white'
                        : item.status === 'reserved'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-600 text-white'
                    }`}
                  >
                    {item.status === 'in_stock' ? `${item.quantity} In Stock` : item.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Asset Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {item.manufacturer} {item.model && `• ${item.model}`}
                      </p>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description || 'No description provided.'}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400">Serial/VIN:</span>
                      <p className="font-mono font-medium text-slate-700 truncate">{item.vinOrSerial || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Dealer:</span>
                      <p className="font-medium text-slate-700 truncate">{item.dealerName}</p>
                    </div>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Net Asset Price</span>
                    <p className="text-base font-extrabold text-slate-900 leading-tight">
                      {formatCurrency(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      title="Edit Stock Details"
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteInventoryItem(item.id)}
                      title="Delete Asset"
                      className="rounded-lg border border-slate-200 p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => navigate(`/quotations?inventoryId=${item.id}`)}
                      className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition-colors"
                    >
                      <Calculator className="h-3 w-3" />
                      <span>Quote</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Asset</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Manufacturer / Model</th>
                  <th className="px-4 py-3">VIN / Serial</th>
                  <th className="px-4 py-3 text-right">Unit Price</th>
                  <th className="px-4 py-3 text-center">In Stock</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-10 w-12 rounded object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{item.title}</p>
                          <p className="text-[11px] text-slate-400">{item.categoryName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          item.categoryType === 'hard'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}
                      >
                        {item.categoryType === 'hard' ? 'Hard Asset' : 'Soft Asset'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.manufacturer} {item.model}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {item.vinOrSerial || '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteInventoryItem(item.id)}
                          className="rounded p-1 text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/quotations?inventoryId=${item.id}`)}
                          className="rounded-md bg-brand-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-brand-700"
                        >
                          Quote
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Inventory Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {editingItem ? 'Edit Inventory Asset' : 'Add New Asset to Dealer Inventory'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Preset Image & Type Shortcuts */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Quick Presets & Templates
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asset Title / Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Caterpillar 320 Next Gen Tracked Excavator"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Image URL & File Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Upload Photo
                  </label>
                  <label className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Choose file</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Image Preview */}
              {imageUrl && (
                <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 right-2 bg-slate-900/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                    Image Preview
                  </span>
                </div>
              )}

              {/* Category Type & Industry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Asset Classification *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCategoryType('hard')}
                      className={`rounded-lg border px-3 py-2 text-xs font-bold transition-all ${
                        categoryType === 'hard'
                          ? 'border-amber-500 bg-amber-50 text-amber-800'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      Hard Asset
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryType('soft')}
                      className={`rounded-lg border px-3 py-2 text-xs font-bold transition-all ${
                        categoryType === 'soft'
                          ? 'border-purple-500 bg-purple-50 text-purple-800'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      Soft Asset
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Industry Category
                  </label>
                  <select
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Commercial Vehicles">Commercial Vehicles (Trucks / HGVs)</option>
                    <option value="Construction & Earthmoving">Construction & Earthmoving</option>
                    <option value="Plant & Machinery">Plant & Machinery</option>
                    <option value="Materials Handling">Materials Handling (Forklifts)</option>
                    <option value="Agriculture">Agriculture & Tractors</option>
                    <option value="Engineering / CNC">Engineering & CNC Machinery</option>
                    <option value="Technology & Software">Technology & Cloud Infrastructure</option>
                  </select>
                </div>
              </div>

              {/* Manufacturer and Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Manufacturer / Brand
                  </label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="e.g. Scania, CAT, JCB, Toyota"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Model Number
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. 320 Next Gen"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Price, Quantity, Year, Serial */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Net Unit Price (£) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Year of Build
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>

              {/* VIN / Serial Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chassis / Serial / VIN Number
                </label>
                <input
                  type="text"
                  value={vinOrSerial}
                  onChange={(e) => setVinOrSerial(e.target.value)}
                  placeholder="e.g. YS2R6X2000289104"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Equipment Description & Key Specifications
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Include technical specs, attachments, boom lengths, or software license details..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{editingItem ? 'Save Changes' : 'Add to Inventory'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
