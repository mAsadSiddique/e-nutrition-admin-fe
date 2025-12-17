export type TBlogStatus = "draft" | "published" | "scheduled";

export type TBlog = {
  id: string;
  title: string;
  slug: string;
  subheading?: string;
  categories: number[];
  status: TBlogStatus;
  author?: string;
  excerpt?: string;
  content?: string;
  tags?: string[];
  coverImageUrl?: string;
  galleryImageUrls?: string[];
  views?: number;
  comments?: number;
  isFeatured?: boolean;
  readingTime?: number;
  createdAt: string;
  publishedAt?: string | null;
  updatedAt?: string;
};

export type TBlogListResponse = {
  count: number;
  blogs: TBlog[];
};

export type TCreateBlogPayload = {
  // Shared fields for create & update
  title: string;
  subheading?: string;
  slug: string;
  category: string;
  // Backend expects numeric category IDs array
  categoryIds?: number[];
  status: TBlogStatus;
  excerpt: string;
  tags: string[];
  content: string;
  coverImage?: File | null;
  galleryImages?: File[];
  isFeatured?: boolean;
  readingTime?: number | null;
  publishedAt?: string | null;
};

export type TUpdateBlogPayload = TCreateBlogPayload & {
  id: string;
};

export type TDeleteBlogPayload = {
  id: string;
};
