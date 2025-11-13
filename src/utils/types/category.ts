export type TCategory = {
  id: number | string;
  name: string;
  children?: TCategory[];
};

export type TCategoryListResponse = {
  count: number;
  categories: TCategory[];
};

export type TCreateCategoryPayload = {
  name: string;
  parentId?: number | string | null;
};

export type TUpdateCategoryPayload = {
  id: number | string;
  name?: string;
  parentId?: number | string | null;
};
