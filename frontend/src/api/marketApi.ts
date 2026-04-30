import api from './axiosConfig';
import type { components } from './generated/schema';

export type ScraperResult = components['schemas']['ScraperProductResult'];
export type ScraperResponse = components['schemas']['ScraperResponse'];

export const marketApi = {
  search: (keyword: string) =>
    api.get<ScraperResponse>('/scraper/search', { params: { keyword } }).then((r) => r.data),
};
