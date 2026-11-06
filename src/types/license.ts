export type LicenseStatus = 'Active' | 'Pending' | 'Expired' | 'Revoked';

export type LicensePackage = '1 Năm' | '6 Tháng' | '1 Tháng' | 'Trọn đời';

export interface OrderItem {
  id: string; // Col A: STT / ID
  issued: boolean; // Col B: Đã cấp ("x" if true)
  licenseKey: string; // Col C: License Key (e.g. "1Y-A3D2-89CF")
  activationDate: string | null; // Col D: Ngày kích hoạt (ISO string or YYYY-MM-DD HH:mm)
  expirationDate: string | null; // Col E: Ngày hết hạn
  customerName: string; // Col F: Tên khách hàng
  customerEmail: string; // Email
  customerPhone?: string; // SĐT
  packagePlan: LicensePackage; // Gói bản quyền
  price: number; // Giá tiền VND
  status: LicenseStatus; // Col G: Trạng thái (Active, Pending, Expired, Revoked)
  orderCode: string; // Col H: Mã đơn hàng (data[i][7])
  machineId?: string; // Col F: Mã thiết bị (MachineID)
  paymentMethod: 'VietQR / Chuyển khoản' | 'SePay' | 'PayOS' | 'MoMo' | 'Thủ công';
  notes?: string;
  createdAt: string;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  orderCode: string;
  status: 'success' | 'failed' | 'ignored';
  message: string;
  generatedKey?: string;
  responsePayload: Record<string, unknown>;
}

export interface GoogleSheetsConfig {
  sheetName: string;
  webAppUrl: string;
  autoSync: boolean;
  lastSyncedAt: string | null;
}
