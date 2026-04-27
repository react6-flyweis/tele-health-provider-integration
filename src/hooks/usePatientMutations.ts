import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  type UpdateProviderPatientRecordPayload,
  updateProviderPatientRecord,
} from "@/api/patients";

interface UpdatePatientRecordMutationInput {
  patientId: string;
  payload: UpdateProviderPatientRecordPayload;
}

export function useUpdatePatientRecordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, payload }: UpdatePatientRecordMutationInput) =>
      updateProviderPatientRecord(patientId, payload),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["providerPatients"] }),
        queryClient.invalidateQueries({
          queryKey: ["providerPatientDetail", variables.patientId],
        }),
      ]);
    },
  });
}
