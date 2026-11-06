import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Zap, 
  RotateCw,
  Trash2,
  FileText,
  Clock, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Laptop
} from 'lucide-react';
import { OrderItem } from '../types/license';
import { formatDate, formatDateOnly, formatVND, getDaysRemaining } from '../utils/licenseUtils';

interface LicenseTableProps {
  orders: OrderItem[];
  selectedFilter: string;
  setSelectedFilter: (status: string) => void;
  selectedPackage: string;
  setSelectedPackage: (pkg: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onActivateOrder: (orderId: string) => void;
  onRenewOrder: (orderId: string) => void;
  onRevokeOrder: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onViewDetails: (order: OrderItem) => void;
  onBulkActivate: (orderIds: string[]) => void;
  onBulkDelete: (orderIds: string[]) => void;
}

export const LicenseTable: React.FC<LicenseTableProps> = ({
  orders,
  selectedFilter,
  setSelectedFilter,
  selectedPackage,
  setSelectedPackage,
  searchQuery,
  setSearchQuery,
  onActivateOrder,
  onRenewOrder,
  onRevokeOrder,
  onDeleteOrder,
  onViewDetails,
  onBulkActivate,
  onBulkDelete,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    if (selectedFilter === 'Active' && order.status !== 'Active') return false;
    if (selectedFilter === 'Pending' && order.status !== 'Pending') return false;
    if (selectedFilter === 'Expired' && order.status !== 'Expired') return false;
    if (selectedFilter === 'Revoked' && order.status !== 'Revoked') return false;
    if (selectedFilter === 'expiring') {
      if (order.status !== 'Active' || !order.expirationDate) return false;
      const { days, isExpired } = getDaysRemaining(order.expirationDate);
      if (isExpired || days > 30) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = order.id.includes(q);
      const matchOrderCode = order.orderCode.toLowerCase().includes(q);
      const matchKey = order.licenseKey.toLowerCase().includes(q);
      const matchMachine = (order.machineId || '').toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      return matchId || matchOrderCode || matchKey || matchMachine || matchName;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const displayedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(displayedOrders.map((o) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const pendingSelected = selectedIds.filter((id) => {
    const o = orders.find((item) => item.id === id);
    return o && o.status === 'Pending';
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Table Control Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        {/* Filter Segmented Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => { setSelectedFilter('all'); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({orders.length})
            </button>
            <button
              onClick={() => { setSelectedFilter('Active'); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedFilter === 'Active'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({orders.filter((o) => o.status === 'Active').length})
            </button>
            <button
              onClick={() => { setSelectedFilter('Pending'); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedFilter === 'Pending'
                  ? 'bg-white text-amber-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({orders.filter((o) => o.status === 'Pending').length})
            </button>
            <button
              onClick={() => { setSelectedFilter('expiring'); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedFilter === 'expiring'
                  ? 'bg-white text-rose-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sắp hết hạn
            </button>
          </div>
        </div>

        {/* Total found info & Rows per page */}
        <div className="text-xs text-slate-500 flex items-center gap-3">
          <span>
            Hiển thị {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredOrders.length)} / {filteredOrders.length} dòng
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="py-1 px-2 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700"
          >
            <option value={25}>25 dòng/trang</option>
            <option value={50}>50 dòng/trang</option>
            <option value={100}>100 dòng/trang</option>
            <option value={600}>Toàn bộ 593 dòng</option>
          </select>
        </div>
      </div>

      {/* Bulk action toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs transition-all">
          <div className="flex items-center gap-3">
            <span className="font-medium">Đã chọn {selectedIds.length} dòng</span>
            <span className="text-slate-500">|</span>
            {pendingSelected.length > 0 && (
              <span className="text-amber-400 font-medium">
                {pendingSelected.length} đơn Pending có thể kích hoạt
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {pendingSelected.length > 0 && (
              <button
                onClick={() => {
                  onBulkActivate(pendingSelected);
                  setSelectedIds([]);
                }}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium flex items-center gap-1 transition-colors"
              >
                <Zap className="w-3 h-3" />
                <span>Kích hoạt {pendingSelected.length} đơn</span>
              </button>
            )}
            <button
              onClick={() => {
                onBulkDelete(selectedIds);
                setSelectedIds([]);
              }}
              className="px-3 py-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded font-medium flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Xóa</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2 py-1 text-slate-400 hover:text-white"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={
                    displayedOrders.length > 0 &&
                    selectedIds.length === displayedOrders.length
                  }
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              <th className="py-3 px-3">STT / Col H: Mã Đơn Hàng</th>
              <th className="py-3 px-3">Col C: KEY</th>
              <th className="py-3 px-2 text-center">Col B: Used</th>
              <th className="py-3 px-3">Col F: MachineID (Mã thiết bị)</th>
              <th className="py-3 px-3">Col D &amp; E: Ngày kích hoạt / Hết hạn</th>
              <th className="py-3 px-3">Col G: Status</th>
              <th className="py-3 px-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {displayedOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <Clock className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">Không tìm thấy bản ghi nào</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Thử tìm từ khóa khác hoặc đặt lại bộ lọc
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              displayedOrders.map((order) => {
                const isRevealed = revealedKeys[order.id];

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      selectedIds.includes(order.id) ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(order.id)}
                        onChange={() => handleSelectOne(order.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>

                    {/* STT & Order Code (Column H) */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-400 w-8">
                          #{order.id}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="font-mono font-bold text-slate-900 hover:text-emerald-600 cursor-pointer text-xs"
                              onClick={() => onViewDetails(order)}
                            >
                              {order.orderCode}
                            </span>
                            <button
                              onClick={() => handleCopy(order.orderCode, `order-${order.id}`)}
                              title="Sao chép mã đơn"
                              className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                            >
                              {copiedKey === `order-${order.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          {order.customerName && order.customerName !== `Khách hàng #${order.id}` && (
                            <div className="text-[11px] font-medium text-slate-600 mt-0.5">
                              {order.customerName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* License Key (Column C) */}
                    <td className="py-3 px-3">
                      {order.licenseKey ? (
                        <div className="flex items-center gap-1.5">
                          <div className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                            {isRevealed
                              ? order.licenseKey
                              : `${order.licenseKey.slice(0, 3)}••••-••••`}
                          </div>
                          <button
                            onClick={() => toggleReveal(order.id)}
                            title={isRevealed ? 'Ẩn key' : 'Hiện key'}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                          >
                            {isRevealed ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopy(order.licenseKey, `key-${order.id}`)}
                            title="Sao chép License Key"
                            className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                          >
                            {copiedKey === `key-${order.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onActivateOrder(order.id)}
                          className="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded flex items-center gap-1 transition-colors"
                        >
                          <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
                          <span>+ Cấp key</span>
                        </button>
                      )}
                    </td>

                    {/* Column B: "x" (Used) */}
                    <td className="py-3 px-2 text-center">
                      {order.issued ? (
                        <span
                          title="Cột B = 'x' (Đã cấp)"
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs"
                        >
                          x
                        </span>
                      ) : (
                        <span
                          title="Cột B trống"
                          className="inline-block w-3 h-0.5 bg-slate-300 rounded"
                        ></span>
                      )}
                    </td>

                    {/* Column F: MachineID */}
                    <td className="py-3 px-3">
                      {order.machineId ? (
                        <div className="flex items-center gap-1.5">
                          <Laptop className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span
                            className="font-mono text-[11px] text-slate-600 truncate max-w-[170px]"
                            title={order.machineId}
                          >
                            {order.machineId}
                          </span>
                          <button
                            onClick={() => handleCopy(order.machineId!, `mach-${order.id}`)}
                            title="Sao chép MachineID"
                            className="text-slate-400 hover:text-slate-700 p-0.5"
                          >
                            {copiedKey === `mach-${order.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-[11px] italic">—</span>
                      )}
                    </td>

                    {/* Column D & E: Dates */}
                    <td className="py-3 px-3">
                      {order.activationDate ? (
                        <div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-700">
                            <span className="text-slate-400">Kích hoạt:</span>
                            <span className="font-medium">{order.activationDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                            <span className="text-slate-400">Hết hạn:</span>
                            <span className="font-medium text-slate-800">
                              {order.expirationDate}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Chưa kích hoạt</span>
                      )}
                    </td>

                    {/* Column G: Status */}
                    <td className="py-3 px-3">
                      {order.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          PENDING
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {order.status === 'Pending' ? (
                          <button
                            onClick={() => onActivateOrder(order.id)}
                            title="Kích hoạt đơn hàng"
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Kích hoạt</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onRenewOrder(order.id)}
                            title="Gia hạn +1 năm"
                            className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => onViewDetails(order)}
                          title="Xem chi tiết"
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          <span>Tổng số bản ghi: </span>
          <strong className="font-semibold text-slate-800">{filteredOrders.length}</strong>
          <span> · Trang {page} / {totalPages || 1}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-white border border-slate-200 rounded font-medium disabled:opacity-40 hover:bg-slate-50 flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Trang trước</span>
          </button>
          <span className="font-semibold text-slate-700 px-1">
            {page} / {totalPages || 1}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1 bg-white border border-slate-200 rounded font-medium disabled:opacity-40 hover:bg-slate-50 flex items-center gap-1"
          >
            <span>Trang sau</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
