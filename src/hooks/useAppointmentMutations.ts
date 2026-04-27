import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  completeProviderAppointment,
  confirmProviderAppointment,
  rejectProviderAppointment,
} from "@/api/appointments";

function useAppointmentMutation(
  mutationFn: (appointmentId: string) => Promise<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useConfirmAppointmentMutation() {
  return useAppointmentMutation(confirmProviderAppointment);
}

export function useRejectAppointmentMutation() {
  return useAppointmentMutation(rejectProviderAppointment);
}

export function useCompleteAppointmentMutation() {
  return useAppointmentMutation(completeProviderAppointment);
}
