import { useMutation } from '@tanstack/react-query';
import { wishlistApi, type WishlistItemRequest } from '../../api/wishlistApi';
import { wishlistQueryKey } from '../queries/useWishlist';
import queryClient from '../../lib/queryClient';
import { toast } from '../../lib/toast';

export function useAddWishlistItem() {
  return useMutation({
    mutationFn: (data: WishlistItemRequest) => wishlistApi.add(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistQueryKey });
      toast.success('Añadido a tu wishlist.');
    },
    onError: () => {
      toast.error('No se pudo añadir el item.');
    },
  });
}
