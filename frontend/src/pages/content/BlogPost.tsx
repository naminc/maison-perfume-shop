import { Link, useParams } from "react-router-dom";
import type { AxiosError } from "axios";
import { Calendar, ArrowLeft } from "lucide-react";
import ContentPage from "@/components/site/ContentPage";
import { SimpleMarkdown } from "@/components/site/SimpleMarkdown";
import { formatPostDate, PostCoverImage } from "@/components/site/PostCover";
import { usePostBySlug, usePosts } from "@/hooks/usePosts";
import NotFound from "@/pages/NotFound";

export default function BlogPost() {
  const { slug = "" } = useParams();
  const postQuery = usePostBySlug(slug);
  const relatedQuery = usePosts({ per_page: 4 });

  if (postQuery.isError && (postQuery.error as AxiosError)?.response?.status === 404) {
    return <NotFound />;
  }

  if (postQuery.isLoading) {
    return (
      <ContentPage title="Đang tải bài viết..." crumbs={[{ label: "Blog", to: "/blog" }]} narrow>
        <PostSkeleton />
      </ContentPage>
    );
  }

  const post = postQuery.data;

  if (postQuery.isError || !post) {
    return (
      <ContentPage title="Không thể tải bài viết" crumbs={[{ label: "Blog", to: "/blog" }]} narrow>
        <div className="rounded-xl border border-stone-200 bg-white py-16 text-center">
          <p className="text-sm text-stone-500">Vui lòng thử lại sau.</p>
          <Link to="/blog" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Quay lại blog
          </Link>
        </div>
      </ContentPage>
    );
  }

  const related = (relatedQuery.data?.data ?? []).filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
    <ContentPage
      title={post.title}
      crumbs={[{ label: "Blog", to: "/blog" }, { label: post.category ?? "Bài viết" }]}
      narrow
    >
      <div className="-mt-4 mb-6 flex flex-wrap items-center gap-2 text-xs text-stone-500">
        {post.category && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">{post.category}</span>
        )}
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatPostDate(post.published_at)}</span>
        {post.read_minutes && <span>· {post.read_minutes} phút đọc</span>}
      </div>

      <PostCoverImage post={post} className="aspect-[16/9] w-full rounded-2xl object-cover" />

      <article className="prose mt-8 max-w-none text-stone-700">
        {post.excerpt && <p className="text-lg leading-relaxed text-stone-700">{post.excerpt}</p>}
        <SimpleMarkdown content={post.content} />
      </article>

      <div className="mt-10 border-t border-stone-200 pt-8">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-stone-900">
          <ArrowLeft className="h-4 w-4" /> Quay lại blog
        </Link>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Bài viết liên quan</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <Link key={item.slug} to={`/blog/${item.slug}`} className="group overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:shadow-md">
                <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                  <PostCoverImage post={item} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <div className="text-xs text-stone-500">{formatPostDate(item.published_at)}</div>
                  <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-stone-900 group-hover:text-amber-700">{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </ContentPage>
  );
}

function PostSkeleton() {
  return (
    <div className="space-y-6">
      <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-stone-100" />
      <div className="space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-stone-100" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-stone-100" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-stone-100" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-stone-100" />
      </div>
    </div>
  );
}
