# 🏍️ Hệ Thống Quản Lý & Bán Xe Máy (MERN Stack)

Dự án Web Bán Xe Máy với đầy đủ chức năng xác thực người dùng (Authentication & Authorization) sử dụng **MERN Stack** (MongoDB, Express.js, React.js, Node.js).

## ✨ Chức Năng Nổi Bật
- **Đăng ký / Đăng nhập** an toàn với mật khẩu được mã hóa (Bcrypt).
- **Phân quyền người dùng** (Khách hàng & Chủ cửa hàng).
- **Xác thực qua Email** khi đăng ký tài khoản (Nodemailer + Gmail SMTP).
- **Quên mật khẩu & Đặt lại mật khẩu** thông qua link gửi qua email.
- **Quản lý Thông tin Cá nhân (Profile)** (Đổi tên, ngày sinh, số điện thoại, avatar, đổi mật khẩu).
- **Giao diện hiện đại/Responsive** xây dựng bằng React Bootstrap và CSS tùy biến.

---

## 🛠️ Yêu Cầu Cài Đặt (Prerequisites)
Trước khi chạy dự án, máy tính của bạn cần cài đặt sẵn:
- **[Node.js](https://nodejs.org/)** (Khuyến nghị phiên bản LTS 18.x trở lên)
- **[MongoDB](https://www.mongodb.com/try/download/community)** (Chạy local ở cổng `27017` hoặc dùng MongoDB Atlas)

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

Dự án được chia thành 2 phần độc lập: **Backend** (Server API) và **Frontend** (Giao diện người dùng).

### 1️⃣ Phần Backend (Chạy trước)

1. Mở Terminal/Command Prompt và di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Mở file `.env` trong thư mục `backend` và phải điền đầy đủ cấu hình Email của bạn (bắt buộc để đăng ký tài khoản):
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/motorcycle_shop
   JWT_SECRET=mot_chuoi_bi_mat_bat_ky_cua_ban
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:3000
   CLIENT_URL=http://localhost:5173

   # Cấu hình Email (Dùng Gmail)
   EMAIL_USER=nhap_email_cua_ban@gmail.com
   EMAIL_PASS=nhap_app_password_vao_day
   ```
   *Lưu ý: `EMAIL_PASS` không phải mật khẩu gốc của bạn. Bạn phải tạo [Mật khẩu ứng dụng (App Password) của Google](https://myaccount.google.com/apppasswords).*

4. Chạy server Backend:
   ```bash
   npm run dev
   ```
   *(Server sẽ chạy tại `http://localhost:5000`)*

---

### 2️⃣ Phần Frontend

1. Mở một cửa sổ Terminal mới và di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt thư viện:
   ```bash
   npm install
   ```
3. Chạy ứng dụng Frontend (Sử dụng Vite):
   ```bash
   npm run dev
   ```
   *(Frontend sẽ tự động mở trên trình duyệt tại `http://localhost:3000`)*
   *(Frontend sẽ tự động mở trên trình duyệt tại `http://localhost:5173`)*

---

## 📂 Cấu Trúc Thư Mục Chính

```text
📦 Project
 ┣ 📂 backend                 # Mã nguồn Server (Node.js/Express)
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 controllers         # Xử lý logic API (Auth, User)
 ┃ ┃ ┣ 📂 middleware          # Bảo vệ Routes (JWT Verify)
 ┃ ┃ ┣ 📂 models              # Lược đồ Cơ sở dữ liệu (MongoDB/Mongoose)
 ┃ ┃ ┣ 📂 routes              # Định tuyến API
 ┃ ┃ ┣ 📂 utils               # Các hàm tiện ích (Gửi Email)
 ┃ ┃ ┗ 📜 server.js           # Điểm khởi chạy Server
 ┃ ┗ 📜 .env                  # Chứa biến môi trường backend
 ┃
 ┗ 📂 frontend                # Mã nguồn Giao diện (React/Vite)
   ┣ 📂 public                # Tài nguyên tĩnh
   ┣ 📂 src
   ┃ ┣ 📂 api                 # Cấu hình Axios & Gọi API Backend
   ┃ ┣ 📂 components          # Các Component tái sử dụng (PrivateRoute)
   ┃ ┣ 📂 pages               # Các trang giao diện (Login, Register...)
   ┃ ┣ 📂 redux               # Quản lý trạng thái toàn cục (Auth Slice)
   ┃ ┣ 📂 styles              # CSS tùy chỉnh (Auth.css, Profile.css)
   ┃ ┣ 📜 App.jsx             # Cấu hình Router (Điều hướng trang)
   ┃ ┗ 📜 index.jsx           # Điểm khởi chạy React
   ┣ 📜 index.html            # File HTML gốc (Template)
   ┗ 📜 vite.config.js        # Cấu hình công cụ build Vite
```

---

## 💡 Xử Lý Lỗi Thường Gặp
**1. Lỗi `Invalid login: 535-5.7.8 Username and Password not accepted` ở Backend:**
- Lý do: Tài khoản Gmail và Mật khẩu ứng dụng (App Password) trong file `.env` không hợp lệ.
- Cách sửa: Làm đúng trình tự tạo App Password của Gmail và dán 16 ký tự viết liền vào dòng `EMAIL_PASS`.

**2. Lỗi CORS hoặc không gọi được API:**
- Hãy đảm bảo bạn đã khởi động cả Backend và Frontend cùng lúc.
- Đảm bảo `CLIENT_URL` trong Backend `.env` khớp với địa chỉ chạy Frontend (thường là `http://localhost:3000`).
- Đảm bảo `CLIENT_URL` trong Backend `.env` khớp với địa chỉ chạy Frontend (thường là `http://localhost:5173`).

---
🌟 **Chúc bạn code vui vẻ!** 🌟
