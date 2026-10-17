import { useQuery } from "@tanstack/react-query";
import { postApi } from "@/api/post";
import { QUERY_KEYS } from "@/constants/query-keys";
import { STALE_TIME } from "@/constants/query-config";
import type { PostListParams } from "@/types/post";

export function usePosts(params: PostListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.posts.list(params as Record<string, unknown>),
    queryFn: () => postApi.getPosts(params),
    staleTime: STALE_TIME.DEFAULT,
  });
}

export function usePostBySlug(slug?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.posts.detail(slug ?? "missing"),
    queryFn: () => postApi.getPostBySlug(slug as string),
    enabled: Boolean(slug),
    staleTime: STALE_TIME.DEFAULT,
    retry: false,
  });
}
