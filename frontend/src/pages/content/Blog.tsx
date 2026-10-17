import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, Newspaper } from "lucide-react";
import ContentPage from "@/components/site/ContentPage";
import { usePosts } from "@/hooks/usePosts";
import { formatPostDate, PostCoverImage } from "@/components/site/PostCover";

const PAGE_SIZE = 9;

export default function Blog() {
  const [page, setPage] = useState(1);
  const postsQuery = usePosts({ page, per_page: PAGE_SIZE });
  const posts = postsQuery.data?.data ?? [];
  const pagination = postsQuery.data;

  return (
    <ContentPage title="Tạp chí Maison" subtitle="Kiến thức và cảm hứng dành cho người yêu nước hoa." crumbs={[{ label: "Blog" }]}>
      {postsQuery.isLoading ? (
        <BlogSkeleton />
      ) : postsQuery.isError ? (
        <StateBox title="Không thể tải bài viết" description="Vui lòng thử lại sau." />
      ) : posts.length === 0 ? (
        <StateBox title="Chưa có bài viết" description="Các bài viết mới sẽ xuất hiện tại đây." />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post.id} className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:shadow-md">
                <Link to={`/blog/${post.slug}`} className="block aspect-[4/3] overflow-hidden bg-stone-100">
                  <PostCoverImage post={post} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </Link>
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                    {post.category && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">{post.category}</span>
                    )}
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatPostDate(post.published_at)}</span>
                    {post.read_minutes && <span>· {post.read_minutes} phút đọc</span>}
                  </div>
                  <h2 className="mt-3 font-semibold text-stone-900 line-clamp-2">
                    <Link to={`/blog/${post.slug}`} className="hover:text-amber-700">{post.title}</Link>
                  </h2>
                  {post.excerpt && <p className="mt-2 line-clamp-3 text-sm text-stone-600">{post.excerpt}</p>}
                  <Link to={`/blog/${post.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-700 hover:underline">
                    Đọc tiếp <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {pagination && pagination.last_page > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={page >= pagination.last_page}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </ContentPage>
  );
}

function StateBox({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white py-16 text-center">
      <Newspaper className="mx-auto h-10 w-10 text-stone-300" strokeWidth={1.5} />
      <h2 className="mt-3 text-lg font-medium text-stone-900">{title}</h2>
      <p className="mt-1 text-sm text-stone-500">{description}</p>
    </div>
  );
}

function BlogSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="aspect-[4/3] animate-pulse bg-stone-100" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-2/3 animate-pulse rounded bg-stone-100" />
            <div className="h-4 w-full animate-pulse rounded bg-stone-100" />
            <div className="h-3 w-full animate-pulse rounded bg-stone-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
