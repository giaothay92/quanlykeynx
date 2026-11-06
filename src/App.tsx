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
import { OrderItem, WebhookLog } from './types/license';
import { INITIAL_ORDERS } from './data/mockData';
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

  // UI state
  const [activeTab, setActiveTab] = useState<'orders' | 'sheets' | 'webhook' | 'portal' | 'analytics'>('orders');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPackage, setSelectedPackage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isQuickActivateOpen, setIsQuickActivateOpen] = useState(false);
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

  const pendingCount = orders.filter((o) => o.status === 'Pending').length;

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
        onOpenScriptModal={() => setIsScriptModalOpen(true)}
        onSync={handleSync}
        isSyncing={isSyncing}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* KPI Stat Cards (always visible on primary tabs) */}
        {activeTab !== 'portal' && (
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

        {/* Tab 3: Webhook Simulator */}
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
    </div>
  );
}
