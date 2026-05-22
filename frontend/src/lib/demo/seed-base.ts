import type { Category, Supplier, Location } from "@/types/inventory";

const ts = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

export const categories: Category[] = [
  { id: "cat-01", name: "Eau de Parfum", description: "Nước hoa nồng độ cao, lưu hương 6–8 giờ", parentId: null, createdAt: ts(90), updatedAt: ts(90) },
  { id: "cat-02", name: "Eau de Toilette", description: "Nước hoa nhẹ, phù hợp ban ngày", parentId: null, createdAt: ts(90), updatedAt: ts(90) },
  { id: "cat-03", name: "Cologne & Body Mist", description: "Xịt thơm toàn thân, hương nhẹ tươi mát", parentId: null, createdAt: ts(90), updatedAt: ts(90) },
  { id: "cat-04", name: "Nước hoa Niche", description: "Dòng nước hoa độc bản, sản xuất giới hạn", parentId: null, createdAt: ts(90), updatedAt: ts(90) },
  { id: "cat-05", name: "Set quà tặng & Phụ kiện", description: "Hộp quà, mẫu thử, túi thơm", parentId: null, createdAt: ts(90), updatedAt: ts(90) },
];

export const suppliers: Supplier[] = [
  { id: "sup-01", name: "Parfum Paris Distribution", contactName: "Claire Dubois", email: "claire@parfumparis.fr", phone: "+33 1 4567 8910", address: "12 Rue Saint-Honoré, Paris, France", leadTimeDays: 10, rating: 4.7, isActive: true, notes: "Nhà phân phối chính Chanel, Dior, Guerlain", createdAt: ts(120), updatedAt: ts(10) },
  { id: "sup-02", name: "Lux Beauty Việt Nam", contactName: "Nguyễn Thu Hà", email: "ha.nguyen@luxbeauty.vn", phone: "028 3823 4567", address: "88 Đồng Khởi, Quận 1, TP.HCM", leadTimeDays: 3, rating: 4.8, isActive: true, notes: "Hàng chính hãng, giao nhanh nội thành", createdAt: ts(100), updatedAt: ts(5) },
  { id: "sup-03", name: "Niche Atelier Imports", contactName: "Marco Bianchi", email: "marco@nicheatelier.it", phone: "+39 02 1234 5678", address: "Via Montenapoleone 8, Milano, Italy", leadTimeDays: 14, rating: 4.5, isActive: true, notes: "Chuyên niche: Creed, Maison Margiela, Tom Ford Private Blend", createdAt: ts(80), updatedAt: ts(15) },
  { id: "sup-04", name: "Hương Việt Trading", contactName: "Trần Minh Đức", email: "duc.tran@huongviet.com.vn", phone: "024 3974 1122", address: "45 Hàng Bài, Hoàn Kiếm, Hà Nội", leadTimeDays: 5, rating: 4.3, isActive: true, notes: "Body mist, set quà tặng, phụ kiện đóng gói", createdAt: ts(70), updatedAt: ts(8) },
];

export const locations: Location[] = [
  // Kho trung tâm
  { id: "loc-01", name: "Kho trung tâm TP.HCM", type: "warehouse", parentId: null, description: "Kho chính, nhận hàng nhập khẩu", address: "Lô B12, KCN Tân Bình, TP.HCM", isActive: true, createdAt: ts(120), updatedAt: ts(5) },
  { id: "loc-01-z1", name: "Khu A — Eau de Parfum", type: "zone", parentId: "loc-01", description: "Khu lưu trữ EDP", address: "", isActive: true, createdAt: ts(110), updatedAt: ts(5) },
  { id: "loc-01-z2", name: "Khu B — EDT & Cologne", type: "zone", parentId: "loc-01", description: "EDT, cologne, body mist", address: "", isActive: true, createdAt: ts(110), updatedAt: ts(5) },
  { id: "loc-01-z1-a1", name: "Kệ 1", type: "aisle", parentId: "loc-01-z1", description: "Thương hiệu Pháp", address: "", isActive: true, createdAt: ts(100), updatedAt: ts(5) },
  { id: "loc-01-z1-a2", name: "Kệ 2", type: "aisle", parentId: "loc-01-z1", description: "Niche & limited", address: "", isActive: true, createdAt: ts(100), updatedAt: ts(5) },
  { id: "loc-01-z2-a1", name: "Kệ 3", type: "aisle", parentId: "loc-01-z2", description: "Body mist & set quà", address: "", isActive: true, createdAt: ts(100), updatedAt: ts(5) },
  // Cửa hàng
  { id: "loc-02", name: "Showroom Đồng Khởi", type: "warehouse", parentId: null, description: "Cửa hàng flagship trung tâm Quận 1", address: "92 Đồng Khởi, Quận 1, TP.HCM", isActive: true, createdAt: ts(100), updatedAt: ts(10) },
  { id: "loc-03", name: "Chi nhánh Hà Nội", type: "warehouse", parentId: null, description: "Kho và cửa hàng miền Bắc", address: "27 Tràng Tiền, Hoàn Kiếm, Hà Nội", isActive: true, createdAt: ts(80), updatedAt: ts(20) },
];
