const fs = require('fs');
const path = require('path');

const csvPath = path.resolve('public/assets/aistudio/ActiveID_7e014868');
const content = fs.readFileSync(csvPath, 'utf8');

// Parse lines
const lines = content.split(/\r?\n/);
const records = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line || !line.trim()) continue;

  // Simple CSV line parser
  const cols = [];
  let inQuotes = false;
  let cur = '';

  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      cols.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  cols.push(cur.trim());

  const id = cols[0] || String(i);
  const used = (cols[1] || '').toLowerCase() === 'x';
  const key = (cols[2] || '').trim();
  const activationDate = (cols[3] || '').trim() || null;
  const expirationDate = (cols[4] || '').trim() || null;
  const machineId = (cols[5] || '').trim();
  const statusRaw = (cols[6] || '').trim();
  
  let status = 'Pending';
  if (statusRaw.toUpperCase() === 'ACTIVE' || (used && key)) {
    status = 'Active';
  } else if (statusRaw.toUpperCase() === 'PENDING') {
    status = 'Pending';
  } else if (!key && !used) {
    status = 'Pending';
  } else {
    status = 'Active';
  }

  const rawOrderCode = (cols[7] || '').trim();
  const customerCol = (cols[12] || '').trim();
  
  // If rawOrderCode is text like "khách", "Huấn", "nhung", that is note/customer
  const isNumericCode = /^[0-9]{6,12}$/.test(rawOrderCode);
  const orderCode = isNumericCode 
    ? rawOrderCode 
    : (rawOrderCode && !isNumericCode ? rawOrderCode : `DH-${String(id).padStart(4, '0')}`);

  const customerName = customerCol 
    ? customerCol 
    : (!isNumericCode && rawOrderCode ? rawOrderCode : `Khách hàng #${id}`);

  records.push({
    id: String(id),
    issued: used,
    licenseKey: key,
    activationDate,
    expirationDate,
    machineId,
    status,
    orderCode: rawOrderCode ? rawOrderCode : `ORD-${id}`,
    customerName,
    packagePlan: '1 Năm',
    price: 499000,
    paymentMethod: 'VietQR / Chuyển khoản',
    createdAt: activationDate || '2026-05-06',
  });
}

console.log('Total parsed rows:', records.length);
console.log('Active count:', records.filter(r => r.status === 'Active').length);
console.log('Pending count:', records.filter(r => r.status === 'Pending').length);

fs.writeFileSync(
  path.resolve('src/data/originalSheetData.json'),
  JSON.stringify(records, null, 2)
);
console.log('Saved to src/data/originalSheetData.json');
