import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { usePageTitle } from "@/store/pageTitleStore";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import EditPatientDialog, {
  type Patient,
} from "@/components/patients/EditPatientDialog";
import { getProviderPatients } from "@/api/patients";
import PatientDetailSection from "@/components/patients/PatientDetailSection";

type PatientListItem = Patient & {
  backendId: string;
};

function toTitleCase(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function getAgeFromDateOfBirth(dateOfBirth?: string) {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
}

export default function PatientRecordsPage() {
  usePageTitle("Patient Records");

  const [patients, setPatients] = React.useState<PatientListItem[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedPatientId, setSelectedPatientId] = React.useState<
    string | null
  >(null);
  const [editOpen, setEditOpen] = React.useState(false);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["providerPatients"],
    queryFn: getProviderPatients,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  React.useEffect(() => {
    if (!data?.patients) {
      return;
    }

    const mappedPatients: PatientListItem[] = data.patients.map((entry) => {
      const firstName = entry.patient.firstName || "Unknown";
      const lastName = entry.patient.lastName || "Patient";
      const combinedName = `${firstName} ${lastName}`.trim();
      const resolvedAge =
        entry.age ?? getAgeFromDateOfBirth(entry.patient.dateOfBirth);

      return {
        backendId: entry.patient._id,
        id: entry.patient.patientCode
          ? `#${entry.patient.patientCode.replace(/^#/, "")}`
          : entry.patient._id,
        name: combinedName,
        initials: `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase(),
        age: resolvedAge ?? 0,
        sessions: entry.sessionCount,
        gender: toTitleCase(entry.patient.gender),
        phone: entry.patient.phone,
        email: entry.patient.email,
      };
    });

    setPatients(mappedPatients);
  }, [data]);

  const filteredPatients = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return patients;
    }

    return patients.filter((patient) =>
      [patient.name, patient.email, patient.id]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearch)),
    );
  }, [patients, searchTerm]);

  React.useEffect(() => {
    if (filteredPatients.length === 0) {
      setSelectedPatientId(null);
      return;
    }

    const hasCurrentSelection = filteredPatients.some(
      (patient) => patient.backendId === selectedPatientId,
    );

    if (!hasCurrentSelection) {
      setSelectedPatientId(filteredPatients[0].backendId);
    }
  }, [filteredPatients, selectedPatientId]);

  const selectedPatient =
    filteredPatients.find(
      (patient) => patient.backendId === selectedPatientId,
    ) ?? null;

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "Unable to load patients."
    : null;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_1fr]">
      <Card className="py-3">
        <CardContent className="space-y-3">
          <InputGroup className="h-10 border bg-muted/70 shadow-none">
            <InputGroupAddon className="pl-3">
              <Search className="size-4 text-muted-foreground" />
            </InputGroupAddon>

            <InputGroupInput
              placeholder="Search patients..."
              className="pr-3"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </InputGroup>

          <div className="space-y-1">
            {isLoading || isFetching ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={`patient-skeleton-${index}`} className="px-3 py-2">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))
            ) : errorMessage ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : filteredPatients.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                No patients found.
              </p>
            ) : (
              filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => setSelectedPatientId(patient.backendId)}
                  className={`w-full rounded-lg px-3 py-2 text-left ${
                    patient.backendId === selectedPatientId
                      ? "bg-slate-100"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 bg-slate-200 text-slate-600">
                      <AvatarFallback>{patient.initials}</AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {patient.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {patient.age > 0 ? `${patient.age} years` : "-"} •{" "}
                        {patient.sessions} sessions
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <PatientDetailSection
        selectedPatient={selectedPatient}
        listErrorMessage={errorMessage}
        onEdit={() => setEditOpen(true)}
      />

      {/* edit dialog instance */}
      {selectedPatient && (
        <EditPatientDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          patient={selectedPatient}
          onSave={(updated) => {
            setPatients((prev) =>
              prev.map((patient) =>
                patient.id === updated.id
                  ? { ...patient, ...updated }
                  : patient,
              ),
            );
          }}
        />
      )}
    </div>
  );
}
