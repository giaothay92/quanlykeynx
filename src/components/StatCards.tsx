import React from 'react';
import { 
  KeyRound, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { OrderItem } from '../types/license';
import { formatVND, getDaysRemaining } from '../utils/licenseUtils';

interface StatCardsProps {
  orders: OrderItem[];
  selectedFilter: string;
  onSelectFilter: (status: string) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({
  orders,
  selectedFilter,
  onSelectFilter,
}) => {
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) => o.status === 'Active');
  const pendingOrders = orders.filter((o) => o.status === 'Pending');
  const expiredOrders = orders.filter((o) => {
    if (o.status === 'Expired') return true;
    if (o.status === 'Active' && o.expirationDate) {
      return getDaysRemaining(o.expirationDate).isExpired;
    }
    return false;
  });

  const expiringSoonOrders = orders.filter((o) => {
    if (o.status === 'Active' && o.expirationDate) {
      const { days, isExpired } = getDaysRemaining(o.expirationDate);
      return !isExpired && days <= 30;
    }
    return false;
  });

  const totalRevenue = orders
    .filter((o) => o.status === 'Active' || o.issued)
    .reduce((sum, o) => sum + (o.price || 0), 0);

  const activeRate = totalOrders > 0 ? Math.round((activeOrders.length / totalOrders) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
      {/* 1. Tổng đơn hàng */}
      <div
        onClick={() => onSelectFilter('all')}
        className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
          selectedFilter === 'all'
            ? 'border-slate-800 ring-2 ring-slate-800/10 shadow-sm'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Tổng Đơn Hàng</span>
          <KeyRound className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalOrders}</span>
          <span className="text-xs text-slate-500">Mã đơn cột H</span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center text-xs text-slate-500 gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tỷ lệ cấp key: {activeRate}%</span>
        </div>
      </div>

      {/* 2. Đã kích hoạt (Active) */}
      <div
        onClick={() => onSelectFilter('Active')}
        className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
          selectedFilter === 'Active'
            ? 'border-emerald-600 ring-2 ring-emerald-600/15 shadow-sm'
            : 'border-slate-200 hover:border-emerald-200 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Đang Hoạt Động</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-emerald-700 tracking-tight">{activeOrders.length}</span>
          <span className="text-xs font-medium text-emerald-600">Đã gán Key (Col C)</span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center text-xs text-slate-500 gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Cột G = "Active" · Cột B = "x"</span>
        </div>
      </div>

      {/* 3. Chờ kích hoạt (Pending) */}
      <div
        onClick={() => onSelectFilter('Pending')}
        className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
          selectedFilter === 'Pending'
            ? 'border-amber-500 ring-2 ring-amber-500/15 shadow-sm'
            : 'border-slate-200 hover:border-amber-300 hover:shadow-xs'
        } ${pendingOrders.length > 0 ? 'bg-amber-50/20' : ''}`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Chờ Kích Hoạt</span>
          <Clock className={`w-4 h-4 ${pendingOrders.length > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-400'}`} />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-amber-600 tracking-tight">{pendingOrders.length}</span>
          <span className="text-xs font-medium text-amber-700">Cần chạy webhook</span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center text-xs text-slate-500 gap-1.5">
          <span className="text-slate-500">Chưa sinh key</span>
          <span aria-hidden="true">·</span>
          <span className="text-amber-700 font-medium">Bấm để kích hoạt nhanh</span>
        </div>
      </div>

      {/* 4. Sắp hết hạn & Đã hết hạn */}
      <div
        onClick={() => onSelectFilter('expiring')}
        className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
          selectedFilter === 'expiring'
            ? 'border-rose-500 ring-2 ring-rose-500/15 shadow-sm'
            : 'border-slate-200 hover:border-rose-200 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">Sắp Hết Hạn (&lt;30d)</span>
          <AlertTriangle className="w-4 h-4 text-rose-500" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-rose-600 tracking-tight">{expiringSoonOrders.length}</span>
          <span className="text-xs text-slate-500">Hết hạn: {expiredOrders.length}</span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center text-xs text-slate-500 gap-1.5">
          <span>Hạn tại Cột E</span>
          <span aria-hidden="true">·</span>
          <span className="text-rose-600 font-medium">Cần liên hệ gia hạn</span>
        </div>
      </div>

      {/* 5. Doanh thu bản quyền */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Doanh Thu Bản Quyền</span>
          <DollarSign className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-bold text-slate-900 tracking-tight">{formatVND(totalRevenue)}</span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center text-xs text-slate-500 gap-1.5">
          <span>Gói 1Y, 6M &amp; Vĩnh viễn</span>
        </div>
      </div>
    </div>
  );
};
