import PolicyPage from "./PolicyPage";

export default function Returns() {
  return (
    <PolicyPage
      title="Chính sách đổi trả"
      crumb="Đổi trả"
      intro="Maison cam kết quyền lợi khách hàng — đổi trả dễ dàng trong 7 ngày."
      sections={[
        {
          h: "Điều kiện đổi trả",
          body: [
            "Sản phẩm còn nguyên seal, chưa qua sử dụng.",
            "Còn đầy đủ hộp, tem nhãn, phụ kiện đi kèm.",
            "Trong vòng 7 ngày kể từ khi nhận hàng.",
          ],
        },
        {
          h: "Các trường hợp được đổi trả miễn phí",
          body: [
            "Sản phẩm bị lỗi từ nhà sản xuất.",
            "Giao sai sản phẩm so với đơn đặt hàng.",
            "Sản phẩm bị hư hỏng trong quá trình vận chuyển.",
          ],
        },
        {
          h: "Quy trình đổi trả",
          body: [
            "Liên hệ Maison qua hotline 0987 654 321 hoặc email hello@maison.vn.",
            "Cung cấp mã đơn hàng và lý do đổi trả.",
            "Đóng gói cẩn thận, gửi về kho của Maison theo hướng dẫn.",
            "Maison hoàn tiền hoặc gửi sản phẩm thay thế trong vòng 3-5 ngày làm việc.",
          ],
        },
        {
          h: "Lưu ý",
          body: "Maison không hỗ trợ đổi trả vì lý do thay đổi sở thích cá nhân đối với sản phẩm đã mở seal, vì lý do vệ sinh và an toàn.",
        },
      ]}
    />
  );
}
