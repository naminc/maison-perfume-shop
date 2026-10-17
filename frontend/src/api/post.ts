import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type { Post, PostListParams, PostListResponse } from "@/types/post";

export const postApi = {
  getPosts: (params: PostListParams = {}) =>
    api
      .get<{ data: PostListResponse }>("/v1/posts", {
        params: {
          ...params,
          category: params.category || undefined,
        },
      })
      .then(unwrap),

  getPostBySlug: (slug: string) =>
    api.get<{ data: Post }>(`/v1/posts/${slug}`).then(unwrap),
};
