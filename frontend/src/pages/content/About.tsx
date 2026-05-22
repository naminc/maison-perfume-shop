import { Link } from "react-router-dom";
import { Sparkles, Heart, Leaf, Award } from "lucide-react";
import ContentPage from "@/components/site/ContentPage";
import perfumeLifestyle from "@/assets/perfume-lifestyle.jpg";
import perfumeCollection from "@/assets/perfume-collection.jpg";

const VALUES = [
  { icon: Sparkles, t: "Chính hãng tuyệt đối", d: "Mọi sản phẩm đều được nhập trực tiếp từ nhà phân phối uỷ quyền." },
  { icon: Heart, t: "Tận tâm với khách hàng", d: "Tư vấn cá nhân hoá, hỗ trợ 7 ngày/tuần để chọn đúng mùi hương." },
  { icon: Leaf, t: "Bảo vệ môi trường", d: "Bao bì tái chế, ưu tiên thương hiệu cam kết bền vững." },
  { icon: Award, t: "Chất lượng đẳng cấp", d: "Tuyển chọn kỹ lưỡng hơn 500 mùi hương từ thương hiệu danh tiếng." },
];

export default function About() {
  return (
    <ContentPage title="Về Maison" subtitle="Hơn 8 năm đồng hành cùng người yêu nước hoa Việt Nam." crumbs={[{ label: "Giới thiệu" }]}>
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold">Câu chuyện thương hiệu</h2>
          <p className="mt-4 text-stone-600 leading-relaxed">
            Maison khởi đầu từ niềm đam mê nước hoa của những người sáng lập trẻ tại Sài Gòn. Chúng tôi tin rằng mỗi mùi hương là một câu chuyện — và mỗi người đều xứng đáng tìm thấy câu chuyện của riêng mình.
          </p>
          <p className="mt-3 text-stone-600 leading-relaxed">
            Từ một cửa hàng nhỏ năm 2018, Maison hôm nay phục vụ hơn 50.000 khách hàng trên toàn quốc với cam kết duy nhất: hàng chính hãng, giá hợp lý, dịch vụ tận tâm.
          </p>
        </div>
        <img src={perfumeLifestyle} alt="Maison" className="aspect-[4/3] rounded-2xl object-cover" />
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold">Giá trị cốt lõi</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.t} className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-50 text-amber-700">
                <v.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-semibold">{v.t}</div>
              <p className="mt-1 text-sm text-stone-600">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 grid items-center gap-8 md:grid-cols-2">
        <img src={perfumeCollection} alt="Bộ sưu tập" className="aspect-[4/3] rounded-2xl object-cover md:order-2" />
        <div>
          <h2 className="text-2xl font-semibold">Tầm nhìn</h2>
          <p className="mt-4 text-stone-600 leading-relaxed">
            Trở thành điểm đến hàng đầu Đông Nam Á cho người yêu nước hoa — nơi mỗi khách hàng đều được phục vụ như một người sành điệu thực thụ.
          </p>
          <Link to="/shop" className="mt-6 inline-block rounded-lg bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-800">
            Khám phá bộ sưu tập
          </Link>
        </div>
      </section>
    </ContentPage>
  );
}
