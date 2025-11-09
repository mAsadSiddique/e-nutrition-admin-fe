export type TBlogStatus = "Draft" | "Published" | "Scheduled";

export type TBlog = {
  id: string;
  title: string;
  slug: string;
  subheading?: string;
  category?: string;
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
  title: string;
  subheading?: string;
  slug: string;
  category: string;
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

