import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  HelpCircle, 
  Zap, 
  Copy, 
  Check, 
  Code,
  Info,
  Laptop,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import { OrderItem } from '../types/license';
import { formatDate, formatDateOnly } from '../utils/licenseUtils';

interface SheetsViewProps {
  orders: OrderItem[];
  onActivateOrder: (orderId: string) => void;
}

export const SheetsView: React.FC<SheetsViewProps> = ({
  orders,
  onActivateOrder,
}) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number; val: string } | null>({
    row: 2,
    col: 3,
    val: orders[0]?.licenseKey || '',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sheetSearch, setSheetSearch] = useState('');

  const colHeaders = [
    { letter: 'A', name: 'STT', codeIndex: 'data[i][0]' },
    { letter: 'B', name: 'Used', codeIndex: 'sheet.getRange(i+1, 2).setValue("x")' },
    { letter: 'C', name: 'KEY', codeIndex: 'sheet.getRange(i+1, 3).setValue(newKey)' },
    { letter: 'D', name: 'ActivationDate', codeIndex: 'sheet.getRange(i+1, 4).setValue(actDate)' },
    { letter: 'E', name: 'ExpirationDate', codeIndex: 'sheet.getRange(i+1, 5).setValue(expDate)' },
    { letter: 'F', name: 'MachineID', codeIndex: 'data[i][5]' },
    { letter: 'G', name: 'Status', codeIndex: 'sheet.getRange(i+1, 7).setValue("Active")' },
    { letter: 'H', name: 'OrderCode', codeIndex: 'data[i][7] === String(orderCode)' },
  ];

  const colLetterFromIndex = (index: number) => {
    return String.fromCharCode(65 + index);
  };

  const filteredOrders = orders.filter((o) => {
    if (!sheetSearch.trim()) return true;
    const q = sheetSearch.toLowerCase().trim();
    return (
      o.id.includes(q) ||
      o.licenseKey.toLowerCase().includes(q) ||
      o.orderCode.toLowerCase().includes(q) ||
      (o.machineId || '').toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const displayedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      {/* Explanation Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-emerald-900">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-950">
              Dữ liệu gốc Google Sheet ActiveID ({orders.length} dòng dữ liệu thực tế):
            </p>
            <p className="text-emerald-800 mt-0.5">
              Cột A: STT · Cột B: Used ("x") · Cột C: KEY · Cột D: ActivationDate · Cột E: ExpirationDate · Cột F: MachineID (Mã máy) · Cột G: Status (Active/PENDING) · Cột H: OrderCode (Mã đơn hàng webhook).
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="font-mono bg-white px-2.5 py-1 rounded border border-emerald-300 text-emerald-800 font-bold">
            Sheet: ActiveID ({orders.filter(o => o.status === 'Active').length} Active · {orders.filter(o => o.status === 'Pending').length} Pending)
          </span>
        </div>
      </div>

      {/* Spreadsheet Container */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-xs overflow-hidden">
        {/* Google Sheet Toolbar Mock */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>ActiveID - Google Sheets</span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-slate-500 text-[11px]">
              <span className="hover:text-slate-900 cursor-pointer">Tệp</span>
              <span className="hover:text-slate-900 cursor-pointer">Chỉnh sửa</span>
              <span className="hover:text-slate-900 cursor-pointer">Xem</span>
              <span className="hover:text-slate-900 cursor-pointer">Chèn</span>
              <span className="hover:text-slate-900 font-semibold text-emerald-700 cursor-pointer">Tiện ích mở rộng (Apps Script)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={sheetSearch}
                onChange={(e) => {
                  setSheetSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Lọc ô theo mã đơn, key, machineId..."
                className="pl-8 pr-2 py-1 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48 sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Formula Bar */}
        <div className="bg-white border-b border-slate-200 px-3 py-1.5 flex items-center gap-2 text-xs">
          <div className="w-16 px-2 py-0.5 font-mono text-center font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded">
            {selectedCell ? `${colLetterFromIndex(selectedCell.col - 1)}${selectedCell.row}` : 'A1'}
          </div>
          <div className="text-slate-400 font-serif italic text-sm">fx</div>
          <div className="flex-1 font-mono text-slate-800 text-xs truncate px-2 py-0.5 bg-slate-50/50 rounded border border-transparent hover:border-slate-200">
            {selectedCell ? selectedCell.val : ''}
          </div>
          {selectedCell && (
            <div className="hidden md:flex items-center text-[11px] text-slate-500 gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <Code className="w-3 h-3 text-emerald-600" />
              <span>Apps Script: sheet.getRange({selectedCell.row}, {selectedCell.col})</span>
            </div>
          )}
        </div>

        {/* Spreadsheet Grid */}
        <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
          <table className="w-full border-collapse font-sans text-xs">
            <thead>
              {/* Column Letters Bar */}
              <tr className="bg-slate-100 text-slate-600 text-center font-mono text-[11px]">
                <th className="w-12 py-1.5 px-2 border-r border-b border-slate-300 bg-slate-200 text-slate-500"></th>
                {colHeaders.map((col) => (
                  <th
                    key={col.letter}
                    className={`py-1.5 px-3 border-r border-b border-slate-300 font-bold transition-colors ${
                      col.letter === 'H'
                        ? 'bg-amber-100/60 text-amber-900 border-amber-300'
                        : col.letter === 'C'
                        ? 'bg-emerald-100/60 text-emerald-900 border-emerald-300'
                        : col.letter === 'F'
                        ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                        : ''
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs">{col.letter}</span>
                      <span className="text-[10px] font-sans font-normal text-slate-500 whitespace-nowrap">
                        {col.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>

              {/* Row 1: Header Row */}
              <tr className="bg-slate-50 font-semibold text-slate-800 border-b-2 border-slate-300">
                <td className="py-2 px-2 text-center font-mono text-[11px] bg-slate-200 border-r border-slate-300 text-slate-600">
                  1
                </td>
                <td className="py-2 px-3 border-r border-slate-200">STT</td>
                <td className="py-2 px-3 border-r border-slate-200 text-center">Used</td>
                <td className="py-2 px-3 border-r border-slate-200">KEY</td>
                <td className="py-2 px-3 border-r border-slate-200">ActivationDate</td>
                <td className="py-2 px-3 border-r border-slate-200">ExpirationDate</td>
                <td className="py-2 px-3 border-r border-slate-200">MachineID</td>
                <td className="py-2 px-3 border-r border-slate-200">Status</td>
                <td className="py-2 px-3 border-r border-slate-200 font-bold text-amber-800 bg-amber-50">
                  OrderCode
                </td>
              </tr>
            </thead>
            <tbody>
              {displayedOrders.map((order, index) => {
                const rowNum = Number(order.id) + 1; // Row in original spreadsheet
                const isSelectedRow = selectedCell?.row === rowNum;

                return (
                  <tr
                    key={order.id}
                    className={`border-b border-slate-200 hover:bg-emerald-50/20 transition-colors ${
                      isSelectedRow ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    {/* Row Number */}
                    <td className="py-2 px-2 text-center font-mono text-[11px] bg-slate-100 border-r border-slate-300 text-slate-500 font-medium select-none">
                      {rowNum}
                    </td>

                    {/* Col A (1): ID */}
                    <td
                      onClick={() =>
                        setSelectedCell({ row: rowNum, col: 1, val: order.id })
                      }
                      className={`py-2 px-3 border-r border-slate-200 font-mono text-slate-600 cursor-cell ${
                        selectedCell?.row === rowNum && selectedCell?.col === 1
                          ? 'ring-2 ring-emerald-500 ring-inset bg-white'
                          : ''
                      }`}
                    >
                      {order.id}
                    </td>

                    {/* Col B (2): Used "x" */}
                    <td
                      onClick={() =>
                        setSelectedCell({
                          row: rowNum,
                          col: 2,
                          val: order.issued ? 'x' : '',
                        })
                      }
                      className={`py-2 px-3 border-r border-slate-200 text-center font-bold font-mono cursor-cell ${
                        selectedCell?.row === rowNum && selectedCell?.col === 2
                          ? 'ring-2 ring-emerald-500 ring-inset bg-white'
                          : ''
                      } ${order.issued ? 'text-emerald-700 bg-emerald-50/50' : 'text-slate-300'}`}
                    >
                      {order.issued ? 'x' : ''}
                    </td>

                    {/* Col C (3): KEY */}
                    <td
                      onClick={() =>
                        setSelectedCell({
                          row: rowNum,
                          col: 3,
                          val: order.licenseKey || '',
                        })
                      }
                      className={`py-2 px-3 border-r border-slate-200 font-mono cursor-cell ${
                        selectedCell?.row === rowNum && selectedCell?.col === 3
                          ? 'ring-2 ring-emerald-500 ring-inset bg-white'
                          : ''
                      } ${order.licenseKey ? 'text-slate-900 font-semibold' : 'text-slate-400 italic'}`}
                    >
                      {order.licenseKey || ''}
                    </td>

                    {/* Col D (4): ActivationDate */}
                    <td
                      onClick={() =>
                        setSelectedCell({
                          row: rowNum,
                          col: 4,
                          val: order.activationDate || '',
                        })
                      }
                      className={`py-2 px-3 border-r border-slate-200 cursor-cell text-slate-700 ${
                        selectedCell?.row === rowNum && selectedCell?.col === 4
                          ? 'ring-2 ring-emerald-500 ring-inset bg-white'
                          : ''
                      }`}
                    >
                      {order.activationDate || ''}
                    </td>

                    {/* Col E (5): ExpirationDate */}
                    <td
                      onClick={() =>
                        setSelectedCell({
                          row: rowNum,
                          col: 5,
                          val: order.expirationDate || '',
                        })
                      }
                      className={`py-2 px-3 border-r border-slate-200 cursor-cell text-slate-700 ${
                        selectedCell?.row === rowNum && selectedCell?.col === 5
                          ? 'ring-2 ring-emerald-500 ring-inset bg-white'
                          : ''
                      }`}
                    >
                      {order.expirationDate || ''}
                    </td>

                    {/* Col F (6): MachineID */}
                    <td
                      onClick={() =>
                        setSelectedCell({
                          row: rowNum,
                          col: 6,
                          val: order.machineId || '',
                        })
                      }
                      className={`py-2 px-3 border-r border-slate-200 font-mono text-[11px] cursor-cell text-slate-600 ${
                        selectedCell?.row === rowNum && selectedCell?.col === 6
                          ? 'ring-2 ring-emerald-500 ring-inset bg-white'
                          : ''
                      }`}
                    >
                      {order.machineId ? (
                        <span title={order.machineId}>{order.machineId}</span>
                      ) : (
                        <span className="text-slate-300 italic">—</span>
                      )}
                    </td>

                    {/* Col G (7): Status */}
                    <td
                      onClick={() =>
                        setSelectedCell({
                          row: rowNum,
                          col: 7,
                          val: order.status === 'Active' ? 'Active' : 'PENDING',
                        })
                      }
                      className={`py-2 px-3 border-r border-slate-200 font-semibold cursor-cell ${
                        selectedCell?.row === rowNum && selectedCell?.col === 7
                          ? 'ring-2 ring-emerald-500 ring-inset bg-white'
                          : ''
                      } ${
                        order.status === 'Active'
                          ? 'text-emerald-700 bg-emerald-50/40'
                          : 'text-amber-700 bg-amber-50/40'
                      }`}
                    >
                      {order.status === 'Active' ? 'Active' : 'PENDING'}
                    </td>

                    {/* Col H (8): OrderCode */}
                    <td
                      onClick={() =>
                        setSelectedCell({
                          row: rowNum,
                          col: 8,
                          val: order.orderCode,
                        })
                      }
                      className={`py-2 px-3 border-r border-slate-200 font-mono font-bold cursor-cell ${
                        selectedCell?.row === rowNum && selectedCell?.col === 8
                          ? 'ring-2 ring-emerald-500 ring-inset bg-white'
                          : ''
                      } text-slate-900 bg-amber-50/20`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{order.orderCode}</span>
                        {order.status === 'Pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onActivateOrder(order.id);
                            }}
                            className="px-2 py-0.5 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs ml-2"
                          >
                            Kích hoạt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sheet Pagination & Tabs Bar */}
        <div className="bg-slate-100 border-t border-slate-300 px-3 py-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-white px-3 py-1 font-semibold text-emerald-800 border-t-2 border-emerald-600 border-x border-slate-300 shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>ActiveID ({orders.length} dòng)</span>
            </div>
            <span className="text-slate-400 text-[11px]">
              Hiển thị {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredOrders.length)} của {filteredOrders.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="py-1 px-2 text-xs bg-white border border-slate-300 rounded text-slate-700"
            >
              <option value={25}>25 dòng/trang</option>
              <option value={50}>50 dòng/trang</option>
              <option value={100}>100 dòng/trang</option>
              <option value={600}>Tất cả ({orders.length})</option>
            </select>

            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded bg-white border border-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">
              Trang {page} / {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded bg-white border border-slate-300 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
