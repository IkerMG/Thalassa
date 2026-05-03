import api from './axiosConfig';
import type { components } from './generated/schema';

export type WishlistItem = components['schemas']['WishlistItemResponse'];
export type WishlistItemRequest = components['schemas']['WishlistItemRequest'];
export type WishlistUpdateRequest = components['schemas']['WishlistUpdateRequest'];
export type WishlistCategory = components['schemas']['WishlistCategory'];
export type WishlistPriority = components['schemas']['WishlistPriority'];

export const wishlistApi = {
  list: () =>
    api.get<WishlistItem[]>('/wishlist').then((r) => r.data),

  add: (data: WishlistItemRequest) =>
    api.post<WishlistItem>('/wishlist', data).then((r) => r.data),

  update: (id: number, data: WishlistUpdateRequest) =>
    api.put<WishlistItem>(`/wishlist/${id}`, data).then((r) => r.data),

  remove: (id: number) =>
    api.delete(`/wishlist/${id}`),
};
