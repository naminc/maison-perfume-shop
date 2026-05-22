// Demo perfume catalog for storefront pages.
import heroPerfume from "@/assets/hero-perfume.jpg";
import perfumeCollection from "@/assets/perfume-collection.jpg";
import perfumeDark from "@/assets/perfume-dark.jpg";
import perfumeLifestyle from "@/assets/perfume-lifestyle.jpg";
import perfumeRose from "@/assets/perfume-rose.jpg";

export type Gender = "nam" | "nu" | "unisex";
export type Family = "Floral" | "Woody" | "Oriental" | "Fresh" | "Citrus" | "Spicy";

export interface Perfume {
  id: string;
  slug: string;
  name: string;
  brand: string;
  volume: string;
  gender: Gender;
  family: Family;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  shortDescription: string;
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  inStock: boolean;
  hot?: boolean;
  isNew?: boolean;
}

const IMG = {
  bottle1: heroPerfume,
  bottle2: perfumeDark,
  bottle3: perfumeLifestyle,
  bottle4: perfumeCollection,
  bottle5: perfumeRose,
  bottle6: heroPerfume,
  bottle7: perfumeRose,
  bottle8: perfumeCollection,
};

export const BRANDS = ["Dior", "Chanel", "Tom Ford", "Versace", "YSL", "Victoria's Secret"];
export const FAMILIES: Family[] = ["Floral", "Woody", "Oriental", "Fresh", "Citrus", "Spicy"];

export const perfumes: Perfume[] = [
  {
    id: "p1", slug: "dior-sauvage-edp-100ml", name: "Dior Sauvage EDP", brand: "Dior", volume: "100ml",
    gender: "nam", family: "Spicy", price: 2890000, oldPrice: 3490000, image: IMG.bottle1, rating: 4.8, reviews: 248,
    shortDescription: "Hương gỗ cay nồng, mạnh mẽ, biểu tượng nam tính hiện đại.",
    topNotes: ["Bergamot", "Tiêu"], middleNotes: ["Lavender", "Hoa phong lữ"], baseNotes: ["Ambroxan", "Cedar"],
    inStock: true, hot: true,
  },
  {
    id: "p2", slug: "chanel-bleu-de-chanel-edp", name: "Chanel Bleu de Chanel EDP", brand: "Chanel", volume: "100ml",
    gender: "nam", family: "Woody", price: 3290000, oldPrice: 3890000, image: IMG.bottle2, rating: 4.9, reviews: 412,
    shortDescription: "Sự thanh lịch tinh tế của một quý ông Pháp.",
    topNotes: ["Citrus", "Bưởi hồng"], middleNotes: ["Gừng", "Nhang"], baseNotes: ["Cedar", "Sandalwood"],
    inStock: true,
  },
  {
    id: "p3", slug: "vs-bombshell-mist", name: "Victoria's Secret Bombshell Mist", brand: "Victoria's Secret",
    volume: "250ml", gender: "nu", family: "Floral", price: 450000, image: IMG.bottle3, rating: 4.6, reviews: 1024,
    shortDescription: "Body mist hương hoa quả tươi mát, ngọt ngào.",
    topNotes: ["Bưởi", "Dứa"], middleNotes: ["Mẫu đơn"], baseNotes: ["Xạ hương"],
    inStock: true, isNew: true,
  },
  {
    id: "p4", slug: "tom-ford-oud-wood", name: "Tom Ford Oud Wood", brand: "Tom Ford", volume: "50ml",
    gender: "unisex", family: "Woody", price: 4500000, image: IMG.bottle4, rating: 4.9, reviews: 96,
    shortDescription: "Hương trầm hương quý phái, sang trọng và bí ẩn.",
    topNotes: ["Hồ tiêu", "Hoa hồi"], middleNotes: ["Oud", "Hoa hồng"], baseNotes: ["Sandalwood", "Vanilla"],
    inStock: true, hot: true,
  },
  {
    id: "p5", slug: "versace-eros-edt", name: "Versace Eros EDT", brand: "Versace", volume: "100ml",
    gender: "nam", family: "Fresh", price: 2100000, oldPrice: 2450000, image: IMG.bottle5, rating: 4.7, reviews: 318,
    shortDescription: "Trẻ trung, gợi cảm với hương bạc hà tươi mát.",
    topNotes: ["Bạc hà", "Táo xanh"], middleNotes: ["Đậu tonka"], baseNotes: ["Vanilla", "Cedar"],
    inStock: true,
  },
  {
    id: "p6", slug: "ysl-libre-edp", name: "YSL Libre EDP", brand: "YSL", volume: "90ml",
    gender: "nu", family: "Floral", price: 2890000, image: IMG.bottle6, rating: 4.8, reviews: 205,
    shortDescription: "Tự do, phóng khoáng và quyến rũ.",
    topNotes: ["Cam Calabria", "Mandarin"], middleNotes: ["Hoa cam", "Lavender"], baseNotes: ["Xạ hương", "Cedar"],
    inStock: true, isNew: true,
  },
  {
    id: "p7", slug: "dior-jadore-edp", name: "Dior J'adore EDP", brand: "Dior", volume: "100ml",
    gender: "nu", family: "Floral", price: 3490000, oldPrice: 3990000, image: IMG.bottle7, rating: 4.9, reviews: 587,
    shortDescription: "Bó hoa thanh tao, biểu tượng nữ tính của Dior.",
    topNotes: ["Lê", "Dưa"], middleNotes: ["Hoa nhài", "Hoa hồng"], baseNotes: ["Sandalwood"],
    inStock: true,
  },
  {
    id: "p8", slug: "chanel-coco-mademoiselle", name: "Chanel Coco Mademoiselle", brand: "Chanel", volume: "100ml",
    gender: "nu", family: "Oriental", price: 3990000, image: IMG.bottle8, rating: 4.9, reviews: 723,
    shortDescription: "Quyến rũ, hiện đại với hương cam và hoa nhài.",
    topNotes: ["Cam", "Bergamot"], middleNotes: ["Hoa hồng Thổ Nhĩ Kỳ"], baseNotes: ["Patchouli", "Vetiver"],
    inStock: false, hot: true,
  },
];

export const fmtVnd = (n: number) => n.toLocaleString("vi-VN") + "đ";

export const findBySlug = (slug: string) => perfumes.find((p) => p.slug === slug);
