import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminPostApi } from "@/api/admin/post";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { AdminPostListParams, PostPayload } from "@/types/post";

export function useAdminPosts(params: AdminPostListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.posts.list(params as Record<string, unknown>),
    queryFn: () => adminPostApi.getPosts(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PostPayload) => adminPostApi.createPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.posts.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts.all });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PostPayload }) =>
      adminPostApi.updatePost(id, payload),
    onSuccess: (post) => {
      queryClient.setQueryData(QUERY_KEYS.admin.posts.detail(post.id), post);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.posts.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts.all });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminPostApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.posts.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts.all });
    },
  });
}
