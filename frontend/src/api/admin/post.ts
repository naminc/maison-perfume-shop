import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type { AdminPostListParams, Post, PostListResponse, PostPayload } from "@/types/post";

function normalizeParams(params: AdminPostListParams = {}) {
  return {
    ...params,
    search: params.search?.trim() || undefined,
    status: params.status === "all" ? undefined : params.status,
    category: params.category || undefined,
  };
}

export const adminPostApi = {
  getPosts: (params: AdminPostListParams = {}) =>
    api
      .get<{ data: PostListResponse }>("/v1/admin/posts", {
        params: normalizeParams(params),
      })
      .then(unwrap),

  getPost: (id: number) =>
    api.get<{ data: Post }>(`/v1/admin/posts/${id}`).then(unwrap),

  createPost: (payload: PostPayload) =>
    api.post<{ data: Post }>("/v1/admin/posts", payload).then(unwrap),

  updatePost: (id: number, payload: PostPayload) =>
    api.put<{ data: Post }>(`/v1/admin/posts/${id}`, payload).then(unwrap),

  deletePost: (id: number) =>
    api.delete<{ data: null }>(`/v1/admin/posts/${id}`).then(unwrap),
};
