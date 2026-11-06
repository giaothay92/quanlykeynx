import { OrderItem, LicensePackage } from '../types/license';

/**
 * Sinh key bản quyền theo đúng logic trong Google Apps Script:
 * const randomPart = Utilities.getUuid().toUpperCase().substring(0, 4) + "-" + Utilities.getUuid().toUpperCase().substring(4, 8);
 * const newKey = "1Y-" + randomPart;
 */
export function generateLicenseKey(packagePlan: LicensePackage = '1 Năm'): string {
  const prefixMap: Record<LicensePackage, string> = {
    '1 Năm': '1Y',
    '6 Tháng': '6M',
    '1 Tháng': '1M',
    'Trọn đời': 'LT',
  };
  const prefix = prefixMap[packagePlan] || '1Y';

  // Generate UUID-like hex characters
  const getRandomHex = (len: number) => {
    const chars = '0123456789ABCDEF';
    let result = '';
    for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const part1 = getRandomHex(4);
  const part2 = getRandomHex(4);
  return `${prefix}-${part1}-${part2}`;
}

/**
 * Tính ngày hết hạn dựa theo gói bản quyền
 */
export function calculateExpirationDate(actDate: Date, packagePlan: LicensePackage = '1 Năm'): Date {
  const expDate = new Date(actDate.getTime());
  if (packagePlan === '1 Năm') {
    expDate.setFullYear(actDate.getFullYear() + 1);
  } else if (packagePlan === '6 Tháng') {
    expDate.setMonth(actDate.getMonth() + 6);
  } else if (packagePlan === '1 Tháng') {
    expDate.setMonth(actDate.getMonth() + 1);
  } else if (packagePlan === 'Trọn đời') {
    expDate.setFullYear(actDate.getFullYear() + 99);
  }
  return expDate;
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseDateVN(dateStr?: string | null): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  const str = dateStr.trim();
  // Check if DD/MM/YYYY or DD/MM/YYYY HH:mm:ss
  const vnMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (vnMatch) {
    const day = parseInt(vnMatch[1], 10);
    const month = parseInt(vnMatch[2], 10) - 1;
    const year = parseInt(vnMatch[3], 10);
    const hour = vnMatch[4] ? parseInt(vnMatch[4], 10) : 0;
    const minute = vnMatch[5] ? parseInt(vnMatch[5], 10) : 0;
    const second = vnMatch[6] ? parseInt(vnMatch[6], 10) : 0;
    const d = new Date(year, month, day, hour, minute, second);
    if (!isNaN(d.getTime())) return d;
  }
  const isoDate = new Date(str);
  return isNaN(isoDate.getTime()) ? null : isoDate;
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const d = parseDateVN(dateStr);
  if (!d) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function formatDateOnly(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const d = parseDateVN(dateStr);
  if (!d) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getDaysRemaining(expirationDateStr?: string | null): {
  days: number;
  label: string;
  isExpired: boolean;
  isUrgent: boolean;
} {
  if (!expirationDateStr) {
    return { days: 0, label: 'Chưa kích hoạt', isExpired: false, isUrgent: false };
  }
  const expDate = parseDateVN(expirationDateStr);
  if (!expDate) {
    return { days: 0, label: expirationDateStr, isExpired: false, isUrgent: false };
  }
  const exp = expDate.getTime();
  const now = new Date().getTime();
  const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      days: diffDays,
      label: `Hết hạn ${Math.abs(diffDays)} ngày trước`,
      isExpired: true,
      isUrgent: true,
    };
  }
  if (diffDays === 0) {
    return { days: 0, label: 'Hết hạn hôm nay', isExpired: false, isUrgent: true };
  }
  if (diffDays > 365 * 10) {
    return { days: diffDays, label: 'Vĩnh viễn', isExpired: false, isUrgent: false };
  }
  return {
    days: diffDays,
    label: `Còn ${diffDays} ngày`,
    isExpired: false,
    isUrgent: diffDays <= 30,
  };
}

export function exportOrdersToCSV(orders: OrderItem[]): void {
  const headers = [
    'STT (Col A)',
    'Đã cấp (Col B)',
    'License Key (Col C)',
    'Ngày kích hoạt (Col D)',
    'Ngày hết hạn (Col E)',
    'Khách hàng (Col F)',
    'Trạng thái (Col G)',
    'Mã đơn hàng (Col H)',
    'Email',
    'SĐT',
    'Gói',
    'Giá (VND)',
    'Cổng TT',
  ];

  const rows = orders.map((o) => [
    o.id,
    o.issued ? 'x' : '',
    o.licenseKey || '',
    o.activationDate ? formatDate(o.activationDate) : '',
    o.expirationDate ? formatDate(o.expirationDate) : '',
    `"${(o.customerName || '').replace(/"/g, '""')}"`,
    o.status,
    `"${o.orderCode}"`,
    o.customerEmail,
    o.customerPhone || '',
    o.packagePlan,
    o.price,
    o.paymentMethod,
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `License_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateCustomerMessage(order: OrderItem): string {
  return `Chào ${order.customerName},

Cảm ơn bạn đã thanh toán đơn hàng #${order.orderCode}!
Hệ thống đã tự động cấp mã bản quyền của bạn:

🔑 License Key: ${order.licenseKey || '(Chưa kích hoạt)'}
📦 Gói dịch vụ: ${order.packagePlan}
📅 Ngày kích hoạt: ${formatDateOnly(order.activationDate)}
⏳ Hạn sử dụng: ${formatDateOnly(order.expirationDate)} (${getDaysRemaining(order.expirationDate).label})

👉 Hướng dẫn kích hoạt:
1. Mở phần mềm và vào mục Cài đặt > Bản quyền
2. Nhập mã License Key ở trên và bấm "Kích hoạt"
3. Khởi động lại ứng dụng để sử dụng đầy đủ tính năng.

Hỗ trợ kỹ thuật: 0988.xxx.xxx (Zalo) hoặc phản hồi lại email này.
Chúc bạn một ngày làm việc hiệu quả!`;
}

/**
 * Toàn bộ Google Apps Script code hoàn chỉnh, sẵn sàng copy vào Sheet
 */
export const FULL_APPS_SCRIPT_CODE = `/**
 * ========================================================
 * HỆ THỐNG TỰ ĐỘNG CẤP KEY & KÍCH HOẠT THEO MÃ ĐƠN HÀNG
 * Tương thích: Google Sheets + SePay / VietQR / PayOS / Webhook
 * ========================================================
 */

const SHEET_NAME = "ActiveID"; // Khớp với tên sheet trong bảng tính của bạn

// Webhook nhận POST từ Cổng thanh toán (SePay, PayOS, Webhook của bạn)
function doPost(e) {
  try {
    let orderCode = "";
    
    if (e && e.postData && e.postData.contents) {
      const payload = JSON.parse(e.postData.contents);
      // Hỗ trợ nhiều định dạng webhook phổ biến
      orderCode = payload.orderCode || payload.code || (payload.content ? extractOrderCode(payload.content) : "");
    }
    
    if (!orderCode && e.parameter && e.parameter.orderCode) {
      orderCode = e.parameter.orderCode;
    }
    
    if (!orderCode) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Không tìm thấy orderCode trong request" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return activateOrderByCode(orderCode);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Hỗ trợ kiểm tra hoặc kích hoạt nhanh qua URL GET: .../exec?orderCode=DH-100293
function doGet(e) {
  const orderCode = e.parameter ? e.parameter.orderCode : "";
  const action = e.parameter ? e.parameter.action : "activate";
  
  if (!orderCode) {
    // Trả về danh sách đơn hàng cho Dashboard đồng bộ
    return getSheetDataJSON();
  }
  
  if (action === "check") {
    return checkOrderStatus(orderCode);
  }
  
  return activateOrderByCode(orderCode);
}

// Hàm cốt lõi kích hoạt đơn hàng
function activateOrderByCode(orderCode) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Không tìm thấy Sheet" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][7]).trim().toUpperCase() === String(orderCode).trim().toUpperCase()) { // Cột H là OrderCode (index 7)
      if (String(data[i][6]).trim() !== "Active") { // Cột G là Trạng thái
        // Sinh key bản quyền: 1Y-XXXX-YYYY
        const randomPart = Utilities.getUuid().toUpperCase().substring(0, 4) + "-" + Utilities.getUuid().toUpperCase().substring(4, 8);
        const newKey = "1Y-" + randomPart; 
        
        const actDate = new Date();
        const expDate = new Date();
        expDate.setFullYear(actDate.getFullYear() + 1);

        sheet.getRange(i + 1, 2).setValue("x");        // Cột B: Đã cấp
        sheet.getRange(i + 1, 3).setValue(newKey);     // Cột C: Key
        sheet.getRange(i + 1, 4).setValue(actDate);    // Cột D: Ngày kích hoạt
        sheet.getRange(i + 1, 5).setValue(expDate);    // Cột E: Ngày hết hạn
        sheet.getRange(i + 1, 7).setValue("Active");   // Cột G: Trạng thái
        
        return ContentService.createTextOutput(JSON.stringify({ 
          success: true, 
          message: "Kích hoạt thành công",
          orderCode: orderCode,
          key: newKey,
          activationDate: actDate,
          expirationDate: expDate
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        // Đã active từ trước, trả về key đã có
        return ContentService.createTextOutput(JSON.stringify({ 
          success: true, 
          message: "Đơn hàng đã được kích hoạt trước đó",
          orderCode: orderCode,
          key: data[i][2],
          expirationDate: data[i][4]
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ 
    success: false, 
    message: "Không tìm thấy mã đơn hàng: " + orderCode 
  })).setMimeType(ContentService.MimeType.JSON);
}

// Tra cứu trạng thái đơn hàng
function checkOrderStatus(orderCode) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][7]).trim().toUpperCase() === String(orderCode).trim().toUpperCase()) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        orderCode: orderCode,
        status: data[i][6],
        key: data[i][2],
        activationDate: data[i][3],
        expirationDate: data[i][4],
        customerName: data[i][5]
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Không tìm thấy" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Lấy toàn bộ dữ liệu trả về cho Web App Dashboard
function getSheetDataJSON() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const list = [];
  
  for (let i = 1; i < data.length; i++) {
    list.push({
      id: String(data[i][0] || i),
      issued: String(data[i][1]).toLowerCase() === "x",
      licenseKey: data[i][2],
      activationDate: data[i][3],
      expirationDate: data[i][4],
      customerName: data[i][5],
      status: data[i][6] || "Pending",
      orderCode: String(data[i][7])
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: true, count: list.length, data: list }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Tiện ích trích xuất mã đơn hàng từ nội dung chuyển khoản ngân hàng (nếu dùng SePay/Casso)
function extractOrderCode(content) {
  const match = content.match(/(DH[0-9]{4,8}|ORD[0-9]{4,8}|[A-Z]{2,4}[0-9]{4,8})/i);
  return match ? match[0] : "";
}
`;
