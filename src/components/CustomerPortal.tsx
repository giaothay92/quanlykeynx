import React, { useState } from 'react';
import { 
  Search, 
  KeyRound, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Copy, 
  Check, 
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Download,
  CheckCircle2
} from 'lucide-react';
import { OrderItem } from '../types/license';
import { formatDate, formatDateOnly, getDaysRemaining } from '../utils/licenseUtils';

interface CustomerPortalProps {
  orders: OrderItem[];
  onActivateOrder: (orderId: string) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  orders,
  onActivateOrder,
}) => {
  const [query, setQuery] = useState('DH-100293');
  const [searched, setSearched] = useState(true);
  const [foundOrder, setFoundOrder] = useState<OrderItem | null>(
    orders.find((o) => o.orderCode === 'DH-100293') || orders[0] || null
  );
  const [copied, setCopied] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const q = query.trim().toUpperCase();
    const result = orders.find(
      (o) =>
        o.orderCode.trim().toUpperCase() === q ||
        o.licenseKey.trim().toUpperCase() === q ||
        (o.machineId && o.machineId.trim().toUpperCase() === q) ||
        o.customerEmail.trim().toLowerCase() === query.trim().toLowerCase()
    );

    setFoundOrder(result || null);
    setSearched(true);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const remaining = foundOrder ? getDaysRemaining(foundOrder.expirationDate) : null;

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {/* Search Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Cổng Tra Cứu Khách Hàng (Customer License Portal)</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Kiểm Tra Tình Trạng Bản Quyền &amp; Hạn Sử Dụng
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Nhập <strong>Mã đơn hàng (OrderCode)</strong> hoặc <strong>License Key</strong> đã nhận khi mua hàng để kiểm tra thời hạn và lấy hướng dẫn kích hoạt.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="bg-white p-2 border border-slate-200 rounded-xl shadow-xs flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ví dụ: DH-100293 hoặc 1Y-4F2A-98CB hoặc email..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none font-mono"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
        >
          Tra cứu
        </button>
      </form>

      {/* Suggested Quick Codes */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <span>Thử mã mẫu:</span>
        {orders.slice(0, 3).map((o) => (
          <button
            key={o.id}
            onClick={() => {
              setQuery(o.orderCode);
              setFoundOrder(o);
              setSearched(true);
            }}
            className="font-mono text-emerald-700 hover:underline bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
          >
            {o.orderCode}
          </button>
        ))}
      </div>

      {/* Search Result */}
      {searched && (
        <>
          {foundOrder ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Header Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      Mã đơn #{foundOrder.orderCode}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs font-medium text-slate-600">
                      Gói: {foundOrder.packagePlan}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {foundOrder.customerName}
                  </h3>
                </div>

                <div>
                  {foundOrder.status === 'Active' && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Bản Quyền Đang Hoạt Động</span>
                    </div>
                  )}
                  {foundOrder.status === 'Pending' && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold">
                      <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                      <span>Chờ Kích Hoạt</span>
                    </div>
                  )}
                  {foundOrder.status === 'Expired' && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-bold">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Đã Hết Hạn Bản Quyền</span>
                    </div>
                  )}
                </div>
              </div>

              {/* License Key Display Card */}
              {foundOrder.status === 'Active' && foundOrder.licenseKey ? (
                <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                      MÃ KEY KÍCH HOẠT CỦA BẠN
                    </span>
                    <span>1 Thiết bị / Bản quyền cá nhân</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-400 tracking-wider">
                      {foundOrder.licenseKey}
                    </span>
                    <button
                      onClick={() => handleCopyKey(foundOrder.licenseKey)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-md flex items-center gap-1.5 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : foundOrder.status === 'Pending' ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
                  <p className="font-semibold text-amber-950">
                    Đơn hàng #{foundOrder.orderCode} chưa được cấp License Key.
                  </p>
                  <p className="text-amber-800">
                    Nếu bạn vừa thanh toán qua ngân hàng, hệ thống Webhook sẽ tự động cập nhật trong 1-2 phút.
                  </p>
                  <button
                    onClick={() => onActivateOrder(foundOrder.id)}
                    className="mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded shadow-xs"
                  >
                    Kích hoạt thử ngay bây giờ
                  </button>
                </div>
              ) : null}

              {/* Validity Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] text-slate-500 block">Ngày kích hoạt:</span>
                  <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
                    {foundOrder.activationDate || '—'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] text-slate-500 block">Hạn bản quyền:</span>
                  <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
                    {foundOrder.expirationDate || '—'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] text-slate-500 block">Thời gian còn lại:</span>
                  <span
                    className={`text-xs font-bold mt-0.5 block ${
                      remaining?.isExpired
                        ? 'text-rose-600'
                        : remaining?.isUrgent
                        ? 'text-amber-600'
                        : 'text-emerald-700'
                    }`}
                  >
                    {remaining?.label}
                  </span>
                </div>
              </div>

              {foundOrder.machineId && (
                <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-indigo-950">Mã thiết bị đăng ký (MachineID):</span>
                    <span className="font-mono text-indigo-800 font-bold">{foundOrder.machineId}</span>
                  </div>
                  <button
                    onClick={() => handleCopyKey(foundOrder.machineId!)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-[11px]"
                  >
                    Sao chép
                  </button>
                </div>
              )}

              {/* Instructions */}
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Hướng dẫn kích hoạt phần mềm
                </h4>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-500">
                  <li>Tải và cài đặt phiên bản mới nhất của ứng dụng.</li>
                  <li>Khởi động ứng dụng, chọn mục <strong>Cài đặt &gt; Kích hoạt bản quyền</strong>.</li>
                  <li>Nhập chính xác mã Key ở trên và bấm <strong>Xác nhận</strong>.</li>
                  <li>Nếu gặp sự cố, vui lòng liên hệ Zalo CSKH để được hỗ trợ tức thì.</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-800 text-sm">
                Không tìm thấy thông tin đơn hàng với mã "{query}"
              </p>
              <p className="mt-1 text-slate-400">
                Vui lòng kiểm tra lại mã đơn hàng trong email biên nhận hoặc tin nhắn giao dịch ngân hàng.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
