import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil } from "lucide-react";
import { getProviderPatientDetail } from "@/api/patients";
import type { Patient } from "@/components/patients/EditPatientDialog";

type PatientListItem = Patient & {
  backendId: string;
};

interface PatientDetailSectionProps {
  selectedPatient: PatientListItem | null;
  listErrorMessage: string | null;
  onEdit: () => void;
}

function toTitleCase(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PatientDetailSection({
  selectedPatient,
  listErrorMessage,
  onEdit,
}: PatientDetailSectionProps) {
  const [notePrescriptions, setNotePrescriptions] = React.useState<
    Record<string, string>
  >({});

  const {
    data: patientDetailData,
    isLoading: isPatientDetailLoading,
    isError: isPatientDetailError,
    error: patientDetailError,
    isFetching: isPatientDetailFetching,
  } = useQuery({
    queryKey: ["providerPatientDetail", selectedPatient?.backendId],
    queryFn: () => getProviderPatientDetail(selectedPatient!.backendId),
    enabled: Boolean(selectedPatient?.backendId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const detailErrorMessage = isPatientDetailError
    ? patientDetailError instanceof Error
      ? patientDetailError.message
      : "Unable to load patient details."
    : null;

  const patientDetail = patientDetailData?.patient;
  const detailMedicalHistory =
    patientDetail?.medicalHistory?.filter(Boolean).join(", ") ||
    selectedPatient?.medicalHistory ||
    "-";
  const detailConsultations = (patientDetailData?.appointments || []).filter(
    (appointment) => appointment.notes?.trim(),
  );

  return (
    <Card className="py-4">
      <CardContent className="space-y-5">
        {!selectedPatient ? (
          <div className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
            {listErrorMessage
              ? "Unable to show patient details."
              : "Select a patient to view records."}
          </div>
        ) : isPatientDetailLoading || isPatientDetailFetching ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : detailErrorMessage ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {detailErrorMessage}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-3xl font-semibold leading-none text-slate-800">
                  {selectedPatient.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Patient ID: {selectedPatient.id}
                </p>
              </div>

              <Button
                className="bg-gradient-dash text-white hover:opacity-95"
                onClick={onEdit}
              >
                <Pencil className="size-4" />
                Edit Record
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-md bg-muted/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="mt-1 text-sm text-slate-800">
                  {(patientDetail?.age ?? selectedPatient.age) > 0
                    ? `${patientDetail?.age ?? selectedPatient.age} years`
                    : "-"}
                </p>
              </div>
              <div className="rounded-md bg-muted/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="mt-1 text-sm text-slate-800">
                  {toTitleCase(patientDetail?.gender) ||
                    selectedPatient.gender ||
                    "-"}
                </p>
              </div>
              <div className="rounded-md bg-muted/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="mt-1 text-sm text-slate-800">
                  {patientDetail?.phone || selectedPatient.phone || "-"}
                </p>
              </div>
              <div className="rounded-md bg-muted/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="mt-1 text-sm text-slate-800">
                  {patientDetail?.email || selectedPatient.email || "-"}
                </p>
              </div>
            </div>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-800">
                Medical History
              </h3>
              <div className="rounded-md bg-muted/50 px-4 py-3 text-sm text-slate-700">
                {detailMedicalHistory}
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-800">
                Current Diagnosis
              </h3>
              <div className="rounded-md border-l-4 border-teal-500 bg-slate-100 px-4 py-3 text-sm text-slate-800">
                {patientDetail?.currentDiagnosis ||
                  selectedPatient.currentDiagnosis ||
                  "-"}
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-800">
                Treatment Plan
              </h3>
              <div className="rounded-md bg-muted/50 px-4 py-3 text-sm text-slate-700">
                {patientDetail?.treatmentPlan ||
                  selectedPatient.treatmentPlan ||
                  "-"}
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-800">
                Current Medications
              </h3>
              <div className="rounded-md bg-amber-50 px-4 py-3 text-sm text-slate-800">
                {patientDetail?.currentMedications ||
                  selectedPatient.currentMedications ||
                  "-"}
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-800">
                Consultation Notes
              </h3>

              <div className="space-y-2">
                {detailConsultations.length === 0 ? (
                  <div className="rounded-md bg-muted/50 px-4 py-3 text-sm text-slate-700">
                    No consultation notes available.
                  </div>
                ) : (
                  detailConsultations.map((entry) => (
                    <div
                      key={entry._id}
                      className="rounded-md border px-4 py-3"
                    >
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.date)}
                      </p>
                      <p className="mt-2 text-sm text-slate-700">
                        {entry.notes}
                      </p>

                      <textarea
                        className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="Write prescription here..."
                        value={notePrescriptions[entry._id] || ""}
                        onChange={(e) =>
                          setNotePrescriptions((prev) => ({
                            ...prev,
                            [entry._id]: e.target.value,
                          }))
                        }
                      />
                      <Button
                        className="mt-2 bg-gradient-dash text-white hover:opacity-95"
                        onClick={() => {
                          const prescription =
                            notePrescriptions[entry._id]?.trim();
                          if (prescription) {
                            console.log(
                              "Prescription for",
                              entry._id,
                              ":",
                              prescription,
                            );
                            setNotePrescriptions((prev) => ({
                              ...prev,
                              [entry._id]: "",
                            }));
                          }
                        }}
                      >
                        Send
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
}
