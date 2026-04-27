import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Plus, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import NewPrescriptionDialog from "@/components/prescriptions/NewPrescriptionDialog";
import PrescriptionDetailsDialog from "@/components/prescriptions/PrescriptionDetailsDialog";
import {
  getProviderPrescriptionDetail,
  getProviderPrescriptions,
  type ProviderPrescription,
  type ProviderPrescriptionProvider,
} from "@/api/prescriptions";
import { usePageTitle } from "@/store/pageTitleStore";

type PrescriptionStatus = "active" | "refill requested" | "completed";

interface Prescription {
  id: number;
  backendId?: string;
  patientCode?: string;
  name: string;
  initials: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  date: string;
  status: PrescriptionStatus;
  specialInstructions?: string;
  providerName?: string;
  providerSpecialty?: string;
  providerLicenseNumber?: string;
  providerImageUrl?: string;
}

type ActivityTone = "success" | "warning";

interface RecentActivityItem {
  id: string;
  title: string;
  detail: string;
  tone: ActivityTone;
}

const statusColorMap: Record<PrescriptionStatus, string> = {
  active: "bg-green-100 text-green-800",
  "refill requested": "bg-yellow-100 text-yellow-800",
  completed: "bg-gray-100 text-gray-700",
};

function formatDate(isoDate: string) {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getNumericIdFromPatientCode(patientCode?: string) {
  if (!patientCode) {
    return null;
  }

  const numeric = Number(patientCode.replace(/\D/g, ""));

  if (Number.isNaN(numeric) || numeric <= 0) {
    return null;
  }

  return numeric;
}

function mapPrescriptionFromApi(
  item: ProviderPrescription,
  index: number,
): Prescription {
  const firstName = item.patientId?.firstName || "Unknown";
  const lastName = item.patientId?.lastName || "Patient";
  const name = `${firstName} ${lastName}`.trim();
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
  const medication = item.medications?.[0];

  const provider = typeof item.providerId === "string" ? null : item.providerId;

  return {
    id: getNumericIdFromPatientCode(item.patientId?.patientCode) ?? index + 1,
    backendId: item._id,
    patientCode: item.patientId?.patientCode,
    name,
    initials,
    medication: medication?.name || "-",
    dosage: medication?.dosage || "-",
    frequency: medication?.frequency || "-",
    duration: medication?.duration || "-",
    date: formatDate(item.date),
    status: item.status,
    specialInstructions: item.instructions,
    providerName: provider
      ? `${provider.firstName || ""} ${provider.lastName || ""}`.trim()
      : undefined,
    providerSpecialty: provider?.specialty,
    providerLicenseNumber: provider?.licenseNumber,
    providerImageUrl: provider?.profileImageUrl,
  };
}

function mapPrescriptionDetailFromApi(
  item: ProviderPrescription,
): Prescription {
  const mapped = mapPrescriptionFromApi(item, 0);
  const provider =
    typeof item.providerId === "string"
      ? null
      : (item.providerId as ProviderPrescriptionProvider);

  return {
    ...mapped,
    providerName: provider
      ? `${provider.firstName || ""} ${provider.lastName || ""}`.trim()
      : mapped.providerName,
    providerSpecialty: provider?.specialty,
    providerLicenseNumber: provider?.licenseNumber,
    providerImageUrl: provider?.profileImageUrl,
  };
}

export default function PrescriptionsPage() {
  usePageTitle("Prescriptions");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["providerPrescriptions"],
    queryFn: getProviderPrescriptions,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const apiPrescriptions = useMemo(
    () => (data?.prescriptions || []).map(mapPrescriptionFromApi),
    [data],
  );

  const prescriptions = useMemo(() => apiPrescriptions, [apiPrescriptions]);

  const recentActivity = useMemo<RecentActivityItem[]>(() => {
    return prescriptions.slice(0, 2).map((item, index) => ({
      id: `${item.id}-${index}`,
      title: `Prescription sent to ${item.name}`,
      detail: `${item.medication} ${item.dosage} • ${item.date}`,
      tone: item.status === "active" ? "success" : "warning",
    }));
  }, [prescriptions]);

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "Unable to load prescriptions."
    : null;

  const {
    data: detailData,
    isLoading: isDetailLoading,
    isError: isDetailError,
    error: detailError,
  } = useQuery({
    queryKey: ["providerPrescriptionDetail", selectedPrescription?.backendId],
    queryFn: () =>
      getProviderPrescriptionDetail(selectedPrescription!.backendId!),
    enabled: detailsOpen && Boolean(selectedPrescription?.backendId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const detailErrorMessage = isDetailError
    ? detailError instanceof Error
      ? detailError.message
      : "Unable to load prescription details."
    : null;

  const dialogPrescription = useMemo(() => {
    if (detailData?.prescription) {
      return mapPrescriptionDetailFromApi(detailData.prescription);
    }

    return selectedPrescription;
  }, [detailData, selectedPrescription]);

  function handleViewPrescription(prescription: Prescription) {
    setSelectedPrescription(prescription);
    setDetailsOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-semibold text-slate-800">
          Prescription Management
        </h2>

        <Button
          className="bg-gradient-dash text-white hover:opacity-95"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="size-4" />
          New Prescription
        </Button>
        <NewPrescriptionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="h-11 px-4 text-[11px] tracking-wide uppercase text-muted-foreground">
                Patient
              </TableHead>
              <TableHead className="h-11 px-4 text-[11px] tracking-wide uppercase text-muted-foreground">
                Medication
              </TableHead>
              <TableHead className="h-11 px-4 text-[11px] tracking-wide uppercase text-muted-foreground">
                Dosage
              </TableHead>
              <TableHead className="h-11 px-4 text-[11px] tracking-wide uppercase text-muted-foreground">
                Frequency
              </TableHead>
              <TableHead className="h-11 px-4 text-[11px] tracking-wide uppercase text-muted-foreground">
                Duration
              </TableHead>
              <TableHead className="h-11 px-4 text-[11px] tracking-wide uppercase text-muted-foreground">
                Date
              </TableHead>
              <TableHead className="h-11 px-4 text-[11px] tracking-wide uppercase text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="h-11 px-4 text-right text-[11px] tracking-wide uppercase text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading || isFetching ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={`prescription-skeleton-${index}`}>
                  <TableCell colSpan={8} className="px-4 py-3">
                    <Skeleton className="h-9 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : errorMessage ? (
              <TableRow>
                <TableCell colSpan={8} className="px-4 py-4">
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                </TableCell>
              </TableRow>
            ) : prescriptions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  No prescriptions found.
                </TableCell>
              </TableRow>
            ) : (
              prescriptions.map((prescription, index) => (
                <TableRow
                  key={`${prescription.id}-${index}`}
                  className="hover:bg-muted/40"
                >
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 bg-slate-200 text-slate-600">
                        <AvatarFallback>{prescription.initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-slate-700">
                        {prescription.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-slate-700">
                    {prescription.medication}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {prescription.dosage}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {prescription.frequency}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {prescription.duration}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                      {new Date(prescription.date).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  })}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      className={cn(
                        "border-0",
                        statusColorMap[prescription.status],
                      )}
                    >
                      {prescription.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label="send prescription"
                        className="rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100"
                      >
                        <Send className="size-3.5" />
                      </Button>
                      <Button
                        variant="link"
                        className="h-auto px-0 text-cyan-700"
                        onClick={() => handleViewPrescription(prescription)}
                      >
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Card className="py-0">
        <CardHeader className="border-b py-4">
          <CardTitle className="text-base font-semibold">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 py-4">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recent prescription activity yet.
            </p>
          ) : (
            recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg bg-muted/40 px-4 py-3"
              >
                <span
                  className={cn(
                    "mt-1.5 inline-block size-1.5 rounded-full",
                    item.tone === "success" ? "bg-green-500" : "bg-yellow-500",
                  )}
                />
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <PrescriptionDetailsDialog
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) {
            setSelectedPrescription(null);
          }
        }}
        prescription={dialogPrescription}
        isLoading={isDetailLoading}
        errorMessage={detailErrorMessage}
      />
    </div>
  );
}
