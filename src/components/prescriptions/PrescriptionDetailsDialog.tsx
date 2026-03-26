import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CalendarDays, FileText, Pill, UserRound } from "lucide-react";

type PrescriptionStatus = "active" | "refill requested" | "completed";

export interface PrescriptionDetailsData {
  id: number;
  patientCode?: string;
  name: string;
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

interface PrescriptionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: PrescriptionDetailsData | null;
  isLoading?: boolean;
  errorMessage?: string | null;
}

const statusColorMap: Record<PrescriptionStatus, string> = {
  active: "bg-green-100 text-green-800",
  "refill requested": "bg-yellow-100 text-yellow-800",
  completed: "bg-gray-100 text-gray-700",
};

const DEFAULT_SPECIAL_INSTRUCTIONS =
  "Take medication with food. Avoid alcohol consumption. Do not drive or operate heavy machinery until you know how this medication affects you. Contact your doctor if you experience any severe side effects.";

function formatPatientId(id: number) {
  return `#PT${id.toString().padStart(6, "0")}`;
}

function getInitials(fullName?: string) {
  if (!fullName) {
    return "NA";
  }

  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "NA";
  }

  return parts
    .slice(0, 2)
    .map((value) => value[0]?.toUpperCase() ?? "")
    .join("");
}

export default function PrescriptionDetailsDialog({
  open,
  onOpenChange,
  prescription,
  isLoading = false,
  errorMessage = null,
}: PrescriptionDetailsDialogProps) {
  if (!prescription && !isLoading && !errorMessage) return null;

  const patientId = prescription?.patientCode
    ? `#${prescription.patientCode.replace(/^#/, "")}`
    : formatPatientId(prescription?.id ?? 0);

  const providerName = prescription?.providerName || "Provider";
  const providerSpecialty =
    prescription?.providerSpecialty || "Clinical Psychologist";
  const providerLicense = prescription?.providerLicenseNumber;
  const providerInitials = getInitials(providerName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl gap-0 overflow-y-auto p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-xl font-semibold text-slate-800">
            Prescription Details
          </DialogTitle>
          <DialogDescription>
            View complete prescription information
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-6 px-6 py-5">
            <section className="space-y-3">
              <Skeleton className="h-5 w-44" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </section>

            <section className="space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </section>

            <section className="space-y-3">
              <Skeleton className="h-5 w-44" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </section>

            <section className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-24 w-full" />
            </section>

            <section className="space-y-3">
              <Skeleton className="h-6 w-44" />
              <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-4">
                <Skeleton className="size-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </section>
          </div>
        ) : errorMessage ? (
          <div className="px-6 py-5">
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          </div>
        ) : prescription ? (
          <div className="space-y-6 px-6 py-5">
            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-base font-semibold text-slate-700">
                <UserRound className="size-4 text-emerald-600" />
                Patient Information
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Patient Name</p>
                  <p className="text-lg font-medium text-slate-700">
                    {prescription.name}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Patient ID</p>
                  <p className="text-lg font-medium text-slate-700">
                    {patientId}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-base font-semibold text-slate-700">
                <Pill className="size-4 text-emerald-600" />
                Medication Details
              </h3>
              <div className="rounded-lg border-l-4 border-emerald-600 bg-blue-50 p-4">
                <p className="text-sm text-muted-foreground">Medication Name</p>
                <p className="text-lg font-semibold text-slate-700">
                  {prescription.medication}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Dosage</p>
                  <p className="text-lg text-slate-700">
                    {prescription.dosage}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Frequency</p>
                  <p className="text-lg text-slate-700">
                    {prescription.frequency}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-lg text-slate-700">
                    {prescription.duration}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-base font-semibold text-slate-700">
                <CalendarDays className="size-5 text-emerald-600" />
                Prescription Information
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Issue Date</p>
                  <p className="text-lg text-slate-700">{prescription.date}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    className={cn(
                      "mt-1 border-0",
                      statusColorMap[prescription.status],
                    )}
                  >
                    {prescription.status}
                  </Badge>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-base font-semibold text-slate-700">
                <FileText className="size-5 text-primary" />
                Special Instructions
              </h3>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm leading-5 text-slate-600">
                  {prescription.specialInstructions ||
                    DEFAULT_SPECIAL_INSTRUCTIONS}
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-700">
                Prescribing Provider
              </h3>
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="size-15">
                    <AvatarFallback>{providerInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-medium text-slate-700">
                      {providerName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {providerSpecialty}
                    </p>
                    {providerLicense ? (
                      <p className="text-sm text-muted-foreground">
                        License: {providerLicense}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button
            className="bg-gradient-dash text-white hover:opacity-95"
            onClick={() => window.print()}
          >
            Print Prescription
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
