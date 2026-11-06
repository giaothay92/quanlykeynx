import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Zap, 
  RotateCw, 
  ShieldAlert, 
  Mail, 
  MessageSquare, 
  Phone, 
  Calendar, 
  Clock, 
  KeyRound, 
  FileSpreadsheet,
  Send
} from 'lucide-react';
import { OrderItem } from '../types/license';
import { 
  formatDate, 
  formatDateOnly, 
  formatVND, 
  getDaysRemaining, 
  generateCustomerMessage 
} from '../utils/licenseUtils';

interface OrderDetailsModalProps {
  order: OrderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onActivate: (id: string) => void;
  onRenew: (id: string) => void;
  onRevoke: (id: string) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onActivate,
  onRenew,
  onRevoke,
}) => {
  if (!isOpen || !order) return null;

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const remaining = getDaysRemaining(order.expirationDate);
  const customerMessage = generateCustomerMessage(order);

  const handleCopyKey = () => {
    if (!order.licenseKey) return;
    navigator.clipboard.writeText(order.licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customerMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Chi Tiết Đơn Hàng #{order.orderCode}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                    order.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.status === 'Pending'
                      ? 'bg-amber-100 text-amber-800'
                      : order.status === 'Expired'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                <span>Google Sheet: Hàng #{Number(order.id) + 1} (Cột H: OrderCode)</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* License Key Card */}
          <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Col C: License Key</span>
              <span className="text-[11px]">Col B (Đã cấp): {order.issued ? '"x"' : 'Chưa'}</span>
            </div>
            <div className="flex items-center justify-between gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="font-mono text-lg font-bold text-emerald-400">
                {order.licenseKey || '(Chưa cấp key - Trạng thái Pending)'}
              </span>
              {order.licenseKey ? (
                <button
                  onClick={handleCopyKey}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded flex items-center gap-1 transition-colors"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              ) : (
                <button
                  onClick={() => onActivate(order.id)}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold rounded flex items-center gap-1 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-900" />
                  <span>Kích hoạt ngay</span>
                </button>
              )}
            </div>
          </div>

          {/* Grid Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Info */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Khách Hàng (Col F)
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Họ và tên:</span>
                  <span className="font-semibold text-slate-900">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-medium text-slate-800">{order.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SĐT / Ghi chú:</span>
                  <span className="font-medium text-slate-800">{order.customerPhone || '—'}</span>
                </div>
                {order.machineId && (
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span className="text-slate-500">MachineID (Col F):</span>
                    <span className="font-mono text-[11px] font-semibold text-indigo-700 truncate max-w-[180px]" title={order.machineId}>
                      {order.machineId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Cổng thanh toán:</span>
                  <span className="font-medium text-slate-800">{order.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Validity Info */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Thời Hạn Bản Quyền
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gói bản quyền:</span>
                  <span className="font-semibold text-slate-900">{order.packagePlan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Giá gói (VND):</span>
                  <span className="font-semibold text-emerald-700">{formatVND(order.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kích hoạt (Col D):</span>
                  <span className="font-medium text-slate-800">{formatDate(order.activationDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hết hạn (Col E):</span>
                  <span className="font-semibold text-slate-900">{formatDate(order.expirationDate)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Thời gian còn lại:</span>
                  <span
                    className={`font-bold ${
                      remaining.isExpired
                        ? 'text-rose-600'
                        : remaining.isUrgent
                        ? 'text-amber-600'
                        : 'text-emerald-700'
                    }`}
                  >
                    {remaining.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Notification Message Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Mẫu Tin Nhắn Gửi Khách Hàng (Email / Zalo / SMS)</span>
              </div>
              <button
                onClick={handleCopyMessage}
                className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 text-xs"
              >
                {copiedMessage ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMessage ? 'Đã sao chép tin nhắn' : 'Sao chép tin nhắn'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={7}
              value={customerMessage}
              className="w-full p-3 font-mono text-[11px] bg-slate-50 rounded-lg border border-slate-200 text-slate-800 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              {order.status === 'Pending' ? (
                <button
                  onClick={() => onActivate(order.id)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Kích hoạt &amp; Cấp Key</span>
                </button>
              ) : (
                <button
                  onClick={() => onRenew(order.id)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Gia hạn +1 năm</span>
                </button>
              )}

              {order.status !== 'Revoked' && (
                <button
                  onClick={() => onRevoke(order.id)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Thu hồi Key</span>
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
