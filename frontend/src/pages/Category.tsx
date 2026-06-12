import { Navigate, useParams } from "react-router-dom";

const LEGACY_CATEGORY_SLUGS: Record<string, string> = {
  nam: "nuoc-hoa-nam",
  nu: "nuoc-hoa-nu",
  unisex: "nuoc-hoa-unisex",
};

export default function CategoryRedirect() {
  const { slug = "" } = useParams();
  const normalizedSlug = slug.toLowerCase();
  const categorySlug = LEGACY_CATEGORY_SLUGS[normalizedSlug] ?? normalizedSlug;

  return <Navigate to={`/shop?category=${encodeURIComponent(categorySlug)}`} replace />;
}
