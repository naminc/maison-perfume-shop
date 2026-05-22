import PolicyPage from "./PolicyPage";

export default function Privacy() {
  return (
    <PolicyPage
      title="Chính sách bảo mật"
      crumb="Bảo mật"
      intro="Maison cam kết bảo vệ thông tin cá nhân của khách hàng."
      sections={[
        { h: "Thông tin thu thập", body: "Chúng tôi thu thập thông tin cá nhân khi bạn đăng ký tài khoản, đặt hàng, hoặc đăng ký nhận tin: họ tên, email, số điện thoại, địa chỉ giao hàng." },
        { h: "Mục đích sử dụng", body: ["Xử lý đơn hàng và giao hàng.", "Hỗ trợ khách hàng và giải quyết khiếu nại.", "Gửi thông tin khuyến mãi (chỉ khi bạn đồng ý).", "Cải thiện trải nghiệm mua sắm."] },
        { h: "Bảo mật thông tin", body: "Thông tin của bạn được mã hoá và lưu trữ trên hệ thống đạt chuẩn bảo mật. Chúng tôi không chia sẻ thông tin cá nhân với bên thứ ba khi chưa có sự đồng ý của bạn, trừ trường hợp pháp luật yêu cầu." },
        { h: "Quyền của khách hàng", body: ["Yêu cầu truy cập, chỉnh sửa hoặc xoá thông tin cá nhân.", "Từ chối nhận email marketing bất cứ lúc nào.", "Khiếu nại nếu phát hiện vi phạm quyền riêng tư."] },
        { h: "Liên hệ", body: "Mọi thắc mắc về chính sách bảo mật, vui lòng liên hệ hello@maison.vn." },
      ]}
    />
  );
}
