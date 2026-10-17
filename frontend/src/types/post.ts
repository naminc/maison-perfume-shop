export type PostStatus = "draft" | "published";

export type PostStatusFilter = PostStatus | "all";

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category: string | null;
  status: PostStatus;
  published_at: string | null;
  read_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface PostListParams {
  category?: string;
  page?: number;
  per_page?: number;
}

export interface AdminPostListParams extends PostListParams {
  search?: string;
  status?: PostStatusFilter;
}

export interface PostListResponse {
  data: Post[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PostPayload {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  category?: string;
  status: PostStatus;
  published_at?: string;
  read_minutes?: number;
}
