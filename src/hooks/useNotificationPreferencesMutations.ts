import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateProviderNotificationPreferences,
  updateProviderPassword,
} from "@/api/settings";

export function useUpdateNotificationPreferencesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProviderNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });
    },
  });
}

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: updateProviderPassword,
  });
}
