import api from './axiosConfig';
import type { components } from './generated/schema';

// The backend serializes these fields as snake_case. No camelCase transformer is
// present in axiosConfig, so the raw JSON keys arrive at runtime unchanged.
type ScraperProductResultRaw = {
  name?: string;
  price?: number;
  img_url?: string | null;
  product_url?: string;
  store_name?: string;
};

export type ScraperResult = ScraperProductResultRaw;
export type ScraperResponse = Omit<components['schemas']['ScraperResponse'], 'results'> & {
  results?: ScraperResult[];
};

export const marketApi = {
  search: (keyword: string) =>
    api.get<ScraperResponse>('/scraper/search', { params: { keyword } }).then((r) => r.data),
};
