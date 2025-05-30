export interface Article {
  id: string;
  title: string;
  content?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  media: {
    url: string;
    type: string;
  }[];
  keywords?: string;
  featureImage: string;
  featureImageAlt?: string;
  featuredImage?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  packageIds?: string[];
  excerpt?: string;
  slug?: string;
  author?: {
    id: string;
    name: string;
  };
}

export interface BlogListItem extends Article {
  // Additional properties specific to list view can be added here
}
