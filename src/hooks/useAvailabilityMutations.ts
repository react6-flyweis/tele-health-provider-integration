import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateProviderAvailabilitySchedule,
  updateProviderBlockedDates,
  updateProviderSessionTypes,
} from "@/api/availability";

export function useUpdateAvailabilityScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProviderAvailabilitySchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
}

export function useUpdateAvailabilitySessionTypesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProviderSessionTypes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
}

export function useUpdateAvailabilityBlockedDatesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProviderBlockedDates,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
}
