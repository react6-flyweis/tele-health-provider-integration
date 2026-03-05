import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  name: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  date: string;
  status: PrescriptionStatus;
  specialInstructions?: string;
}

interface PrescriptionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: PrescriptionDetailsData | null;
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

export default function PrescriptionDetailsDialog({
  open,
  onOpenChange,
  prescription,
}: PrescriptionDetailsDialogProps) {
  if (!prescription) return null;

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
                  {formatPatientId(prescription.id)}
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
                <p className="text-lg text-slate-700">{prescription.dosage}</p>
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
                  <AvatarFallback>SM</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-medium text-slate-700">
                    Dr. Sarah Mitchell
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Clinical Psychologist
                  </p>
                  <p className="text-sm text-muted-foreground">
                    License: PSY-12345-CA
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

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
