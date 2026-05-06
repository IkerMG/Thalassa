import { useMutation } from '@tanstack/react-query';
import type { WishlistItem } from '../../api/wishlistApi';
import { wishlistApi } from '../../api/wishlistApi';
import { wishlistQueryKey } from '../queries/useWishlist';
import queryClient from '../../lib/queryClient';
import { toast } from '../../lib/toast';

export function useRemoveWishlistItem() {
  return useMutation({
    mutationFn: (id: number) => wishlistApi.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: wishlistQueryKey });
      const previous = queryClient.getQueryData<WishlistItem[]>(wishlistQueryKey);
      if (previous) {
        queryClient.setQueryData(
          wishlistQueryKey,
          previous.filter((item) => item.id !== id)
        );
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(wishlistQueryKey, context.previous);
      }
      toast.error('No se pudo eliminar el item.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: wishlistQueryKey });
    },
  });
}
