import { useState } from "react";
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
import NewPrescriptionDialog, {
  type NewPrescriptionData,
} from "@/components/prescriptions/NewPrescriptionDialog";
import PrescriptionDetailsDialog from "@/components/prescriptions/PrescriptionDetailsDialog";

type PrescriptionStatus = "active" | "refill requested" | "completed";

interface Prescription {
  id: number;
  name: string;
  initials: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  date: string;
  status: PrescriptionStatus;
  specialInstructions?: string;
}

const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 1,
    name: "John Doe",
    initials: "J",
    medication: "Sertraline",
    dosage: "50mg",
    frequency: "Once daily",
    duration: "30 days",
    date: "Feb 1, 2026",
    status: "active",
  },
  {
    id: 2,
    name: "Emily Smith",
    initials: "E",
    medication: "Escitalopram",
    dosage: "10mg",
    frequency: "Once daily",
    duration: "30 days",
    date: "Jan 30, 2026",
    status: "active",
  },
  {
    id: 3,
    name: "Michael Brown",
    initials: "M",
    medication: "Alprazolam",
    dosage: "0.5mg",
    frequency: "As needed",
    duration: "15 days",
    date: "Jan 28, 2026",
    status: "refill requested",
  },
  {
    id: 4,
    name: "Sarah Johnson",
    initials: "S",
    medication: "Fluoxetine",
    dosage: "20mg",
    frequency: "Once daily",
    duration: "30 days",
    date: "Jan 25, 2026",
    status: "completed",
  },
];

const RECENT_ACTIVITY = [
  {
    id: 1,
    title: "Prescription sent to John Doe",
    detail: "Sertraline 50mg • Feb 1, 2026",
    tone: "success",
  },
  {
    id: 2,
    title: "Refill request from Michael Brown",
    detail: "Alprazolam 0.5mg • Jan 28, 2026",
    tone: "warning",
  },
] as const;

const statusColorMap: Record<PrescriptionStatus, string> = {
  active: "bg-green-100 text-green-800",
  "refill requested": "bg-yellow-100 text-yellow-800",
  completed: "bg-gray-100 text-gray-700",
};

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(
    INITIAL_PRESCRIPTIONS,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);

  function computeInitials(name: string) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }

  function handleCreate(data: NewPrescriptionData) {
    const nextId =
      prescriptions.length > 0
        ? Math.max(...prescriptions.map((p) => p.id)) + 1
        : 1;
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const newPres: Prescription = {
      id: nextId,
      name: data.patient,
      initials: computeInitials(data.patient),
      medication: data.medication,
      dosage: data.dosage,
      frequency: data.frequency,
      duration: data.duration,
      date: formattedDate,
      status: "active",
      specialInstructions: data.specialInstructions,
    };
    setPrescriptions((prev) => [newPres, ...prev]);
  }

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
        <NewPrescriptionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onCreate={handleCreate}
        />
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
            {prescriptions.map((prescription) => (
              <TableRow key={prescription.id} className="hover:bg-muted/40">
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
                  {prescription.date}
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
            ))}
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
          {RECENT_ACTIVITY.map((item) => (
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
          ))}
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
        prescription={selectedPrescription}
      />
    </div>
  );
}
