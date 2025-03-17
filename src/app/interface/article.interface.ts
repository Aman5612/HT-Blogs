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
  featuredImage: string | null;
  metaTitle?: string;
  metaDescription?: string;
}

export interface BlogListItem extends Article {
  // Additional properties specific to list view can be added here
}
