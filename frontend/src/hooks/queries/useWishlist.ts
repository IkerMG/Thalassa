import { useQuery } from '@tanstack/react-query';
import { wishlistApi } from '../../api/wishlistApi';

export const wishlistQueryKey = ['wishlist'] as const;

export function useWishlist() {
  return useQuery({
    queryKey: wishlistQueryKey,
    queryFn: wishlistApi.list,
  });
}
