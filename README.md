# LicenseSheet - Dashboard Quản Lý Key Bản Quyền & Kích Hoạt Đơn Hàng

Hệ thống Dashboard quản lý 593+ bản ghi bản quyền phần mềm, tích hợp Google Sheets (Sheet: `ActiveID`), lưu trữ MachineID, tự động sinh License Key `1Y-XXXX-YYYY` và kích hoạt theo mã đơn hàng qua Webhook (SePay, VietQR, PayOS).

---

## 🚀 Hướng dẫn Triển khai lên Vercel (Deploy to Vercel)

Dự án đã được cấu hình sẵn file `vercel.json` tối ưu cho Vite Single Page Application (SPA), sẵn sàng deploy trong 1 phút!

### Cách 1: Triển khai qua GitHub (Khuyên dùng - Tự động cập nhật khi push code)

1. **Khởi tạo Git và đẩy lên GitHub của bạn**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit LicenseSheet"
   git branch -M main
   git remote add origin https://github.com/TÊN_GITHUB_CỦA_BẠN/TÊN_REPO.git
   git push -u origin main
   ```

2. **Kết nối với Vercel**:
   - Truy cập [vercel.com](https://vercel.com) và đăng nhập.
   - Bấm **Add New...** > **Project**.
   - Chọn kho lưu trữ GitHub vừa đẩy lên và bấm **Import**.
   - Cấu hình Build (Vercel tự động nhận diện từ `vercel.json`):
     - **Framework Preset**: `Vite`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Bấm **Deploy**. Sau ~30 giây, ứng dụng sẽ online với tên miền dạng `https://ten-du-an.vercel.app`!

---

### Cách 2: Triển khai trực tiếp bằng Vercel CLI (Không cần GitHub)

Mở terminal trong thư mục dự án và chạy:

```bash
# 1. Cài đặt và chạy Vercel CLI
npx vercel

# 2. Làm theo hướng dẫn trên màn hình:
# - Set up and deploy? [Y]
# - Which scope? (Chọn tài khoản của bạn)
# - Link to existing project? [N]
# - What's your project's name? (Đặt tên dự án)
# - In which directory is your code located? [./]
#
# 3. Để triển khai bản Production:
npx vercel --prod
```

---

## 🛠️ Cấu trúc công nghệ & Cấu hình

- **Frontend**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 + Lucide Icons + Motion
- **Dữ liệu**: Nạp trực tiếp 593 dòng dữ liệu gốc từ sheet `ActiveID` với đầy đủ `MachineID`, `Used`, `KEY`, `ActivationDate`, `ExpirationDate`, `Status`, `OrderCode`.
- **Cấu hình Vercel (`vercel.json`)**:
  ```json
  {
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "framework": "vite",
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```
