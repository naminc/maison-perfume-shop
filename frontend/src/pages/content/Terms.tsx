import PolicyPage from "./PolicyPage";

export default function Terms() {
  return (
    <PolicyPage
      title="Điều khoản sử dụng"
      crumb="Điều khoản"
      intro="Vui lòng đọc kỹ các điều khoản trước khi sử dụng dịch vụ của Maison."
      sections={[
        { h: "Chấp nhận điều khoản", body: "Khi truy cập và sử dụng website maison.vn, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu tại đây." },
        { h: "Tài khoản người dùng", body: ["Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình.", "Maison có quyền tạm khoá hoặc xoá tài khoản vi phạm điều khoản.", "Một người chỉ được tạo một tài khoản chính."] },
        { h: "Đặt hàng và thanh toán", body: "Khi đặt hàng, bạn cam kết cung cấp thông tin chính xác. Maison có quyền từ chối hoặc huỷ đơn hàng nếu phát hiện thông tin sai sự thật hoặc dấu hiệu gian lận." },
        { h: "Sở hữu trí tuệ", body: "Tất cả nội dung (hình ảnh, văn bản, logo) trên website thuộc sở hữu của Maison hoặc đối tác. Nghiêm cấm sao chép, sử dụng cho mục đích thương mại khi chưa có sự cho phép." },
        { h: "Thay đổi điều khoản", body: "Maison có quyền cập nhật điều khoản bất kỳ lúc nào. Phiên bản mới có hiệu lực ngay khi được đăng tải trên website." },
      ]}
    />
  );
}
