import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../api/userApi';

export const userProfileQueryKey = ['user', 'me'] as const;

export function useUserProfile() {
  return useQuery({
    queryKey: userProfileQueryKey,
    queryFn: userApi.getProfile,
  });
}
