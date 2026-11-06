import React, { useState } from 'react';
import { X, KeyRound, Sparkles, AlertCircle } from 'lucide-react';
import { OrderItem, LicensePackage } from '../types/license';
import { generateLicenseKey, calculateExpirationDate } from '../utils/licenseUtils';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: OrderItem) => void;
  existingCount: number;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingCount,
}) => {
  if (!isOpen) return null;

  const defaultOrderCode = `DH-${100295 + existingCount}`;
  const [orderCode, setOrderCode] = useState(defaultOrderCode);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [packagePlan, setPackagePlan] = useState<LicensePackage>('1 Năm');
  const [price, setPrice] = useState(499000);
  const [paymentMethod, setPaymentMethod] = useState<OrderItem['paymentMethod']>('VietQR / Chuyển khoản');
  const [autoActivate, setAutoActivate] = useState(false);
  const [notes, setNotes] = useState('');

  const handlePackageChange = (pkg: LicensePackage) => {
    setPackagePlan(pkg);
    if (pkg === '1 Năm') setPrice(499000);
    else if (pkg === '2 Năm') setPrice(899000);
    else if (pkg === '5 Năm') setPrice(1890000);
    else if (pkg === '6 Tháng') setPrice(299000);
    else if (pkg === '1 Tháng') setPrice(99000);
    else if (pkg === 'Trọn đời') setPrice(1490000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim() || !customerName.trim() || !customerEmail.trim()) {
      return;
    }

    let licenseKey = '';
    let activationDate: string | null = null;
    let expirationDate: string | null = null;
    let issued = false;
    let status: OrderItem['status'] = 'Pending';

    if (autoActivate) {
      licenseKey = generateLicenseKey(packagePlan);
      const act = new Date();
      const exp = calculateExpirationDate(act, packagePlan);
      activationDate = act.toISOString();
      expirationDate = exp.toISOString();
      issued = true;
      status = 'Active';
    }

    const newOrder: OrderItem = {
      id: String(existingCount + 1),
      issued,
      licenseKey,
      activationDate,
      expirationDate,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      packagePlan,
      price,
      status,
      orderCode: orderCode.trim().toUpperCase(),
      paymentMethod,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onSave(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Tạo Đơn Hàng Mới</h3>
              <p className="text-[11px] text-slate-500">
                Thêm bản ghi vào Google Sheet (Cột A đến H)
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Order Code (Column H) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mã Đơn Hàng (<code className="text-amber-700 font-mono">orderCode</code> - Cột H) *
            </label>
            <input
              type="text"
              required
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              placeholder="VD: DH-100295"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">
              Mã này sẽ dùng để so khớp trong <code className="font-mono">if (String(data[i][7]) === String(orderCode))</code>
            </p>
          </div>

          {/* Customer Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tên Khách Hàng (Cột F) *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Khách Hàng *
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Phone & Package */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Số Điện Thoại (Tùy chọn)
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Gói Bản Quyền
              </label>
              <select
                value={packagePlan}
                onChange={(e) => handlePackageChange(e.target.value as LicensePackage)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="1 Năm">1 Năm (1Y-XXXX-YYYY)</option>
                <option value="2 Năm">2 Năm (2Y-XXXX-YYYY)</option>
                <option value="5 Năm">5 Năm (5Y-XXXX-YYYY)</option>
                <option value="6 Tháng">6 Tháng (6M-XXXX-YYYY)</option>
                <option value="1 Tháng">1 Tháng (1M-XXXX-YYYY)</option>
                <option value="Trọn đời">Trọn đời (LT-XXXX-YYYY)</option>
              </select>
            </div>
          </div>

          {/* Price & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Số Tiền (VND)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phương Thức Thanh Toán
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as OrderItem['paymentMethod'])}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="VietQR / Chuyển khoản">VietQR / Chuyển khoản</option>
                <option value="SePay">SePay (Tự động)</option>
                <option value="PayOS">PayOS</option>
                <option value="MoMo">Ví MoMo</option>
                <option value="Thủ công">Thủ công / Tiền mặt</option>
              </select>
            </div>
          </div>

          {/* Auto-activate toggle */}
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-start gap-3">
            <input
              type="checkbox"
              id="autoActivate"
              checked={autoActivate}
              onChange={(e) => setAutoActivate(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="autoActivate" className="cursor-pointer">
              <span className="font-bold text-emerald-950 block">
                Sinh Key &amp; Kích Hoạt Ngay Lập Tức
              </span>
              <span className="text-slate-600 text-[11px] block mt-0.5">
                Đánh dấu Cột B là "x", tự sinh key 1Y-XXXX-YYYY vào Cột C, gán hạn +1 năm vào Cột E, và đặt Cột G là "Active". (Nếu bỏ chọn, đơn sẽ ở trạng thái Pending để bạn test Webhook).
              </span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Ghi Chú
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Khách gọi từ hotline, hỗ trợ cài đặt từ xa..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm shadow-emerald-200 transition-colors"
            >
              Lưu Đơn Hàng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
