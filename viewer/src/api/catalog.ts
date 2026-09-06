const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ArtworkDTO {
  type: string;
  url: string;
  width: number;
  height: number;
}

export interface EpisodeVariant {
  language: string;
  title: string;
  description?: string;
  video_url?: string;
  artwork: ArtworkDTO[];
}

export interface CollapsedEpisode {
  content_group: string;
  episode_number: number;
  title: string;
  description?: string;
  duration_seconds: number;
  languages: string[];
  default_language: string;
  artwork: {
    thumbnail?: string;
    banner?: string;
    poster?: string;
  };
  variants: EpisodeVariant[];
}

export interface CatalogueSeason {
  season_number: number;
  title?: string;
  episodes: CollapsedEpisode[];
}

export interface CatalogueShow {
  id: number;
  title: string;
  description?: string;
  section: string;
  category: string;
  poster_url?: string;
  banner_url?: string;
  available_languages: string[];
  seasons: CatalogueSeason[];
  trailers: CollapsedEpisode[];
}

export interface CatalogueFile {
  version: string;
  generated_at: string;
  sections: string[];
  categories: string[];
  languages: string[];
  shows: CatalogueShow[];
}

export interface CatalogSearchResult {
  total: number;
  query?: string;
  category?: string;
  language?: string;
  section?: string;
  shows: CatalogueShow[];
}

export function resolveMediaUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_URL}${path}`;
}

export const catalogApi = {
  // Reads ONLY the published catalogue file
  getCatalogue: async (): Promise<CatalogueFile> => {
    const res = await fetch(`${API_URL}/catalog`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Catalogue has not been published yet. Please run publish from the CMS dashboard.');
      }
      throw new Error(`Failed to load catalog: ${res.statusText}`);
    }
    return res.json();
  },

  // Search and compose filters
  searchCatalogue: async (params: {
    q?: string;
    category?: string;
    language?: string;
    section?: string;
  }): Promise<CatalogSearchResult> => {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.category) query.set('category', params.category);
    if (params.language) query.set('language', params.language);
    if (params.section) query.set('section', params.section);

    const res = await fetch(`${API_URL}/catalog/search?${query.toString()}`);
    if (!res.ok) {
      throw new Error(`Search failed: ${res.statusText}`);
    }
    return res.json();
  },
};
