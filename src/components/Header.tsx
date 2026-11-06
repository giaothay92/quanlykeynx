import React from 'react';
import { 
  FileSpreadsheet, 
  KeyRound, 
  Plus, 
  Code2, 
  Zap, 
  Download, 
  Search,
  ExternalLink,
  RefreshCw,
  Layers,
  Users
} from 'lucide-react';
import { OrderItem } from '../types/license';
import { exportOrdersToCSV } from '../utils/licenseUtils';

interface HeaderProps {
  orders: OrderItem[];
  activeTab: 'orders' | 'sheets' | 'webhook' | 'portal' | 'analytics' | 'collaborators';
  setActiveTab: (tab: 'orders' | 'sheets' | 'webhook' | 'portal' | 'analytics' | 'collaborators') => void;
  onOpenNewOrder: () => void;
  onOpenQuickActivate: () => void;
  onOpenBulkKey: () => void;
  onOpenScriptModal: () => void;
  onSync: () => void;
  isSyncing: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  collaboratorsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  orders,
  activeTab,
  setActiveTab,
  onOpenNewOrder,
  onOpenQuickActivate,
  onOpenBulkKey,
  onOpenScriptModal,
  onSync,
  isSyncing,
  searchQuery,
  setSearchQuery,
  collaboratorsCount = 0,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
      {/* Top Banner / System Notice */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-100">Google Apps Script Webhook Engine</span>
          <span className="text-slate-500">·</span>
          <span>Cột H: Mã đơn hàng (OrderCode)</span>
          <span className="text-slate-500">·</span>
          <span>Cột C: License Key (1Y-XXXX-YYYY)</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenScriptModal}
            className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Mã nguồn Google Apps Script</span>
          </button>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Đồng bộ tự động: Đang kích hoạt</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">LicenseSheet</h1>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  v2.4 Apps Script
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Dashboard Quản lý Bản Quyền & Kích Hoạt Tự Động Theo Đơn Hàng
              </p>
            </div>
          </div>

          {/* Quick Global Search */}
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh mã đơn (Col H), key (Col C), tên, email..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onSync}
              disabled={isSyncing}
              title="Đồng bộ dữ liệu"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            <button
              onClick={() => exportOrdersToCSV(orders)}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Xuất CSV</span>
            </button>

            <button
              onClick={onOpenQuickActivate}
              className="px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>Kích hoạt mã đơn</span>
            </button>

            <button
              onClick={onOpenBulkKey}
              className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Sinh key hàng loạt</span>
            </button>

            <button
              onClick={onOpenNewOrder}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-sm shadow-emerald-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo đơn mới</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-4 flex items-center gap-1 border-t border-slate-100 pt-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Danh sách Đơn hàng &amp; Key</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                activeTab === 'orders' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'sheets'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Google Sheets ActiveID ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('collaborators')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'collaborators'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cộng Tác Viên (CTV)</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                activeTab === 'collaborators' ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}
            >
              {collaboratorsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('webhook')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'webhook'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Giả lập Webhook &amp; Test API</span>
          </button>

          <button
            onClick={() => setActiveTab('portal')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'portal'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
            <span>Cổng tra cứu cho Khách hàng</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Báo cáo &amp; Thống kê</span>
          </button>
        </div>
      </div>
    </header>
  );
};
