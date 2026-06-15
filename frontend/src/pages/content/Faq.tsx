import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ContentPage from "@/components/site/ContentPage";

const FAQS: { q: string; a: string }[] = [
  { q: "Maison có cam kết bán hàng chính hãng không?", a: "100% các sản phẩm tại Maison được nhập từ nhà phân phối uỷ quyền. Nếu phát hiện hàng giả, chúng tôi hoàn tiền gấp đôi giá trị sản phẩm." },
  { q: "Phí giao hàng như thế nào?", a: "Miễn phí giao hàng cho đơn từ 500.000đ. Đơn dưới 500.000đ tính phí 30.000đ (tiêu chuẩn) hoặc 60.000đ (giao nhanh)." },
  { q: "Tôi có thể đổi trả sản phẩm không?", a: "Có. Bạn được đổi trả miễn phí trong vòng 7 ngày kể từ khi nhận hàng nếu sản phẩm còn nguyên seal, chưa qua sử dụng." },
  { q: "Nước hoa chiết có khác gì so với bản full?", a: "Nước hoa chiết là cùng một loại nước hoa, được chiết sang chai nhỏ (5-10ml) từ bản full. Mùi hương và độ lưu hoàn toàn giống bản chính hãng." },
  { q: "Làm sao biết tôi hợp với mùi hương nào?", a: "Bạn có thể đặt set mẫu thử của Maison, hoặc liên hệ hotline để được tư vấn cá nhân hoá theo sở thích và phong cách." },
  { q: "Tôi có thể thanh toán bằng những hình thức nào?", a: "Hiện tại Maison chỉ hỗ trợ thanh toán khi nhận hàng (COD). Các phương thức khác sẽ được mở sau." },
  { q: "Đơn hàng của tôi mất bao lâu để giao?", a: "Nội thành TP. HCM: 1-2 ngày. Các tỉnh khác: 2-4 ngày với giao tiêu chuẩn. Giao nhanh chỉ áp dụng nội thành trong 24h." },
  { q: "Tôi có cần tài khoản để mua hàng không?", a: "Không bắt buộc — bạn có thể đặt hàng với tư cách khách. Tuy nhiên đăng ký tài khoản giúp bạn theo dõi đơn hàng và nhận ưu đãi riêng." },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ContentPage title="Câu hỏi thường gặp" subtitle="Mọi điều bạn cần biết khi mua sắm tại Maison." crumbs={[{ label: "FAQ" }]} narrow>
      <div className="space-y-2">
        {FAQS.map((f, i) => (
          <div key={i} className="rounded-xl border border-stone-200 bg-white">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left"
            >
              <span className="font-medium text-stone-900">{f.q}</span>
              <ChevronDown className={`h-5 w-5 shrink-0 text-stone-400 transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && (
              <div className="border-t border-stone-100 px-5 pb-5 pt-3 text-sm leading-relaxed text-stone-600">
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </ContentPage>
  );
}
