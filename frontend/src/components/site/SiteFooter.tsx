import { Link } from "react-router-dom";
import { Phone, Mail } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer id="contact" className="bg-stone-900 text-stone-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="text-lg font-bold text-white">MAISON</div>
          <p className="mt-3 text-sm text-stone-400">Nước hoa chính hãng, chọn lọc theo gu và phong cách sống.</p>
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Mua sắm</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/shop" className="hover:text-white">Tất cả sản phẩm</Link></li>
            <li><Link to="/category/nam" className="hover:text-white">Nước hoa nam</Link></li>
            <li><Link to="/category/nu" className="hover:text-white">Nước hoa nữ</Link></li>
            <li><Link to="/category/unisex" className="hover:text-white">Nước hoa unisex</Link></li>
            <li><Link to="/reviews" className="hover:text-white">Đánh giá khách hàng</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Hỗ trợ</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/faq" className="hover:text-white">Câu hỏi thường gặp</Link></li>
            <li><Link to="/shipping" className="hover:text-white">Vận chuyển</Link></li>
            <li><Link to="/returns" className="hover:text-white">Đổi trả</Link></li>
            <li><Link to="/privacy" className="hover:text-white">Bảo mật</Link></li>
            <li><Link to="/terms" className="hover:text-white">Điều khoản</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Liên hệ</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> 0987 654 321</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@maison.vn</li>
            <li><Link to="/about" className="hover:text-white">Về Maison</Link></li>
            <li><Link to="/contact" className="hover:text-white">Liên hệ</Link></li>
            <li>
              <Link to="/auth/login" className="mt-2 inline-block rounded-md bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-900 hover:bg-white">
                Đăng nhập
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-800">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-stone-500">
          © 2026 Maison. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
