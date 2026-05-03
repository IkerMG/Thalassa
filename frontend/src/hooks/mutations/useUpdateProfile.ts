import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, type UpdateUserRequest } from '../../api/userApi';
import { userProfileQueryKey } from '../queries/useUserProfile';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => userApi.updateProfile(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(userProfileQueryKey, updated);
    },
  });
}
