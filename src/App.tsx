import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  RefreshCw, 
  RotateCcw,
  Sparkles,
  Zap,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { OrderItem, WebhookLog, Collaborator, KeyBatch } from './types/license';
import { INITIAL_ORDERS } from './data/mockData';
import { INITIAL_COLLABORATORS } from './data/mockCollaborators';
import { 
  generateLicenseKey, 
  calculateExpirationDate, 
  formatDate 
} from './utils/licenseUtils';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { LicenseTable } from './components/LicenseTable';
import { SheetsView } from './components/SheetsView';
import { WebhookSimulator } from './components/WebhookSimulator';
import { CustomerPortal } from './components/CustomerPortal';
import { AnalyticsView } from './components/AnalyticsView';
import { CollaboratorsView } from './components/CollaboratorsView';
import { BulkKeyModal } from './components/BulkKeyModal';
import { OrderModal } from './components/OrderModal';
import { OrderDetailsModal } from './components/OrderDetailsModal';
import { ScriptCodeModal } from './components/ScriptCodeModal';
import { QuickActivateModal } from './components/QuickActivateModal';

export default function App() {
  // Local storage persistence with original Google Sheet ActiveID dataset (593 records)
  const [orders, setOrders] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem('licensesheet_orders_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 50) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ORDERS;
  });

  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>(() => {
    try {
      const saved = localStorage.getItem('licensesheet_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [webAppUrl, setWebAppUrl] = useState<string>(() => {
    return localStorage.getItem('licensesheet_url') || '';
  });

  // Collaborators / Reseller management state
  const [collaborators, setCollaborators] = useState<Collaborator[]>(() => {
    try {
      const saved = localStorage.getItem('licensesheet_ctv_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_COLLABORATORS;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'orders' | 'sheets' | 'collaborators' | 'webhook' | 'portal' | 'analytics'>('orders');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPackage, setSelectedPackage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isQuickActivateOpen, setIsQuickActivateOpen] = useState(false);
  const [isBulkKeyOpen, setIsBulkKeyOpen] = useState(false);
  const [bulkKeyTargetCtvId, setBulkKeyTargetCtvId] = useState<string>('none');
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<OrderItem | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{
    id: number;
    type: 'success' | 'info' | 'warning';
    title: string;
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'info' | 'warning', title: string, message: string) => {
    const id = Date.now();
    setToast({ id, type, title, message });
    setTimeout(() => {
      setToast((cur) => (cur?.id === id ? null : cur));
    }, 4000);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('licensesheet_orders_v2', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('licensesheet_ctv_v1', JSON.stringify(collaborators));
  }, [collaborators]);

  useEffect(() => {
    localStorage.setItem('licensesheet_logs', JSON.stringify(webhookLogs));
  }, [webhookLogs]);

  useEffect(() => {
    localStorage.setItem('licensesheet_url', webAppUrl);
  }, [webAppUrl]);

  // Activate order by ID (Core logic)
  const handleActivateOrder = (orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    if (target.status === 'Active') {
      showToast('info', 'Đã kích hoạt', `Đơn hàng #${target.orderCode} đã được kích hoạt trước đó.`);
      return;
    }

    const newKey = generateLicenseKey(target.packagePlan);
    const actDate = new Date();
    const expDate = calculateExpirationDate(actDate, target.packagePlan);

    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          issued: true,
          licenseKey: newKey,
          activationDate: actDate.toISOString(),
          expirationDate: expDate.toISOString(),
          status: 'Active' as const,
        };
      }
      return o;
    });

    setOrders(updated);

    // Add log
    const log: WebhookLog = {
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      orderCode: target.orderCode,
      status: 'success',
      message: `Đã cấp key ${newKey} (Hạn 1 năm)`,
      generatedKey: newKey,
      responsePayload: {
        success: true,
        orderCode: target.orderCode,
        key: newKey,
        activationDate: actDate,
        expirationDate: expDate,
      },
    };
    setWebhookLogs((prev) => [log, ...prev.slice(0, 49)]);

    showToast('success', 'Kích hoạt thành công!', `Đơn #${target.orderCode} đã được cấp Key: ${newKey}`);
  };

  // Trigger Webhook by OrderCode (Replicating exact user Google Apps Script logic)
  const handleTriggerWebhook = (orderCode: string, method: 'POST' | 'GET' = 'POST') => {
    const cleanCode = orderCode.trim();
    const match = orders.find(
      (o) => o.orderCode.trim().toUpperCase() === cleanCode.toUpperCase()
    );

    if (!match) {
      const failedLog: WebhookLog = {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString('vi-VN'),
        orderCode: cleanCode,
        status: 'failed',
        message: `Không tìm thấy mã đơn hàng ${cleanCode} trong Cột H`,
        responsePayload: { success: false, message: 'Order not found' },
      };
      setWebhookLogs((prev) => [failedLog, ...prev.slice(0, 49)]);
      return {
        success: false,
        message: `Không tìm thấy mã đơn hàng "${cleanCode}" trong Google Sheet (Cột H).`,
      };
    }

    // Logic: if (data[i][6] !== "Active")
    if (match.status !== 'Active') {
      const newKey = generateLicenseKey(match.packagePlan);
      const actDate = new Date();
      const expDate = calculateExpirationDate(actDate, match.packagePlan);

      const updated = orders.map((o) => {
        if (o.id === match.id) {
          return {
            ...o,
            issued: true,
            licenseKey: newKey,
            activationDate: actDate.toISOString(),
            expirationDate: expDate.toISOString(),
            status: 'Active' as const,
          };
        }
        return o;
      });

      setOrders(updated);

      const successLog: WebhookLog = {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString('vi-VN'),
        orderCode: match.orderCode,
        status: 'success',
        message: `Kích hoạt thành công qua ${method}! Sinh key ${newKey}`,
        generatedKey: newKey,
        responsePayload: {
          success: true,
          orderCode: match.orderCode,
          key: newKey,
          activationDate: actDate,
          expirationDate: expDate,
        },
      };
      setWebhookLogs((prev) => [successLog, ...prev.slice(0, 49)]);

      showToast('success', 'Webhook Kích Hoạt Thành Công!', `Mã đơn #${match.orderCode} -> Key: ${newKey}`);

      return {
        success: true,
        message: `Kích hoạt thành công đơn hàng #${match.orderCode}! Cột B = "x", Cột C = ${newKey}, Cột G = "Active".`,
        key: newKey,
        actDate: actDate.toISOString(),
        expDate: expDate.toISOString(),
        order: { ...match, licenseKey: newKey, status: 'Active' as const },
      };
    } else {
      // Already active
      const infoLog: WebhookLog = {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString('vi-VN'),
        orderCode: match.orderCode,
        status: 'ignored',
        message: `Đơn hàng đã kích hoạt trước đó, trả về key: ${match.licenseKey}`,
        generatedKey: match.licenseKey,
        responsePayload: {
          success: true,
          orderCode: match.orderCode,
          key: match.licenseKey,
          message: 'Already active',
        },
      };
      setWebhookLogs((prev) => [infoLog, ...prev.slice(0, 49)]);

      return {
        success: true,
        message: `Đơn hàng #${match.orderCode} đã ở trạng thái Active từ trước. Key hiện tại: ${match.licenseKey}`,
        key: match.licenseKey,
        expDate: match.expirationDate || undefined,
        order: match,
      };
    }
  };

  // Renew order +1 year
  const handleRenewOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const currentExp = o.expirationDate ? new Date(o.expirationDate) : new Date();
          const newExp = new Date(currentExp);
          newExp.setFullYear(newExp.getFullYear() + 1);
          return {
            ...o,
            expirationDate: newExp.toISOString(),
            status: 'Active',
          };
        }
        return o;
      })
    );
    showToast('success', 'Gia hạn thành công', 'Thời hạn bản quyền đã được cộng thêm 1 năm.');
  };

  // Revoke order
  const handleRevokeOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return { ...o, status: 'Revoked' };
        }
        return o;
      })
    );
    showToast('warning', 'Đã thu hồi key', 'Trạng thái bản quyền đã chuyển sang Revoked.');
  };

  // Delete order
  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa đơn hàng này khỏi bảng tính?')) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast('info', 'Đã xóa đơn hàng', 'Bản ghi đã được gỡ bỏ.');
    }
  };

  // Bulk activate
  const handleBulkActivate = (orderIds: string[]) => {
    orderIds.forEach((id) => handleActivateOrder(id));
  };

  // Bulk delete
  const handleBulkDelete = (orderIds: string[]) => {
    if (confirm(`Bạn có chắc chắn muốn xóa ${orderIds.length} đơn hàng đã chọn?`)) {
      setOrders((prev) => prev.filter((o) => !orderIds.includes(o.id)));
      showToast('info', 'Đã xóa hàng loạt', `Đã xóa ${orderIds.length} đơn hàng.`);
    }
  };

  // Reset to default seed data
  const handleResetData = () => {
    if (confirm('Đặt lại dữ liệu mẫu ban đầu? Các chỉnh sửa hiện tại sẽ được thay thế bằng dữ liệu khởi tạo chuẩn.')) {
      setOrders(INITIAL_ORDERS);
      showToast('info', 'Đã đặt lại', 'Dữ liệu mẫu đã được khôi phục.');
    }
  };

  // Sync test
  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('success', 'Đồng bộ hoàn tất', 'Dữ liệu đã được kiểm tra và lưu trữ đầy đủ.');
    }, 600);
  };

  const handleTestConnection = async (url: string): Promise<boolean> => {
    try {
      // Simulate or ping URL
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return url.includes('script.google.com');
    } catch {
      return false;
    }
  };

  // Bulk Key Generation & Batch Assignment
  const handleSaveBatch = (batch: KeyBatch, addToOrders: boolean) => {
    // If assigned to a CTV, update CTV totalAssignedKeys
    if (batch.collaboratorId) {
      setCollaborators((prev) =>
        prev.map((c) =>
          c.id === batch.collaboratorId
            ? { ...c, totalAssignedKeys: c.totalAssignedKeys + batch.quantity }
            : c
        )
      );
    }

    if (addToOrders) {
      const ctv = collaborators.find((c) => c.id === batch.collaboratorId);
      const pkgPriceMap: Record<string, number> = {
        '1 Tháng': 99000,
        '6 Tháng': 299000,
        '1 Năm': 499000,
        '2 Năm': 899000,
        '5 Năm': 1890000,
        'Trọn đời': 1490000,
      };
      const pricePerKey = pkgPriceMap[batch.packagePlan] || 499000;
      const nowStr = new Date().toISOString();

      const newOrders: OrderItem[] = batch.keys.map((key, idx) => {
        const orderNumber = 100295 + orders.length + idx + 1;
        const code = ctv
          ? `${ctv.code}-${orderNumber}`
          : `BATCH-${orderNumber}`;

        return {
          id: String(orders.length + idx + 1),
          issued: false,
          licenseKey: key,
          activationDate: null,
          expirationDate: null,
          customerName: ctv ? `CTV ${ctv.name}` : `Đơn sỉ Lô #${batch.id.slice(0, 6)}`,
          customerEmail: ctv ? ctv.email : 'sales@licensesheet.vn',
          customerPhone: ctv ? ctv.phone : '',
          packagePlan: batch.packagePlan,
          price: pricePerKey,
          status: 'Pending',
          orderCode: code,
          paymentMethod: 'VietQR / Chuyển khoản',
          notes: `Lô key ${batch.quantity} key [${batch.packagePlan}] sinh lúc ${new Date().toLocaleTimeString('vi-VN')}${ctv ? ` - CTV: ${ctv.name}` : ''}`,
          createdAt: nowStr,
          collaboratorId: ctv?.id,
          collaboratorCode: ctv?.code,
          collaboratorName: ctv?.name,
        };
      });

      setOrders((prev) => [...newOrders, ...prev]);
      showToast(
        'success',
        'Đã sinh và lưu lô key!',
        `Đã tạo ${batch.quantity} key [${batch.packagePlan}] và thêm vào danh sách đơn hàng.`
      );
    } else {
      showToast(
        'success',
        'Đã sinh lô key!',
        `Đã tạo ${batch.quantity} key [${batch.packagePlan}]. Bạn có thể sao chép hoặc tải về file TXT/CSV.`
      );
    }
  };

  const handleAddCollaborator = (created: Collaborator) => {
    setCollaborators((prev) => [created, ...prev]);
    showToast('success', 'Thêm CTV thành công', `Đã thêm cộng tác viên ${created.name} (${created.code})`);
  };

  const handleUpdateCollaborator = (updated: Collaborator) => {
    setCollaborators((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showToast('info', 'Đã cập nhật CTV', `Thông tin của ${updated.name} đã được lưu.`);
  };

  const handleDeleteCollaborator = (id: string) => {
    const target = collaborators.find((c) => c.id === id);
    if (!target) return;
    setCollaborators((prev) => prev.filter((c) => c.id !== id));
    showToast('warning', 'Đã xóa CTV', `Đã xóa cộng tác viên ${target.name}.`);
  };

  const handleAssignKeysForCtv = (ctvId: string) => {
    setBulkKeyTargetCtvId(ctvId);
    setIsBulkKeyOpen(true);
  };

  const handleViewCtvOrders = (ctvCode: string) => {
    setSelectedFilter('all');
    setSelectedPackage('all');
    setSearchQuery(ctvCode);
    setActiveTab('orders');
    showToast('info', 'Lọc đơn CTV', `Đang hiển thị các đơn hàng của CTV ${ctvCode}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`p-4 rounded-xl shadow-lg border flex items-start gap-3 max-w-sm ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toast.type === 'warning'
                ? 'bg-amber-900 text-white border-amber-800'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : toast.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h5 className="font-bold text-xs">{toast.title}</h5>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        orders={orders}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewOrder={() => setIsNewOrderOpen(true)}
        onOpenQuickActivate={() => setIsQuickActivateOpen(true)}
        onOpenBulkKey={() => {
          setBulkKeyTargetCtvId('none');
          setIsBulkKeyOpen(true);
        }}
        onOpenScriptModal={() => setIsScriptModalOpen(true)}
        onSync={handleSync}
        isSyncing={isSyncing}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        collaboratorsCount={collaborators.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* KPI Stat Cards (always visible on primary tabs) */}
        {activeTab !== 'portal' && activeTab !== 'collaborators' && (
          <StatCards
            orders={orders}
            selectedFilter={selectedFilter}
            onSelectFilter={(status) => {
              setSelectedFilter(status);
              if (activeTab !== 'orders') setActiveTab('orders');
            }}
          />
        )}

        {/* Tab 1: Orders Table */}
        {activeTab === 'orders' && (
          <LicenseTable
            orders={orders}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            selectedPackage={selectedPackage}
            setSelectedPackage={setSelectedPackage}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onActivateOrder={handleActivateOrder}
            onRenewOrder={handleRenewOrder}
            onRevokeOrder={handleRevokeOrder}
            onDeleteOrder={handleDeleteOrder}
            onViewDetails={(order) => setSelectedOrderForDetails(order)}
            onBulkActivate={handleBulkActivate}
            onBulkDelete={handleBulkDelete}
          />
        )}

        {/* Tab 2: Google Sheets View (Cols A - H) */}
        {activeTab === 'sheets' && (
          <SheetsView
            orders={orders}
            onActivateOrder={handleActivateOrder}
          />
        )}

        {/* Tab 3: Collaborators / CTV */}
        {activeTab === 'collaborators' && (
          <CollaboratorsView
            collaborators={collaborators}
            orders={orders}
            onAddCollaborator={handleAddCollaborator}
            onUpdateCollaborator={handleUpdateCollaborator}
            onDeleteCollaborator={handleDeleteCollaborator}
            onOpenBulkKeyForCtv={handleAssignKeysForCtv}
            onViewCtvOrders={handleViewCtvOrders}
          />
        )}

        {/* Tab 4: Webhook Simulator */}
        {activeTab === 'webhook' && (
          <WebhookSimulator
            orders={orders}
            onTriggerWebhook={handleTriggerWebhook}
            webhookLogs={webhookLogs}
            onClearLogs={() => setWebhookLogs([])}
          />
        )}

        {/* Tab 4: Customer Portal */}
        {activeTab === 'portal' && (
          <CustomerPortal
            orders={orders}
            onActivateOrder={handleActivateOrder}
          />
        )}

        {/* Tab 5: Analytics */}
        {activeTab === 'analytics' && (
          <AnalyticsView orders={orders} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">LicenseSheet</span>
            <span>·</span>
            <span>Hệ thống Tự Động Cấp Key Bản Quyền Google Sheets</span>
            <span>·</span>
            <span className="text-emerald-700 font-medium">Hỗ trợ SePay, VietQR, PayOS, MoMo</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetData}
              className="hover:text-slate-900 flex items-center gap-1 transition-colors"
              title="Khôi phục dữ liệu mẫu ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục dữ liệu mẫu</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setIsScriptModalOpen(true)}
              className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
            >
              <span>Xem Code Apps Script</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <OrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        onSave={(newOrder) => {
          setOrders((prev) => [newOrder, ...prev]);
          showToast('success', 'Đã tạo đơn hàng', `Đơn #${newOrder.orderCode} đã được lưu.`);
        }}
        existingCount={orders.length}
      />

      <OrderDetailsModal
        order={selectedOrderForDetails}
        isOpen={!!selectedOrderForDetails}
        onClose={() => setSelectedOrderForDetails(null)}
        onActivate={(id) => {
          handleActivateOrder(id);
          setSelectedOrderForDetails((prev) =>
            prev && prev.id === id ? { ...prev, status: 'Active', issued: true } : prev
          );
        }}
        onRenew={(id) => {
          handleRenewOrder(id);
          const o = orders.find((item) => item.id === id);
          if (o) setSelectedOrderForDetails(o);
        }}
        onRevoke={(id) => {
          handleRevokeOrder(id);
          setSelectedOrderForDetails((prev) =>
            prev && prev.id === id ? { ...prev, status: 'Revoked' } : prev
          );
        }}
      />

      <QuickActivateModal
        isOpen={isQuickActivateOpen}
        onClose={() => setIsQuickActivateOpen(false)}
        pendingOrders={orders.filter((o) => o.status === 'Pending')}
        onActivate={(code) => handleTriggerWebhook(code, 'POST')}
      />

      <ScriptCodeModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        webAppUrl={webAppUrl}
        setWebAppUrl={setWebAppUrl}
        onTestConnection={handleTestConnection}
      />

      <BulkKeyModal
        isOpen={isBulkKeyOpen}
        onClose={() => setIsBulkKeyOpen(false)}
        onSaveBatch={handleSaveBatch}
        collaborators={collaborators}
        preselectedCollaboratorId={bulkKeyTargetCtvId}
      />
    </div>
  );
}
