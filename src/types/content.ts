export interface ContentItem {
  id: number;
  title: string;
  year: number;
  genre: string[];
  rating: number;
  thumbnail: string;
  backdrop?: string;
  duration: number;
  description: string;
  cast: string[];
  watchProgress?: number;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  totalItems: number;
}

export interface ApiResponse {
  pagination: Pagination;
  categories: {
    trending: ContentItem[];
    forYou: ContentItem[];
    newReleases: ContentItem[];
  };
}

export interface WatchHistoryItem {
  id: number;
  progress: number;
  updatedAt: number;
}
