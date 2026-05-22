import type { Item } from "@/types/inventory";
import { ItemStatus } from "@/types/inventory";

const ts = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

const item = (
  idx: number,
  name: string,
  catId: string,
  supId: string,
  locId: string,
  stock: number,
  reorder: number,
  cost: number,
  sell: number,
): Item => ({
  id: `itm-${String(idx).padStart(3, "0")}`,
  sku: `STK-${String(1000 + idx)}`,
  barcode: idx % 3 === 0 ? null : `49${String(10000000 + idx * 137).slice(0, 8)}${idx % 10}`,
  name,
  description: `${name} — nước hoa chính hãng`,
  categoryId: catId,
  status: ItemStatus.Active,
  unit: "chai",
  currentStock: stock,
  reorderPoint: reorder,
  reorderQuantity: reorder * 2,
  costPrice: cost,
  sellingPrice: sell,
  locationId: locId,
  supplierId: supId,
  imageUrl: null,
  customFields: {},
  createdAt: ts(60),
  updatedAt: ts(Math.floor(Math.random() * 30)),
});

const cf = (fields: Record<string, string | number | boolean>) => fields;

// Giá tính theo VND (nghìn). cost/sell = giá vốn / giá bán (đơn vị: nghìn VND)
export const items: Item[] = [
  // Eau de Parfum (cat-01) — 8 chai
  { ...item(1, "Chanel Coco Mademoiselle EDP 100ml", "cat-01", "sup-01", "loc-01", 24, 8, 2800, 4200), customFields: cf({ "Dung tích": "100ml", "Nhóm hương": "Chypre Floral", "Xuất xứ": "Pháp" }) },
  { ...item(2, "Dior Sauvage EDP 100ml", "cat-01", "sup-01", "loc-01", 6, 10, 2600, 3900), customFields: cf({ "Dung tích": "100ml", "Nhóm hương": "Ambery Spicy", "Giới tính": "Nam" }) }, // low
  { ...item(3, "YSL Libre EDP 90ml", "cat-01", "sup-01", "loc-01", 18, 8, 2400, 3650), customFields: cf({ "Dung tích": "90ml", "Nhóm hương": "Floral" }) },
  item(4, "Lancôme La Vie Est Belle EDP 75ml", "cat-01", "sup-02", "loc-01", 4, 8, 2100, 3300), // low
  item(5, "Versace Eros EDP 100ml", "cat-01", "sup-02", "loc-02", 0, 6, 1900, 2950), // out
  item(6, "Giorgio Armani Si Passione EDP 100ml", "cat-01", "sup-01", "loc-01", 32, 10, 2500, 3800),
  item(7, "Paco Rabanne 1 Million EDP 100ml", "cat-01", "sup-02", "loc-02", 3, 8, 1850, 2850), // low
  item(8, "Carolina Herrera Good Girl EDP 80ml", "cat-01", "sup-01", "loc-01", 5, 8, 2200, 3400), // low

  // Eau de Toilette (cat-02) — 8 chai
  { ...item(9, "Bvlgari Aqva Pour Homme EDT 100ml", "cat-02", "sup-01", "loc-01", 28, 8, 1700, 2650), customFields: cf({ "Dung tích": "100ml", "Nhóm hương": "Aromatic Aquatic" }) },
  item(10, "Dolce & Gabbana Light Blue EDT 100ml", "cat-02", "sup-01", "loc-01", 4, 10, 1600, 2500), // low
  item(11, "Hugo Boss Bottled EDT 100ml", "cat-02", "sup-02", "loc-02", 22, 8, 1500, 2350),
  item(12, "Calvin Klein CK One EDT 100ml", "cat-02", "sup-04", "loc-01", 15, 20, 950, 1490),
  item(13, "Versace Bright Crystal EDT 90ml", "cat-02", "sup-04", "loc-02", 3, 8, 1450, 2250), // low
  item(14, "Burberry Her EDT 100ml", "cat-02", "sup-01", "loc-03", 0, 6, 1900, 2950), // out
  item(15, "Marc Jacobs Daisy EDT 100ml", "cat-02", "sup-02", "loc-01", 12, 6, 1850, 2850),
  item(16, "Givenchy Gentleman EDT 100ml", "cat-02", "sup-04", "loc-01", 30, 10, 1750, 2700),

  // Cologne & Body Mist (cat-03) — 7 chai
  item(17, "Victoria's Secret Bombshell Mist 250ml", "cat-03", "sup-04", "loc-01", 60, 20, 280, 490),
  item(18, "Bath & Body Works Mist Vanilla Bean 236ml", "cat-03", "sup-04", "loc-01", 75, 25, 250, 450),
  item(19, "Jo Malone London Cologne 100ml", "cat-03", "sup-04", "loc-01", 3, 5, 2900, 4500), // low
  item(20, "The Body Shop White Musk Mist 100ml", "cat-03", "sup-04", "loc-02", 0, 15, 320, 550), // out
  item(21, "Charlotte Tilbury Scent of a Dream Mist 100ml", "cat-03", "sup-04", "loc-01", 90, 25, 350, 590),
  item(22, "Zara Red Vanilla Cologne 100ml", "cat-03", "sup-04", "loc-02", 40, 10, 280, 490),
  item(23, "Maison Francis Body Mist 100ml", "cat-03", "sup-04", "loc-01", 5, 12, 380, 650), // low

  // Nước hoa Niche (cat-04) — 6 chai
  item(24, "Creed Aventus EDP 100ml", "cat-04", "sup-03", "loc-01", 9, 4, 8500, 12500),
  item(25, "Maison Margiela Replica Beach Walk 100ml", "cat-04", "sup-03", "loc-01", 3, 6, 3200, 4900), // low
  item(26, "Tom Ford Tobacco Vanille 50ml", "cat-04", "sup-03", "loc-01", 14, 5, 5800, 8800),
  item(27, "Le Labo Santal 33 EDP 50ml", "cat-04", "sup-03", "loc-01", 2, 5, 5200, 7900), // low
  item(28, "Byredo Gypsy Water EDP 100ml", "cat-04", "sup-03", "loc-02", 0, 3, 6500, 9800), // out
  item(29, "Diptyque Philosykos EDP 75ml", "cat-04", "sup-03", "loc-01", 11, 4, 4900, 7400),

  // Set quà tặng & Phụ kiện (cat-05) — 6 sản phẩm
  item(30, "Set quà Chanel Chance Mini 4×7.5ml", "cat-05", "sup-01", "loc-01", 18, 5, 2400, 3600),
  item(31, "Set Dior Miss Dior Travel 2×30ml", "cat-05", "sup-01", "loc-01", 22, 6, 2200, 3400),
  item(32, "Vali mẫu thử Niche 12×2ml", "cat-05", "sup-03", "loc-02", 35, 10, 850, 1450),
  item(33, "Túi thơm cao cấp lavender", "cat-05", "sup-04", "loc-01", 4, 10, 95, 180), // low
  item(34, "Hộp gỗ quà tặng 1 chai 100ml", "cat-05", "sup-04", "loc-01", 0, 8, 220, 390), // out
  item(35, "Nến thơm Diptyque Baies 190g", "cat-05", "sup-03", "loc-01", 16, 5, 1850, 2900),
];
