import PolicyPage from "./PolicyPage";

export default function Shipping() {
  return (
    <PolicyPage
      title="Chính sách vận chuyển"
      crumb="Vận chuyển"
      intro="Maison giao hàng toàn quốc, nhanh chóng và an toàn."
      sections={[
        {
          h: "Phạm vi giao hàng",
          body: "Maison giao hàng đến tất cả 63 tỉnh thành Việt Nam thông qua các đơn vị vận chuyển uy tín như Giao Hàng Nhanh, Viettel Post và J&T Express.",
        },
        {
          h: "Phí giao hàng",
          body: [
            "Miễn phí với đơn hàng từ 500.000đ.",
            "Giao tiêu chuẩn (2-4 ngày): 30.000đ.",
            "Giao nhanh nội thành TP. HCM, Hà Nội (trong 24h): 60.000đ.",
          ],
        },
        {
          h: "Thời gian giao hàng",
          body: [
            "Nội thành TP. HCM: 1-2 ngày làm việc.",
            "Hà Nội và các tỉnh lân cận: 2-3 ngày làm việc.",
            "Các tỉnh xa: 3-5 ngày làm việc.",
          ],
        },
        {
          h: "Theo dõi đơn hàng",
          body: "Sau khi đơn hàng được xác nhận, bạn sẽ nhận được mã vận đơn qua SMS và email. Bạn cũng có thể theo dõi trực tiếp trong mục Đơn hàng của tôi.",
        },
      ]}
    />
  );
}
