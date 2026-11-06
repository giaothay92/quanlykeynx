import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  KeyRound, 
  PieChart, 
  ShieldCheck, 
  Clock, 
  Calendar,
  CreditCard
} from 'lucide-react';
import { OrderItem } from '../types/license';
import { formatVND } from '../utils/licenseUtils';

interface AnalyticsViewProps {
  orders: OrderItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ orders }) => {
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) => o.status === 'Active');
  const pendingOrders = orders.filter((o) => o.status === 'Pending');
  const expiredOrders = orders.filter((o) => o.status === 'Expired');
  
  const totalRevenue = orders
    .filter((o) => o.status === 'Active' || o.issued)
    .reduce((acc, cur) => acc + cur.price, 0);

  // Group by package
  const packages: Record<string, { count: number; revenue: number }> = {};
  orders.forEach((o) => {
    if (!packages[o.packagePlan]) {
      packages[o.packagePlan] = { count: 0, revenue: 0 };
    }
    packages[o.packagePlan].count += 1;
    if (o.status === 'Active' || o.issued) {
      packages[o.packagePlan].revenue += o.price;
    }
  });

  // Group by payment method
  const paymentMethods: Record<string, number> = {};
  orders.forEach((o) => {
    paymentMethods[o.paymentMethod] = (paymentMethods[o.paymentMethod] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Doanh thu đã thu
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {formatVND(totalRevenue)}
          </div>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Từ các đơn đã thanh toán & cấp key</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Tỷ lệ kích hoạt thành công
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {totalOrders > 0 ? Math.round((activeOrders.length / totalOrders) * 100) : 0}%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {activeOrders.length} / {totalOrders} đơn hàng đang Active
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Đơn chờ xử lý
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            {pendingOrders.length} đơn
          </div>
          <p className="text-xs text-amber-700 mt-1">
            Cần đối soát hoặc chạy webhook kích hoạt
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Thời hạn trung bình
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            12 Tháng
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tiền tố key: 1Y- (1 Year standard)
          </p>
        </div>
      </div>

      {/* Package & Payment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Packages Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <span>Cơ Cấu Gói Bản Quyền &amp; Doanh Thu</span>
          </h3>
          <div className="space-y-4">
            {Object.entries(packages).map(([pkgName, data]) => {
              const pct = totalOrders > 0 ? Math.round((data.count / totalOrders) * 100) : 0;
              return (
                <div key={pkgName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{pkgName}</span>
                    <span className="text-slate-500">
                      {data.count} đơn ({pct}%) · <strong className="text-slate-900">{formatVND(data.revenue)}</strong>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>Cổng Thanh Toán &amp; Nguồn Đơn</span>
          </h3>
          <div className="space-y-4">
            {Object.entries(paymentMethods).map(([methodName, count]) => {
              const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
              return (
                <div key={methodName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{methodName}</span>
                    <span className="text-slate-500">
                      {count} giao dịch ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
