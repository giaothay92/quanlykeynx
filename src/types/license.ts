export type LicenseStatus = 'Active' | 'Pending' | 'Expired' | 'Revoked';

export type LicensePackage = '1 Tháng' | '6 Tháng' | '1 Năm' | '2 Năm' | '5 Năm' | 'Trọn đời';

export interface OrderItem {
  id: string; // Col A: STT / ID
  issued: boolean; // Col B: Đã cấp ("x" if true)
  licenseKey: string; // Col C: License Key (e.g. "1Y-A3D2-89CF", "2Y-...", "5Y-...")
  activationDate: string | null; // Col D: Ngày kích hoạt
  expirationDate: string | null; // Col E: Ngày hết hạn
  customerName: string; // Col F: Tên khách hàng / Ghi chú
  customerEmail: string; // Email
  customerPhone?: string; // SĐT
  packagePlan: LicensePackage; // Gói bản quyền (1 Tháng, 6 Tháng, 1 Năm, 2 Năm, 5 Năm, Trọn đời)
  price: number; // Giá tiền VND
  status: LicenseStatus; // Col G: Trạng thái (Active, Pending, Expired, Revoked)
  orderCode: string; // Col H: Mã đơn hàng (data[i][7])
  machineId?: string; // Col F: Mã thiết bị (MachineID)
  paymentMethod: 'VietQR / Chuyển khoản' | 'SePay' | 'PayOS' | 'MoMo' | 'Thủ công';
  // Thông tin Cộng tác viên / Đại lý bán key
  collaboratorId?: string;
  collaboratorCode?: string;
  collaboratorName?: string;
  commissionRate?: number; // % chiết khấu cho CTV
  notes?: string;
  createdAt: string;
}

export interface Collaborator {
  id: string;
  code: string; // Ví dụ: "CTV-HUAN", "CTV-NAM", "AGENCY-HN"
  name: string; // Tên Cộng tác viên / Đại lý
  phone: string;
  email: string;
  commissionRate: number; // Phần trăm hoa hồng (ví dụ: 25%)
  totalAssignedKeys: number; // Tổng số key đã giao cho CTV
  activatedKeysCount: number; // Số key đã bán / kích hoạt thành công
  totalRevenue: number; // Tổng doanh số đã bán
  commissionEarned: number; // Hoa hồng CTV được hưởng
  commissionPaid: number; // Hoa hồng đã thanh toán cho CTV
  status: 'active' | 'suspended';
  bankInfo?: string; // STK Ngân hàng nhận hoa hồng
  createdAt: string;
  notes?: string;
}

export interface KeyBatch {
  id: string;
  createdAt: string;
  packagePlan: LicensePackage;
  prefix: string;
  quantity: number;
  collaboratorId?: string;
  collaboratorCode?: string;
  collaboratorName?: string;
  keys: string[];
  notes?: string;
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
