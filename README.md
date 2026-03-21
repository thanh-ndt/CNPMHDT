# Honda Store - MERN Stack Project

Dự án website quản lý và hiển thị danh sách sản phẩm xe máy Honda, tính năng So sánh xe, Yêu thích, và lọc tìm kiếm nâng cao theo chuẩn ReactJS (MERN Stack).

---

## 🛠️ Yêu cầu hệ thống (Prerequisites)
1. **Node.js** (Khuyến nghị phiên bản 16.x hoặc 18.x trở lên)
2. **MongoDB** (Cần cài đặt MongoDB Compass hoặc MongoDB Server chạy cục bộ)
3. **Git** (để quản lý phiên bản)

---

## 🚀 Hướng dẫn chạy dự án (Run locally)

Dự án được chia làm 2 phần độc lập: `backend` và `frontend`. Bạn cần mở **2 cửa sổ Terminal (hoặc CMD)** để chạy song song.

### Bước 1: Khởi động Backend (API Server)
Mở cửa sổ Terminal thứ nhất và chạy các lệnh sau:

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt các thư viện cần thiết (chỉ cần chạy lần đầu tiên)
npm install

# Nạp dữ liệu xe máy mẫu (Seed data) vào MongoDB
node src/utils/seed.js

# Khởi chạy server Backend
npm start
```
*Lưu ý: Backend sẽ chạy trên cổng `http://localhost:5000` và tự động kết nối với cơ sở dữ liệu MongoDB.*

---

### Bước 2: Khởi động Frontend (React App)
Mở cửa sổ Terminal thứ hai và chạy các lệnh sau:

```bash
# Từ thư mục gốc, di chuyển vào thư mục frontend
cd frontend

# Cài đặt các thư viện bên phía người dùng (chỉ cần chạy lần đầu tiên)
npm install

# Khởi chạy ứng dụng React
npm start
```
*Lưu ý: Ứng dụng Frontend sẽ tự động mở lên trong trình duyệt tại địa chỉ `http://localhost:3000`.*

---

## 🌟 Các tính năng chính (Features)
- Hiển thị danh sách xe máy với thiết kế giao diện màu đỏ Honda đặc trưng.
- Nút "Yêu thích" thả tim thả đổi style và lưu số lượng ngay lập tức (Real-time).
- Chức năng So Sánh chi tiết từng thông số (Động cơ, Công nghệ, Thông số thiết kế) tối đa 3 xe cùng lúc.
- Bộ lọc tìm kiếm kết hợp nhiều điều kiện (Loại xe, Mức giá, Phân khối).
- Responsive: Tương thích với các loại màn hình (Desktop, Tablet, Mobile).

---

## 📁 Cấu trúc thư mục cơ bản
```
Project/
├── backend/                  # Nơi chứa Node.js, Express, MongoDB Schema
│   ├── data/                 # Chứa file JSON dữ liệu thô (vehicles_data.json)
│   ├── src/
│   │   ├── controllers/      # Chứa API Logic (hàm thêm/sửa/xóa, favorite...)
│   │   ├── models/           # Định nghĩa cấu trúc Data MongoDB
│   │   ├── routes/           # Định tuyến API (/api/vehicles...)
│   │   └── utils/            # Script nạp dữ liệu (seed.js)
│   └── package.json
│
└── frontend/                 # Giao diện lập trình bằng React.js
    ├── public/
    │   └── images/           # Chứa 32+ ảnh thực tế của xe máy Honda
    ├── src/
    │   ├── components/       # Các module giao diện (Header, CompareModal...)
    │   ├── pages/            # Các trang chính (ProductList, ProductDetail, ComparePage)
    │   ├── App.js            # Khai báo định tuyến (React Router)
    │   └── App.css           # Style CSS toàn cục
    └── package.json
```