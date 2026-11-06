import React, { useState } from 'react';
import { X, Zap, CheckCircle2, Copy, Check, KeyRound } from 'lucide-react';
import { OrderItem } from '../types/license';

interface QuickActivateModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingOrders: OrderItem[];
  onActivate: (orderCode: string) => {
    success: boolean;
    message: string;
    key?: string;
    order?: OrderItem;
  };
}

export const QuickActivateModal: React.FC<QuickActivateModalProps> = ({
  isOpen,
  onClose,
  pendingOrders,
  onActivate,
}) => {
  if (!isOpen) return null;

  const [orderCode, setOrderCode] = useState(pendingOrders[0]?.orderCode || '');
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    key?: string;
    order?: OrderItem;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim()) return;
    const res = onActivate(orderCode.trim());
    setResult(res);
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Kích Hoạt Nhanh Theo Mã Đơn
              </h3>
              <p className="text-[11px] text-slate-500">
                Tìm kiếm Cột H &amp; Tự động sinh Key 1Y-XXXX-YYYY
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

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {pendingOrders.length > 0 && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Đơn đang chờ kích hoạt ({pendingOrders.length}):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {pendingOrders.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setOrderCode(p.orderCode);
                      setResult(null);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                      orderCode === p.orderCode
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {p.orderCode}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nhập Mã Đơn Hàng (OrderCode):
              </label>
              <input
                type="text"
                required
                value={orderCode}
                onChange={(e) => {
                  setOrderCode(e.target.value);
                  setResult(null);
                }}
                placeholder="Ví dụ: DH-100295"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm shadow-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Chạy Logic Kích Hoạt Key</span>
            </button>
          </form>

          {/* Result view */}
          {result && (
            <div
              className={`p-3.5 rounded-xl border ${
                result.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <X className="w-4 h-4 text-rose-600" />
                )}
                <span>{result.message}</span>
              </div>

              {result.key && (
                <div className="mt-2 p-2.5 bg-white rounded-lg border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Mã Key mới:</span>
                    <button
                      onClick={() => handleCopy(result.key!)}
                      className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 text-[11px]"
                    >
                      {copiedKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey ? 'Đã sao chép' : 'Sao chép key'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-base font-bold text-emerald-700 text-center tracking-wider bg-slate-50 py-1.5 rounded">
                    {result.key}
                  </div>
                  <p className="text-[10px] text-slate-500 text-center">
                    Cột B: "x" · Cột D &amp; E: Thời hạn 1 năm · Cột G: "Active"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
