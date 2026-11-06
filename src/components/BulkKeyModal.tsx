import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  PlusCircle,
  Database
} from 'lucide-react';
import { LicensePackage, Collaborator, OrderItem, KeyBatch } from '../types/license';
import { generateBulkKeys } from '../utils/licenseUtils';

interface BulkKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborators: Collaborator[];
  onSaveBatch: (batch: KeyBatch, addToOrders: boolean) => void;
  preselectedCollaboratorId?: string;
}

export const BulkKeyModal: React.FC<BulkKeyModalProps> = ({
  isOpen,
  onClose,
  collaborators,
  onSaveBatch,
  preselectedCollaboratorId = 'none',
}) => {
  if (!isOpen) return null;

  const [quantity, setQuantity] = useState<number>(100);
  const [packagePlan, setPackagePlan] = useState<LicensePackage>('1 Năm');
  const [customPrefix, setCustomPrefix] = useState<string>('1Y');
  const [selectedCtvId, setSelectedCtvId] = useState<string>(preselectedCollaboratorId);
  const [addToOrders, setAddToOrders] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Auto-sync prefix when package changes
  const handlePackageChange = (pkg: LicensePackage) => {
    setPackagePlan(pkg);
    const map: Record<LicensePackage, string> = {
      '1 Tháng': '1M',
      '6 Tháng': '6M',
      '1 Năm': '1Y',
      '2 Năm': '2Y',
      '5 Năm': '5Y',
      'Trọn đời': 'LT',
    };
    setCustomPrefix(map[pkg] || '1Y');
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity < 1 || quantity > 1000) return;

    const keys = generateBulkKeys(quantity, packagePlan, customPrefix);
    setGeneratedKeys(keys);
    setIsGenerated(true);

    const ctv = collaborators.find((c) => c.id === selectedCtvId);

    const batch: KeyBatch = {
      id: `batch-${Date.now()}`,
      createdAt: new Date().toISOString(),
      packagePlan,
      prefix: customPrefix,
      quantity,
      collaboratorId: ctv?.id,
      collaboratorCode: ctv?.code,
      collaboratorName: ctv?.name,
      keys,
      notes: notes.trim(),
    };

    onSaveBatch(batch, addToOrders);
  };

  const handleCopyAll = () => {
    if (generatedKeys.length === 0) return;
    navigator.clipboard.writeText(generatedKeys.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadTXT = () => {
    if (generatedKeys.length === 0) return;
    const blob = new Blob([generatedKeys.join('\r\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Keys_${packagePlan.replace(/\s+/g, '_')}_${quantity}keys_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadCSV = () => {
    if (generatedKeys.length === 0) return;
    const headers = ['STT', 'License Key', 'Goi', 'Prefix', 'Cong Tac Vien', 'Ngay Tao'];
    const ctv = collaborators.find((c) => c.id === selectedCtvId);
    const rows = generatedKeys.map((k, i) => [
      i + 1,
      k,
      packagePlan,
      customPrefix,
      ctv ? `"${ctv.name}"` : '"Kho chung"',
      new Date().toLocaleDateString('vi-VN'),
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Batch_${packagePlan.replace(/\s+/g, '_')}_${quantity}keys_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setIsGenerated(false);
    setGeneratedKeys([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Sinh Mã Key Hàng Loạt (Bulk Key Generator)
              </h3>
              <p className="text-[11px] text-slate-500">
                Tạo 100, 200, 500 key theo gói 1 Năm, 2 Năm, 5 Năm &amp; phân bổ cho Cộng tác viên
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {!isGenerated ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Preset Quantities */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Số lượng key cần tạo:
                </label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {[20, 50, 100, 200, 500].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuantity(num)}
                      className={`py-2 rounded-lg font-bold text-xs transition-all ${
                        quantity === num
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {num} key
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">Hoặc nhập số lượng tùy chọn:</span>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-28 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <span className="text-slate-400 text-[11px]">(Tối đa 1.000 key/lần)</span>
                </div>
              </div>

              {/* Package Plan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Chọn gói thời hạn bản quyền:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['1 Năm', '2 Năm', '5 Năm', '6 Tháng', '1 Tháng', 'Trọn đời'] as LicensePackage[]).map((pkg) => (
                    <button
                      key={pkg}
                      type="button"
                      onClick={() => handlePackageChange(pkg)}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        packagePlan === pkg
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{pkg}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        {pkg === '1 Năm' && '1Y-'}
                        {pkg === '2 Năm' && '2Y-'}
                        {pkg === '5 Năm' && '5Y-'}
                        {pkg === '6 Tháng' && '6M-'}
                        {pkg === '1 Tháng' && '1M-'}
                        {pkg === 'Trọn đời' && 'LT-'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prefix & Assign Collaborator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tiền tố Key (Prefix):
                  </label>
                  <input
                    type="text"
                    required
                    value={customPrefix}
                    onChange={(e) => setCustomPrefix(e.target.value)}
                    placeholder="VD: 1Y hoặc 2Y hoặc 5Y..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Định dạng: <code className="font-mono text-slate-700">{customPrefix}-XXXX-YYYY</code>
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Phân bổ cho Cộng tác viên (CTV):</span>
                  </label>
                  <select
                    value={selectedCtvId}
                    onChange={(e) => setSelectedCtvId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="none">-- Kho chung (Chưa gán CTV) --</option>
                    {collaborators.map((ctv) => (
                      <option key={ctv.id} value={ctv.id}>
                        {ctv.name} ({ctv.code} - CK {ctv.commissionRate}%)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Giao số key này cho CTV theo dõi doanh số
                  </p>
                </div>
              </div>

              {/* Add directly to database / sheet checkbox */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="addToOrders"
                  checked={addToOrders}
                  onChange={(e) => setAddToOrders(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="addToOrders" className="cursor-pointer">
                  <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-indigo-600" />
                    Thêm trực tiếp {quantity} key này vào Bảng tính &amp; Kho Quản Lý
                  </span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Tạo sẵn các bản ghi với mã đơn tự động để bạn có thể xem trong Bảng dữ liệu, tra cứu, hoặc cấp phát ngay cho khách hàng.
                  </span>
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ghi chú cho đợt tạo key này:
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="VD: Đợt cấp key khuyến mãi tháng này, đợt giao cho đại lý Hà Nội..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                <span>Bắt đầu sinh {quantity} Key {packagePlan}</span>
              </button>
            </form>
          ) : (
            /* Results View */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">
                      Đã sinh thành công {generatedKeys.length} Key ({packagePlan})!
                    </h4>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Tiền tố: <code className="font-mono font-bold">{customPrefix}-</code>
                      {selectedCtvId !== 'none' && (
                        <span> · Đã phân bổ cho CTV: <strong>{collaborators.find(c => c.id === selectedCtvId)?.name}</strong></span>
                      )}
                      {addToOrders && <span> · Đã cập nhật vào Bảng dữ liệu</span>}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-emerald-700 hover:underline font-medium shrink-0"
                >
                  Tạo đợt khác
                </button>
              </div>

              {/* Export Action Bar */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs text-slate-600 font-semibold">
                  Danh sách {generatedKeys.length} mã License Key:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyAll}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg flex items-center gap-1.5 text-xs transition-colors"
                  >
                    {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAll ? 'Đã chép tất cả' : 'Sao chép toàn bộ'}</span>
                  </button>
                  <button
                    onClick={handleDownloadTXT}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg flex items-center gap-1.5 text-xs transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tải file .TXT</span>
                  </button>
                  <button
                    onClick={handleDownloadCSV}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg flex items-center gap-1.5 text-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Xuất CSV</span>
                  </button>
                </div>
              </div>

              {/* Keys Display Grid */}
              <div className="bg-slate-900 rounded-xl p-4 max-h-[320px] overflow-y-auto border border-slate-800">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] text-emerald-400">
                  {generatedKeys.map((k, idx) => (
                    <div
                      key={k}
                      className="px-2 py-1 bg-slate-950/80 rounded border border-slate-800/80 flex items-center justify-between"
                    >
                      <span className="text-slate-500 text-[10px] w-6">{idx + 1}.</span>
                      <span className="font-semibold">{k}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            {isGenerated ? `Tổng cộng ${generatedKeys.length} key` : 'Hệ thống sinh key ngẫu nhiên theo thuật toán UUID'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors"
          >
            {isGenerated ? 'Hoàn tất & Đóng' : 'Đóng'}
          </button>
        </div>
      </div>
    </div>
  );
};
