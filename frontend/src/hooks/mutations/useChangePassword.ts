import { useMutation } from '@tanstack/react-query';
import { userApi, type ChangePasswordRequest } from '../../api/userApi';

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => userApi.changePassword(data),
  });
}
