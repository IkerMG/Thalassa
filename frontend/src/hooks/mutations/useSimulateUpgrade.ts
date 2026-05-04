import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../../api/userApi';
import { useAuthStore } from '../../store/authStore';
import { userProfileQueryKey } from '../queries/useUserProfile';

export function useSimulateUpgrade() {
  const queryClient = useQueryClient();
  const updateUser  = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: () => userApi.simulateUpgrade(),
    onSuccess: (updatedProfile) => {
      // Sync the auth store so every PlanGate / canCreate check reacts immediately
      updateUser({ plan: updatedProfile.subscriptionPlan as 'FREE' | 'REEFMASTER' });
      // Refresh the user profile cache so SettingsForm and any other
      // query subscriber also see the new plan without a full page reload
      queryClient.invalidateQueries({ queryKey: [...userProfileQueryKey] });
    },
  });
}
