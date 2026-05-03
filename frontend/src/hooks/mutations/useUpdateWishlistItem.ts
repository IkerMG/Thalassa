import { useMutation } from '@tanstack/react-query';
import { wishlistApi, type WishlistUpdateRequest } from '../../api/wishlistApi';
import { wishlistQueryKey } from '../queries/useWishlist';
import queryClient from '../../lib/queryClient';
import { toast } from '../../lib/toast';

export function useUpdateWishlistItem() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: WishlistUpdateRequest }) =>
      wishlistApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistQueryKey });
      toast.success('Wishlist actualizada.');
    },
    onError: () => {
      toast.error('No se pudo actualizar el item.');
    },
  });
}
