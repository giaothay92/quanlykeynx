import React, { useState } from 'react';
import { 
  Zap, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Code2, 
  Copy, 
  Check, 
  RefreshCw, 
  Terminal,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { OrderItem, WebhookLog } from '../types/license';

interface WebhookSimulatorProps {
  orders: OrderItem[];
  onTriggerWebhook: (orderCode: string, method: 'POST' | 'GET') => {
    success: boolean;
    message: string;
    key?: string;
    actDate?: string;
    expDate?: string;
    order?: OrderItem;
  };
  webhookLogs: WebhookLog[];
  onClearLogs: () => void;
}

export const WebhookSimulator: React.FC<WebhookSimulatorProps> = ({
  orders,
  onTriggerWebhook,
  webhookLogs,
  onClearLogs,
}) => {
  const pendingOrders = orders.filter((o) => o.status === 'Pending');
  const [selectedOrderCode, setSelectedOrderCode] = useState(
    pendingOrders[0]?.orderCode || 'DH-100295'
  );
  const [method, setMethod] = useState<'POST' | 'GET'>('POST');
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    key?: string;
    actDate?: string;
    expDate?: string;
    payload?: string;
  } | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [activeTabGateway, setActiveTabGateway] = useState<'sepay' | 'vietqr' | 'payos' | 'curl'>('sepay');

  const handleSimulate = () => {
    if (!selectedOrderCode.trim()) return;
    setIsExecuting(true);
    setLastResult(null);

    setTimeout(() => {
      const res = onTriggerWebhook(selectedOrderCode.trim(), method);
      setLastResult({
        ...res,
        payload: JSON.stringify(
          {
            success: res.success,
            orderCode: selectedOrderCode.trim(),
            key: res.key || null,
            activationDate: res.actDate || null,
            expirationDate: res.expDate || null,
            message: res.message,
          },
          null,
          2
        ),
      });
      setIsExecuting(false);
    }, 400);
  };

  const curlExample = `curl -X POST "https://script.google.com/macros/s/AKfycb.../exec" \\
  -H "Content-Type: application/json" \\
  -d '{"orderCode": "${selectedOrderCode || 'DH-100295'}"}'`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlExample);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 fill-amber-400" />
              <span>Apps Script Webhook Engine Simulator</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Giả Lập Kích Hoạt Tự Động Theo Đoạn Mã Apps Script
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Khi khách hàng chuyển khoản qua SePay, VietQR hoặc PayOS, Webhook sẽ gửi mã đơn hàng <code className="text-amber-300 font-mono">orderCode</code> tới Google Apps Script. Hệ thống duyệt Cột H, nếu chưa Active thì tự sinh Key <code className="text-emerald-300 font-mono">1Y-XXXX-YYYY</code> và cập nhật Cột B, C, D, E, G.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">
              Chờ kích hoạt: <strong className="text-amber-400">{pendingOrders.length} đơn</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Simulator on Left, Logs & Gateways on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Simulator Box */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Terminal className="w-4 h-4 text-emerald-600" />
              <span>Gửi Request Kích Hoạt (Test Webhook)</span>
            </h3>

            {/* Quick Pick Pending Orders */}
            {pendingOrders.length > 0 && (
              <div className="mb-4 p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs">
                <span className="font-semibold text-amber-900 block mb-1.5">
                  Chọn nhanh đơn hàng từ Google Sheet đang chờ kích hoạt (Status = "Pending"):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {pendingOrders.slice(0, 20).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedOrderCode(p.orderCode)}
                      className={`px-2.5 py-1 rounded font-mono font-bold transition-all text-xs flex items-center gap-1.5 ${
                        selectedOrderCode === p.orderCode
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      <span>#{p.id}: {p.orderCode}</span>
                      {p.machineId && (
                        <span className="font-normal text-[10px] opacity-80">
                          ({p.machineId.slice(0, 8)}...)
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {pendingOrders.length > 20 && (
                  <p className="text-[10px] text-amber-700 mt-1 italic">
                    Còn {pendingOrders.length - 20} đơn Pending khác trong Google Sheet. Bạn có thể nhập trực tiếp mã đơn bên dưới.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-4">
              {/* Input OrderCode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã đơn hàng (<code className="text-amber-700 font-mono">orderCode</code> tại Cột H)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={selectedOrderCode}
                    onChange={(e) => setSelectedOrderCode(e.target.value)}
                    placeholder="Ví dụ: DH-100295 hoặc ORD-882190"
                    className="flex-1 px-3.5 py-2.5 text-sm font-mono font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as 'POST' | 'GET')}
                    className="px-3 py-2.5 text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="POST">POST (JSON)</option>
                    <option value="GET">GET (Query)</option>
                  </select>
                </div>
              </div>

              {/* Trigger Button */}
              <button
                onClick={handleSimulate}
                disabled={isExecuting || !selectedOrderCode}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm shadow-emerald-200 flex items-center justify-center gap-2 transition-all"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang duyệt Google Sheet &amp; Cấp Key...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Chạy Kích Hoạt Webhook (Execute Apps Script)</span>
                  </>
                )}
              </button>

              {/* Simulation Result */}
              {lastResult && (
                <div
                  className={`mt-4 p-4 rounded-xl border text-xs ${
                    lastResult.success
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-2">
                    {lastResult.success ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-800">
                          Thành công! Trả về ContentService: &#123; success: true &#125;
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span className="text-rose-800">
                          Thất bại! Trả về ContentService: &#123; success: false &#125;
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-700 mb-2">{lastResult.message}</p>

                  {lastResult.key && (
                    <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-1 mb-2 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-sans text-[11px]">License Key mới sinh (Col C):</span>
                        <strong className="text-emerald-700 text-sm">{lastResult.key}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600 font-sans">
                        <span>Hạn sử dụng (+1 năm tại Col E):</span>
                        <span className="font-mono">{lastResult.expDate?.slice(0, 10)}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-sans pt-1 border-t border-slate-100">
                        Cột B đã đánh dấu <strong className="text-emerald-700">"x"</strong> · Cột G chuyển sang <strong className="text-emerald-700">"Active"</strong>
                      </div>
                    </div>
                  )}

                  {/* JSON Output */}
                  <div className="mt-2">
                    <span className="text-[11px] text-slate-500 font-semibold block mb-1">
                      JSON Response từ Google Apps Script:
                    </span>
                    <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg text-[11px] font-mono overflow-x-auto">
                      {lastResult.payload}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* cURL Command Box */}
          <div className="bg-slate-900 text-slate-300 rounded-xl p-4 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gọi từ Terminal / Server (cURL)</span>
              </span>
              <button
                onClick={copyCurl}
                className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                {copiedCurl ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedCurl ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>
            <pre className="font-mono text-emerald-300/90 overflow-x-auto p-2 bg-slate-950 rounded border border-slate-800 text-[11px]">
              {curlExample}
            </pre>
          </div>
        </div>

        {/* Right Column: Webhook Logs & Payment Gateway Tabs */}
        <div className="lg:col-span-5 space-y-4">
          {/* Payment Gateways Config Guide */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Cấu hình Webhook Cổng Thanh Toán
            </h3>

            {/* Gateway Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200 pb-2 mb-3">
              <button
                onClick={() => setActiveTabGateway('sepay')}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                  activeTabGateway === 'sepay'
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                SePay
              </button>
              <button
                onClick={() => setActiveTabGateway('vietqr')}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                  activeTabGateway === 'vietqr'
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                VietQR / Casso
              </button>
              <button
                onClick={() => setActiveTabGateway('payos')}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                  activeTabGateway === 'payos'
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                PayOS
              </button>
            </div>

            {/* Gateway Content */}
            <div className="text-xs text-slate-600 space-y-2">
              {activeTabGateway === 'sepay' && (
                <>
                  <p>
                    1. Đăng nhập <strong>my.sepay.vn</strong> &gt; Cấu hình Webhook.
                  </p>
                  <p>
                    2. Dán link Web App Apps Script: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">https://script.google.com/macros/s/.../exec</code>
                  </p>
                  <p>
                    3. Trong nội dung chuyển khoản, khách ghi mã đơn hàng (ví dụ: <code className="text-amber-700 font-mono font-bold">DH100293</code>). SePay gửi Webhook, Apps Script tự động kích hoạt Cột H!
                  </p>
                </>
              )}
              {activeTabGateway === 'vietqr' && (
                <>
                  <p>
                    1. Cấu hình webhook Casso / VietQR bắt giao dịch tài khoản ngân hàng.
                  </p>
                  <p>
                    2. Khi có tiền vào kèm cú pháp mã đơn, Casso POST dữ liệu sang Google Apps Script.
                  </p>
                  <p>
                    3. Hàm trích xuất mã đơn và gán key bản quyền ngay trong 2 giây.
                  </p>
                </>
              )}
              {activeTabGateway === 'payos' && (
                <>
                  <p>
                    1. Đăng ký Webhook trên <strong>payos.vn</strong>.
                  </p>
                  <p>
                    2. PayOS gửi payload chứa <code className="bg-slate-100 px-1 font-mono text-[11px]">orderCode</code> tương ứng Cột H của bảng tính.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Webhook Execution History Log */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Lịch Sử Gọi Webhook ({webhookLogs.length})</span>
              </h3>
              {webhookLogs.length > 0 && (
                <button
                  onClick={onClearLogs}
                  className="text-[11px] text-slate-400 hover:text-slate-600"
                >
                  Xóa lịch sử
                </button>
              )}
            </div>

            {webhookLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">
                Chưa có yêu cầu Webhook nào được ghi nhận. Bấm "Chạy Kích Hoạt Webhook" ở trên để kiểm tra.
              </p>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {webhookLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-2.5 rounded-lg border text-xs ${
                      log.status === 'success'
                        ? 'bg-emerald-50/50 border-emerald-100'
                        : 'bg-rose-50/50 border-rose-100'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-slate-900">{log.orderCode}</span>
                      <span className="text-[10px] text-slate-400 font-sans">{log.timestamp}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                      {log.status === 'success' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                      )}
                      <span>{log.message}</span>
                    </div>
                    {log.generatedKey && (
                      <div className="mt-1 text-[11px] font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 inline-block">
                        Key: {log.generatedKey}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
