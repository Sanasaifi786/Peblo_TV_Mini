const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface UserProfile {
  id: number;
  email: string;
  role: 'editor' | 'admin';
  created_at: string;
}

export interface Artwork {
  id: number;
  episode_id: number;
  type: 'poster' | 'banner' | 'thumbnail';
  url: string;
  width: number;
  height: number;
  file_size_bytes: number;
  created_at: string;
}

export interface Episode {
  id: number;
  season_id: number;
  title: string;
  description?: string;
  episode_number: number;
  content_group: string;
  language: string;
  duration_seconds: number;
  status: 'draft' | 'published' | 'archived';
  video_url?: string;
  artwork: Artwork[];
  created_at: string;
  updated_at: string;
}

export interface Season {
  id: number;
  show_id: number;
  season_number: number;
  title?: string;
  created_at: string;
  episodes: Episode[];
}

export interface Show {
  id: number;
  title: string;
  description?: string;
  section?: string;
  category?: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  seasons?: Season[];
}

export interface ValidationIssue {
  issue_type: string;
  severity: 'error' | 'warning';
  entity_type: 'show' | 'episode';
  entity_id: number;
  entity_title: string;
  show_id?: number;
  show_title?: string;
  message: string;
}

export interface ValidationReport {
  can_publish: boolean;
  total_issues: number;
  blocking_errors: number;
  warnings: number;
  grouped_issues: Record<string, ValidationIssue[]>;
  items: ValidationIssue[];
}

export interface PublishRun {
  id: number;
  triggered_by?: number;
  started_at: string;
  finished_at?: string;
  outcome: 'success' | 'failed';
  show_count: number;
  episode_count: number;
  error_message?: string;
  user_email?: string;
}

function getAuthToken(): string | null {
  return localStorage.getItem('peblo_token');
}

export function setAuthSession(token: string, role: string, email: string) {
  localStorage.setItem('peblo_token', token);
  localStorage.setItem('peblo_role', role);
  localStorage.setItem('peblo_email', email);
}

export function clearAuthSession() {
  localStorage.removeItem('peblo_token');
  localStorage.removeItem('peblo_role');
  localStorage.removeItem('peblo_email');
}

export function getCurrentUserRole(): string | null {
  return localStorage.getItem('peblo_role');
}

export function getCurrentUserEmail(): string | null {
  return localStorage.getItem('peblo_email');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, add application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearAuthSession();
    window.dispatchEvent(new Event('auth_expired'));
    throw new Error('Session expired. Please log in again.');
  }

  if (res.status === 204) {
    return {} as T;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data?.detail?.message || data?.detail || res.statusText || 'Request failed';
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }

  return data as T;
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    return request<{ access_token: string; role: string; email: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getMe: async () => request<UserProfile>('/auth/me'),

  // Shows
  getShows: async (params?: { q?: string; status?: string; category?: string; section?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.status) query.set('status', params.status);
    if (params?.category) query.set('category', params.category);
    if (params?.section) query.set('section', params.section);
    if (params?.page) query.set('page', String(params.page));
    return request<{ items: Show[]; total: number; page: number; page_size: number }>(`/admin/shows?${query.toString()}`);
  },

  getShow: async (id: number) => request<Show>(`/admin/shows/${id}`),

  createShow: async (payload: { title: string; description?: string; section?: string; category?: string; status: string }) => {
    return request<Show>('/admin/shows', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateShow: async (id: number, payload: Partial<Show>) => {
    return request<Show>(`/admin/shows/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteShow: async (id: number) => request<void>(`/admin/shows/${id}`, { method: 'DELETE' }),

  addSeason: async (showId: number, seasonNumber: number, title?: string) => {
    return request<Season>(`/admin/shows/${showId}/seasons`, {
      method: 'POST',
      body: JSON.stringify({ season_number: seasonNumber, title }),
    });
  },

  // Episodes
  createEpisode: async (payload: {
    season_id: number;
    title: string;
    description?: string;
    episode_number: number;
    content_group: string;
    language: string;
    duration_seconds: number;
    status: string;
    video_url?: string;
  }) => {
    return request<Episode>('/admin/episodes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateEpisode: async (id: number, payload: Partial<Episode>) => {
    return request<Episode>(`/admin/episodes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteEpisode: async (id: number) => request<void>(`/admin/episodes/${id}`, { method: 'DELETE' }),

  // Artwork
  uploadArtwork: async (episodeId: number, type: 'poster' | 'banner' | 'thumbnail', file: File) => {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);
    return request<Artwork>(`/admin/episodes/${episodeId}/artwork`, {
      method: 'POST',
      body: formData,
    });
  },

  deleteArtwork: async (artworkId: number) => request<void>(`/admin/artwork/${artworkId}`, { method: 'DELETE' }),

  // Publishing & Audit
  getValidationReport: async () => request<ValidationReport>('/admin/validation-report'),

  publishCatalog: async () => {
    return request<{
      success: boolean;
      publish_run_id: number;
      url: string;
      show_count: number;
      episode_count: number;
      started_at: string;
      finished_at: string;
    }>('/admin/catalog/publish', {
      method: 'POST',
    });
  },

  getPublishRuns: async () => request<PublishRun[]>('/admin/publish-runs'),
};
