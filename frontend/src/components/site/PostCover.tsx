import { Newspaper } from "lucide-react";
import type { Post } from "@/types/post";

export function PostCoverImage({ post, className }: { post: Post; className?: string }) {
  if (post.cover_image) {
    return <img src={post.cover_image} alt={post.title} className={className} loading="lazy" />;
  }

  return (
    <div className={`grid place-items-center bg-gradient-to-br from-stone-100 to-amber-50 text-stone-300 ${className ?? ""}`}>
      <Newspaper className="h-10 w-10" strokeWidth={1.5} />
    </div>
  );
}

export function formatPostDate(value: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("vi-VN");
}
