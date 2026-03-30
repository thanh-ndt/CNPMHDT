import React, { useEffect } from 'react';
import { Container, Card } from 'react-bootstrap';

const AboutPage = () => {
    // Scroll to top when loading the page
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <Container className="my-5 py-4" style={{ minHeight: '60vh' }}>
            <h1 className="text-center fw-bold mb-4 text-danger">GIỚI THIỆU & ĐIỀU KHOẢN DỊCH VỤ</h1>
            
            <Card className="shadow-sm border-0 mb-4 rounded-4">
                <Card.Body className="p-4 p-md-5">
                    <h3 className="fw-bold mb-3">Về Honda Store</h3>
                    <p className="text-muted mb-4">
                        Chào mừng Quý khách đến với hệ thống Honda Store. Chúng tôi là đại lý phân phối xe máy Honda chính hãng, cam kết mang đến cho khách hàng những sản phẩm chất lượng nhất, dịch vụ bảo hành chuẩn chính hãng cùng trải nghiệm mua sắm tuyệt vời. Dưới đây là các chính sách và điều khoản dịch vụ của chúng tôi nhằm đảm bảo quyền lợi tối đa cho Quý khách.
                    </p>

                    <hr className="my-5 text-muted opacity-25" />

                    <h4 className="fw-bold text-dark mb-3">1. Quy Định Mua Hàng & Thanh Toán</h4>
                    <ul className="text-muted lh-lg mb-4">
                        <li><strong>Tài khoản:</strong> Khách hàng cần đăng ký, cung cấp thông tin chính xác và xác thực qua OTP để đặt hàng. Quý khách tự chịu trách nhiệm bảo mật mật khẩu.</li>
                        <li><strong>Giá bán:</strong> Đã bao gồm thuế VAT. Giá chưa bao gồm lệ phí trước bạ và phí cấp biển số.</li>
                        <li><strong>Thanh toán:</strong> Hỗ trợ linh hoạt qua Thẻ tín dụng, Chuyển khoản hoặc Tiền mặt trực tiếp khi nhận xe.</li>
                        <li><strong>Hủy đơn:</strong> Quý khách chỉ có thể tự hủy đơn hàng trên web khi trạng thái là "Chờ xác nhận" hoặc "Đã xác nhận". Đơn "Đang giao hàng" không thể hủy.</li>
                    </ul>

                    <h4 className="fw-bold text-dark mb-3 mt-4">2. Chính Sách Vận Chuyển</h4>
                    <ul className="text-muted lh-lg mb-4">
                        <li><strong>Hình thức nhận xe:</strong> Nhận trực tiếp tại đại lý hoặc giao tận nơi bằng xe tải chuyên dụng nhằm đảm bảo an toàn tuyệt đối.</li>
                        <li><strong>Chi phí:</strong> Phí vận chuyển giao xe tận nơi mặc định là 500.000 VNĐ/đơn hàng cho mọi khu vực được hỗ trợ.</li>
                    </ul>

                    <h4 className="fw-bold text-dark mb-3 mt-4">3. Chính Sách Đổi Trả & Hoàn Tiền</h4>
                    <ul className="text-muted lh-lg mb-4">
                        <li><strong>Thời gian áp dụng:</strong> Gửi "Yêu cầu trả hàng" trong vòng 03 ngày kể từ khi đơn chuyển trạng thái "Đã giao hàng". Yêu cầu sẽ được xét duyệt trong 1-3 ngày làm việc.</li>
                        <li><strong>Điều kiện chấp nhận:</strong> Xe chưa qua sử dụng (chưa đổ xăng, chưa lăn bánh, chưa làm thủ tục ra biển số), không trầy xước móp méo và còn đầy đủ phụ kiện đi kèm.</li>
                        <li><strong>Lý do đổi trả:</strong> Lỗi kỹ thuật từ nhà sản xuất, sai mô tả, hư hỏng do vận chuyển hoặc khách hàng đổi ý (có thể áp dụng phí khấu hao tùy hãng).</li>
                    </ul>

                    <h4 className="fw-bold text-dark mb-3 mt-4">4. Chính Sách Khuyến Mãi</h4>
                    <ul className="text-muted lh-lg mb-4">
                        <li><strong>Hình thức:</strong> Giảm giá trực tiếp, Voucher (chỉ áp dụng 01 lần/tài khoản), ưu đãi vận chuyển hoặc quà tặng kèm.</li>
                        <li><strong>Quy định chung:</strong> Khuyến mãi không có giá trị quy đổi thành tiền mặt. Nếu hủy hoặc trả hàng, giá trị khuyến mãi/Voucher sẽ không được hoàn lại.</li>
                        <li><strong>Vi phạm:</strong> Cửa hàng từ chối áp dụng và sẽ khóa tài khoản vĩnh viễn đối với các trường hợp gian lận hoặc lạm dụng mã giảm giá.</li>
                    </ul>

                    <h4 className="fw-bold text-dark mb-3 mt-4">5. Chính Sách Bảo Mật</h4>
                    <ul className="text-muted lh-lg mb-0">
                        <li><strong>An toàn dữ liệu:</strong> Mọi thông tin, mật khẩu và phiên đăng nhập của khách hàng đều được mã hóa theo chuẩn bảo mật cao (Bcrypt, JWT).</li>
                        <li><strong>Sử dụng thông tin:</strong> Chỉ sử dụng để xử lý đơn hàng, giao hàng và chăm sóc khách hàng.</li>
                        <li><strong>Cam kết:</strong> Tuyệt đối không mua bán, trao đổi hay chia sẻ thông tin cá nhân của Quý khách cho bên thứ ba vì mục đích thương mại.</li>
                    </ul>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AboutPage;
