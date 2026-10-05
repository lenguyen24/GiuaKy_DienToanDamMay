# BÀI THI GIỮA KỲ: ĐIỆN TOÁN ĐÁM MÂY (CLOUD COMPUTING)
## Đề tài: Ứng Dụng Quản Lý Sách (Cloud Book Management)

---

### 👨‍🎓 Thông tin sinh viên
* **Họ và tên**: Lê Hữu Nguyên
* **Mã số sinh viên (MSSV)**: `23IT182`
* **Lớp**: 23IT
* **Database**: `DB_23IT182`
* **Tiền tố mã sản phẩm (3 số cuối MSSV)**: `182`
* **Mức thuế VAT (Số cuối MSSV + 5)%**: $(2 + 5)\% = \mathbf{7\%}$

---

### 🌟 Kiến trúc Hệ thống & Đáp ứng Tiêu chí Đề bài

#### 1. Kiến trúc Bảo mật Cơ sở dữ liệu Cloud (Least Privilege)
* Thiết lập Database trên **MongoDB Atlas**: `DB_23IT182`.
* Tạo 02 tài khoản cơ sở dữ liệu riêng biệt:
  * **User Đọc (`user_read_23IT182`)**: Chỉ cấp role `read` trên database `DB_23IT182`. Dùng độc quyền cho luồng xem danh sách sách (`GET /`).
  * **User Ghi (`user_write_23IT182`)**: Cấp role `readWrite` trên database `DB_23IT182`. Dùng cho luồng thêm mới sách (`POST /books`) và lưu phiên làm việc.

#### 2. Logic Backend & Kiến trúc Stateless
* **Đa luồng kết nối song song**:
  * Sử dụng `mongoose.createConnection()` thiết lập đồng thời `readConnection` và `writeConnection`.
  * Bộ điều hướng tự động tách luồng: Query danh sách đi qua `readConnection`, thêm mới sách đi qua `writeConnection`.
* **Stateless Session (Cloud-native)**:
  * Không lưu Session trong RAM server nhằm hỗ trợ **Auto-scaling** không bị mất phiên làm việc.
  * Tích hợp `connect-mongo` để lưu trữ toàn bộ session trực tiếp xuống MongoDB Atlas Cloud.
* **Thuật toán cá nhân hóa theo MSSV**:
  * **Bộ lọc mã sản phẩm**: Mã sách bắt buộc phải bắt đầu bằng tiền tố `182` (ví dụ `182-BK01`, `182-999`). Nếu nhập sai tiền tố, hệ thống từ chối xử lý và hiển thị thông báo lỗi.
  * **Tính thuế VAT động**: Thuế suất $\text{VAT} = (2 + 5)\% = 7\%$. Hệ thống tự động tính giá sau thuế:
    $$\text{priceWithVAT} = \text{price} \times 1.07$$
    Lưu cả giá gốc và giá sau thuế vào cơ sở dữ liệu cloud.
  * **Template Engine Handlebars**: Giao diện hiển thị danh sách sách, form thêm mới và **Footer bắt buộc**:
    `Họ và tên: Lê Hữu Nguyên | MSSV: 23IT182 | Mức VAT áp dụng: 7%`.

#### 3. Quản lý mã nguồn & Kiểm soát DevOps
* Không commit file `.env` hoặc `node_modules` (được chặn trong `.gitignore`).
* Bóc tách quy trình phát triển trên 02 nhánh tính năng riêng biệt:
  * `feature/database`: Triển khai kết nối đa luồng, Model, Validation `182-xxx`, tính VAT `7%`.
  * `feature/session`: Triển khai lưu trữ Session phân tán trên MongoDB Atlas.
  * Cả hai nhánh đều được gộp về `main` bằng cờ `--no-ff` để lưu lại đầy đủ sơ đồ nút gộp (Merge Node).

#### 4. Triển khai Hệ thống thực tế (PaaS Cloud)
* Mã nguồn lưu trữ tại GitHub: `https://github.com/lenguyen24/GiuaKy_DienToanDamMay.git`
* Triển khai trực tuyến 24/7 trên **Render.com**.
* Cấu hình toàn bộ chuỗi kết nối nhạy cảm qua Environment Variables trên Cloud, không hardcode trong mã nguồn.

---

### 🛠️ Hướng dẫn cài đặt và chạy Local

1. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
2. Tạo file `.env` từ `.env.example` và điền chuỗi kết nối MongoDB Atlas:
   ```env
   PORT=3000
   MONGODB_READ_URI=mongodb+srv://user_read_23IT182:<PASSWORD>@<CLUSTER>.mongodb.net/DB_23IT182?retryWrites=true&w=majority
   MONGODB_WRITE_URI=mongodb+srv://user_write_23IT182:<PASSWORD>@<CLUSTER>.mongodb.net/DB_23IT182?retryWrites=true&w=majority
   SESSION_SECRET=secret_key_session_23IT182
   ```
3. Chạy ứng dụng:
   ```bash
   npm start
   # hoặc chạy chế độ dev:
   npm run dev
   ```
4. Truy cập ứng dụng tại: `http://localhost:3000`
