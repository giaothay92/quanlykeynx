import React, { useState } from 'react';
import { 
  X, 
  Code2, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  FileSpreadsheet,
  Globe,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { FULL_APPS_SCRIPT_CODE } from '../utils/licenseUtils';

interface ScriptCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  webAppUrl: string;
  setWebAppUrl: (url: string) => void;
  onTestConnection: (url: string) => Promise<boolean>;
}

export const ScriptCodeModal: React.FC<ScriptCodeModalProps> = ({
  isOpen,
  onClose,
  webAppUrl,
  setWebAppUrl,
  onTestConnection,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [activeTab, setActiveTab] = useState<'code' | 'guide' | 'connect'>('code');

  const handleCopy = () => {
    navigator.clipboard.writeText(FULL_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTest = async () => {
    if (!webAppUrl.trim()) return;
    setIsTesting(true);
    setTestStatus('idle');
    try {
      const ok = await onTestConnection(webAppUrl.trim());
      setTestStatus(ok ? 'success' : 'failed');
    } catch {
      setTestStatus('failed');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Mã Nguồn Google Apps Script &amp; Cấu Hình Webhook
              </h3>
              <p className="text-[11px] text-slate-500">
                Toàn bộ code backend xử lý tự động cấp key và cập nhật Google Sheet
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

        {/* Tab switch */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'code'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Mã Nguồn Apps Script (Code.gs)
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Hướng Dẫn Triển Khai 6 Bước
          </button>
          <button
            onClick={() => setActiveTab('connect')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'connect'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Kết Nối Web App Trực Tiếp
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  Đoạn mã đã hoàn thiện từ logic của bạn, bao gồm xử lý <code className="font-mono bg-slate-100 px-1 py-0.5 rounded font-bold">doPost</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded font-bold">doGet</code>, CORS và trích xuất mã đơn hàng.
                </span>
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Đã sao chép toàn bộ' : 'Sao chép mã Apps Script'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-[460px] leading-relaxed border border-slate-800 selection:bg-emerald-600 selection:text-white">
                  {FULL_APPS_SCRIPT_CODE}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-950">
                <h4 className="font-bold text-sm mb-1">
                  Cách đưa mã này vào Google Sheets của bạn:
                </h4>
                <p className="text-xs text-emerald-800">
                  Chỉ mất 2 phút cài đặt, sau đó mọi thanh toán từ SePay/VietQR/PayOS sẽ tự động tạo Key và gửi về khách hàng!
                </p>
              </div>

              <ol className="space-y-3 text-slate-700 list-decimal list-inside pl-2">
                <li className="font-medium">
                  <strong>Tạo Google Sheets:</strong> Tạo một bảng tính mới, đặt tên sheet đầu tiên là <code className="bg-slate-100 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-bold">DonHang</code>.
                </li>
                <li className="font-medium">
                  <strong>Tạo dòng tiêu đề tại Hàng 1:</strong>
                  <div className="mt-1 pl-4 text-[11px] font-mono text-slate-600 space-y-0.5">
                    <div>Col A: STT · Col B: Đã cấp · Col C: License Key</div>
                    <div>Col D: Ngày kích hoạt · Col E: Ngày hết hạn</div>
                    <div>Col F: Khách hàng · Col G: Trạng thái · Col H: OrderCode</div>
                  </div>
                </li>
                <li className="font-medium">
                  <strong>Mở Apps Script:</strong> Trên thanh menu Google Sheets, bấm <strong>Tiện ích mở rộng (Extensions)</strong> &gt; <strong>Apps Script</strong>.
                </li>
                <li className="font-medium">
                  <strong>Dán code:</strong> Xóa toàn bộ nội dung cũ trong tệp <code className="bg-slate-100 font-mono">Mã.gs</code> và dán toàn bộ đoạn mã ở tab "Mã Nguồn Apps Script" vào. Nhấn <strong>Lưu (Ctrl + S)</strong>.
                </li>
                <li className="font-medium">
                  <strong>Triển khai Web App:</strong>
                  <ul className="list-disc list-inside pl-4 mt-1 text-slate-600 space-y-1 font-normal">
                    <li>Bấm nút <strong>Triển khai (Deploy)</strong> ở góc trên bên phải &gt; <strong>Tùy chọn triển khai mới (New deployment)</strong>.</li>
                    <li>Bấm biểu tượng bánh răng &gt; chọn <strong>Ứng dụng web (Web app)</strong>.</li>
                    <li>Mô tả: <em>Webhook Kích Hoạt Key Bản Quyền</em>.</li>
                    <li>Thực thi dưới quyền (Execute as): <strong>Tôi (Me)</strong>.</li>
                    <li>Ai có quyền truy cập (Who has access): <strong>Bất kỳ ai (Anyone)</strong>.</li>
                    <li>Bấm <strong>Triển khai</strong> và cấp quyền truy cập tài khoản Google khi được hỏi.</li>
                  </ul>
                </li>
                <li className="font-medium">
                  <strong>Lấy URL Web App:</strong> Sao chép đường dẫn Web App dạng <code className="bg-slate-100 text-emerald-700 px-1 rounded font-mono text-[11px]">https://script.google.com/macros/s/.../exec</code> để dùng cho SePay hoặc dán vào mục kết nối bên cạnh!
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'connect' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="block font-bold text-slate-800 text-xs">
                  Nhập URL Web App của Google Apps Script (Tùy chọn)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={webAppUrl}
                      onChange={(e) => setWebAppUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                  <button
                    onClick={handleTest}
                    disabled={isTesting || !webAppUrl}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
                  >
                    {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Kiểm tra kết nối</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Lưu ý: Nếu không nhập URL, Dashboard vẫn hoạt động 100% đầy đủ với cơ chế Local Database, tự sinh key và lưu trữ an toàn trong trình duyệt!
                </p>

                {testStatus === 'success' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Kết nối thành công! Google Apps Script đã sẵn sàng phản hồi Webhook.</span>
                  </div>
                )}
                {testStatus === 'failed' && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 flex items-center gap-2 font-medium">
                    <span>Không thể kết nối đến URL này. Hãy đảm bảo bạn đã chọn quyền "Ai có quyền truy cập: Bất kỳ ai" khi triển khai Web App.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
