import { OrderItem } from '../types/license';
import sheetRecords from './originalSheetData.json';

// Dữ liệu gốc 100% từ file Google Sheet ActiveID do người dùng cung cấp (593 dòng dữ liệu thực tế)
export const INITIAL_ORDERS: OrderItem[] = (sheetRecords as unknown as OrderItem[]).map((row) => ({
  id: String(row.id),
  issued: Boolean(row.issued),
  licenseKey: row.licenseKey || '',
  activationDate: row.activationDate || null,
  expirationDate: row.expirationDate || null,
  customerName: row.customerName || `Khách #${row.id}`,
  customerEmail: `${(row.orderCode || row.id).toLowerCase().replace(/[^a-z0-9]/g, '')}@activeid.vn`,
  customerPhone: row.notes || '',
  packagePlan: (row.packagePlan as OrderItem['packagePlan']) || '1 Năm',
  price: row.price || 499000,
  status: (row.status as OrderItem['status']) || (row.issued ? 'Active' : 'Pending'),
  orderCode: String(row.orderCode || row.id),
  machineId: row.machineId || '',
  paymentMethod: 'VietQR / Chuyển khoản',
  notes: row.notes || (row.machineId ? `Thiết bị: ${row.machineId.slice(0, 8)}...` : ''),
  createdAt: row.createdAt || '2026-05-06',
}));
