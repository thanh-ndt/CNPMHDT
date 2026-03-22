import axios from 'axios';

// 1. Khởi tạo một đối tượng Axios (instance) với các thiết lập chung
const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Thêm timeout để tránh request treo vĩnh viễn (10s)
});

// 2. Can thiệp vào gói tin GỬI ĐI (Request Interceptor)
axiosClient.interceptors.request.use(
  (config) => {
    // Thường dùng để đính kèm Token đăng nhập vào Header tự động
    // const token = localStorage.getItem('access_token');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Can thiệp vào gói tin NHẬN VỀ (Response Interceptor)
axiosClient.interceptors.response.use(
  (response) => {
    // Lấy thẳng dữ liệu response.data để các file Api không phải gọi .data nhiều lần
    return response;
  },
  (error) => {
    // Xử lý lỗi hệ thống chung (Ví dụ: Token hết hạn -> Bắt đăng nhập lại)
    // if (error.response && error.response.status === 401) {
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);

export default axiosClient;
