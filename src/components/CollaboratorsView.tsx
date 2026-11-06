import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  KeyRound, 
  DollarSign, 
  Percent, 
  CheckCircle2, 
  Search, 
  Layers, 
  CreditCard, 
  Edit3, 
  Trash2, 
  ShieldAlert, 
  Phone, 
  Mail, 
  ArrowUpRight,
  TrendingUp,
  X,
  Building
} from 'lucide-react';
import { Collaborator, OrderItem } from '../types/license';
import { formatVND } from '../utils/licenseUtils';

interface CollaboratorsViewProps {
  collaborators: Collaborator[];
  orders: OrderItem[];
  onAddCollaborator: (ctv: Collaborator) => void;
  onUpdateCollaborator: (ctv: Collaborator) => void;
  onDeleteCollaborator: (id: string) => void;
  onOpenBulkKeyForCtv: (ctvId: string) => void;
  onViewCtvOrders: (ctvCode: string) => void;
}

export const CollaboratorsView: React.FC<CollaboratorsViewProps> = ({
  collaborators,
  orders,
  onAddCollaborator,
  onUpdateCollaborator,
  onDeleteCollaborator,
  onOpenBulkKeyForCtv,
  onViewCtvOrders,
}) => {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCtv, setEditingCtv] = useState<Collaborator | null>(null);
  const [payCommissionCtv, setPayCommissionCtv] = useState<Collaborator | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);

  // Form states for new/edit
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [commissionRate, setCommissionRate] = useState(25);
  const [bankInfo, setBankInfo] = useState('');
  const [notes, setNotes] = useState('');

  const openAdd = () => {
    setEditingCtv(null);
    setName('');
    setCode(`CTV-${(collaborators.length + 1).toString().padStart(2, '0')}`);
    setPhone('');
    setEmail('');
    setCommissionRate(25);
    setBankInfo('');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const openEdit = (ctv: Collaborator) => {
    setEditingCtv(ctv);
    setName(ctv.name);
    setCode(ctv.code);
    setPhone(ctv.phone);
    setEmail(ctv.email);
    setCommissionRate(ctv.commissionRate);
    setBankInfo(ctv.bankInfo || '');
    setNotes(ctv.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (editingCtv) {
      onUpdateCollaborator({
        ...editingCtv,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        phone: phone.trim(),
        email: email.trim(),
        commissionRate,
        bankInfo: bankInfo.trim(),
        notes: notes.trim(),
      });
    } else {
      const newCtv: Collaborator = {
        id: `ctv-${Date.now()}`,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        commissionRate,
        totalAssignedKeys: 0,
        activatedKeysCount: 0,
        totalRevenue: 0,
        commissionEarned: 0,
        commissionPaid: 0,
        status: 'active',
        bankInfo: bankInfo.trim(),
        createdAt: new Date().toISOString().slice(0, 10),
        notes: notes.trim(),
      };
      onAddCollaborator(newCtv);
    }
    setIsAddModalOpen(false);
  };

  const handleConfirmPayCommission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payCommissionCtv || payAmount <= 0) return;
    onUpdateCollaborator({
      ...payCommissionCtv,
      commissionPaid: payCommissionCtv.commissionPaid + payAmount,
    });
    setPayCommissionCtv(null);
  };

  // Filtered CTVs
  const filteredCtvs = collaborators.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  // KPI Metrics
  const totalAssigned = collaborators.reduce((acc, c) => acc + c.totalAssignedKeys, 0);
  const totalActivated = collaborators.reduce((acc, c) => acc + c.activatedKeysCount, 0);
  const totalRevenue = collaborators.reduce((acc, c) => acc + c.totalRevenue, 0);
  const totalCommissionEarned = collaborators.reduce((acc, c) => acc + c.commissionEarned, 0);
  const totalCommissionPaid = collaborators.reduce((acc, c) => acc + c.commissionPaid, 0);
  const totalCommissionPending = Math.max(0, totalCommissionEarned - totalCommissionPaid);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Hệ Thống Quản Lý Đại Lý &amp; Cộng Tác Viên (Reseller Hub)</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Quản Lý Phân Phối Key &amp; Chiết Khấu Cộng Tác Viên
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Cấp key theo lô cho từng CTV (1 năm, 2 năm, 5 năm), theo dõi tỷ lệ kích hoạt, tự động tính hoa hồng chiết khấu và quản lý lịch sử thanh toán hoa hồng.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openAdd}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Cộng Tác Viên</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cộng Tác Viên</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{collaborators.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Đang hoạt động: {collaborators.filter(c => c.status === 'active').length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Key Đã Giao CTV</span>
            <KeyRound className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{totalAssigned}</div>
          <div className="text-[11px] text-slate-500 mt-1">Đã kích hoạt: {totalActivated} key ({totalAssigned > 0 ? Math.round((totalActivated / totalAssigned) * 100) : 0}%)</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Doanh Số Qua CTV</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{formatVND(totalRevenue)}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Từ các key kích hoạt thành công</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Hoa Hồng Tích Lũy</span>
            <Percent className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-indigo-700">{formatVND(totalCommissionEarned)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Theo tỷ lệ chiết khấu thỏa thuận</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Cần Thanh Toán</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-600">{formatVND(totalCommissionPending)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Đã chi trả: {formatVND(totalCommissionPaid)}</div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Table Control */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên CTV, mã, SĐT..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="text-xs text-slate-500">
            Hiển thị {filteredCtvs.length} Cộng tác viên
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Cộng Tác Viên / Đại Lý</th>
                <th className="py-3 px-3">Liên Hệ &amp; Ngân Hàng</th>
                <th className="py-3 px-3 text-center">Chiết Khấu</th>
                <th className="py-3 px-4">Key Đã Giao &amp; Kích Hoạt</th>
                <th className="py-3 px-3">Doanh Số (VND)</th>
                <th className="py-3 px-3">Hoa Hồng (VND)</th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCtvs.map((ctv) => {
                const activationPct = ctv.totalAssignedKeys > 0
                  ? Math.round((ctv.activatedKeysCount / ctv.totalAssignedKeys) * 100)
                  : 0;
                const unpaid = Math.max(0, ctv.commissionEarned - ctv.commissionPaid);

                return (
                  <tr key={ctv.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* CTV Name & Code */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-200">
                          {ctv.code.slice(-2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{ctv.name}</p>
                          <p className="font-mono text-[11px] text-indigo-700 font-semibold">{ctv.code}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact & Bank */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5 text-[11px]">
                        <div className="flex items-center gap-1 text-slate-700">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{ctv.phone || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{ctv.email || '—'}</span>
                        </div>
                        {ctv.bankInfo && (
                          <div className="text-[10px] text-slate-500 truncate max-w-[190px]" title={ctv.bankInfo}>
                            STK: {ctv.bankInfo}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Commission % */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {ctv.commissionRate}%
                      </span>
                    </td>

                    {/* Keys Progress */}
                    <td className="py-3 px-4">
                      <div className="w-36 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800">
                            {ctv.activatedKeysCount} / {ctv.totalAssignedKeys} key
                          </span>
                          <span className="text-slate-500">{activationPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all"
                            style={{ width: `${activationPct}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Revenue */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{formatVND(ctv.totalRevenue)}</div>
                    </td>

                    {/* Commission */}
                    <td className="py-3 px-3">
                      <div className="text-[11px] space-y-0.5">
                        <div className="text-slate-500">
                          Tổng: <strong className="text-slate-800">{formatVND(ctv.commissionEarned)}</strong>
                        </div>
                        <div className="text-slate-500">
                          Đã trả: <span>{formatVND(ctv.commissionPaid)}</span>
                        </div>
                        {unpaid > 0 ? (
                          <div className="text-amber-700 font-bold">
                            Chờ trả: {formatVND(unpaid)}
                          </div>
                        ) : (
                          <div className="text-emerald-600 font-medium text-[10px]">Đã thanh toán đủ</div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      {ctv.status === 'active' ? (
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Hoạt động"></span>
                      ) : (
                        <span className="inline-block w-2 h-2 rounded-full bg-slate-300" title="Tạm dừng"></span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenBulkKeyForCtv(ctv.id)}
                          title="Cấp key theo lô cho CTV này"
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded flex items-center gap-1 transition-colors text-[11px]"
                        >
                          <Layers className="w-3 h-3" />
                          <span>+ Cấp key</span>
                        </button>

                        <button
                          onClick={() => {
                            setPayCommissionCtv(ctv);
                            setPayAmount(Math.max(0, ctv.commissionEarned - ctv.commissionPaid));
                          }}
                          title="Thanh toán hoa hồng"
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded flex items-center gap-1 transition-colors text-[11px]"
                        >
                          <CreditCard className="w-3 h-3 text-amber-600" />
                          <span>Chi trả</span>
                        </button>

                        <button
                          onClick={() => openEdit(ctv)}
                          title="Sửa thông tin"
                          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Xóa cộng tác viên ${ctv.name}?`)) {
                              onDeleteCollaborator(ctv.id);
                            }
                          }}
                          title="Xóa CTV"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Collaborator Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingCtv ? 'Chỉnh Sửa Thông Tin CTV' : 'Thêm Cộng Tác Viên Mới'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã CTV *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="VD: CTV-01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tỷ lệ chiết khấu (%) *</label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    required
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Họ và tên CTV / Đại lý *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Nguyễn Văn B"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ctv@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tài khoản ngân hàng nhận hoa hồng</label>
                <input
                  type="text"
                  value={bankInfo}
                  onChange={(e) => setBankInfo(e.target.value)}
                  placeholder="VD: MB Bank: 0988xxxx - Nguyen Van B"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="VD: Phụ trách khu vực miền Bắc..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Commission Modal */}
      {payCommissionCtv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-amber-50/50">
              <h3 className="font-bold text-slate-900 text-sm">
                Xác Nhận Chi Trả Hoa Hồng
              </h3>
              <button onClick={() => setPayCommissionCtv(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayCommission} className="p-5 space-y-3.5 text-xs">
              <div>
                <span className="text-slate-500">Cộng tác viên:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{payCommissionCtv.name} ({payCommissionCtv.code})</p>
                {payCommissionCtv.bankInfo && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 mt-1">
                    STK: {payCommissionCtv.bankInfo}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số tiền chi trả (VND):</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-base focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Đã kiếm được: {formatVND(payCommissionCtv.commissionEarned)} · Đã trả: {formatVND(payCommissionCtv.commissionPaid)}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayCommissionCtv(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Xác Nhận Đã Chuyển Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
