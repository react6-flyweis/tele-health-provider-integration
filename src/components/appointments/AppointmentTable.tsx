import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Check, X } from "lucide-react";
import {
  Table as ShadTable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export interface Appointment {
  id: number;
  patientId?: string;
  name: string;
  initials: string;
  date: string;
  time: string;
  type: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  reason?: string;
  notes?: string;
}

const statusColorMap: Record<Appointment["status"], string> = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

interface AppointmentTableProps {
  data: Appointment[];
  onDetails?: (appt: Appointment) => void;
}

export default function AppointmentTable({
  data,
  onDetails,
}: AppointmentTableProps) {
  return (
    <ShadTable>
      <TableHeader className="bg-gray-50 border-0">
        <TableRow>
          <TableHead>Patient</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((appt) => (
          <TableRow key={appt.id} className="hover:bg-muted/40">
            <TableCell className="py-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-8 bg-slate-200 text-slate-600">
                  <AvatarFallback>{appt.initials}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-slate-700">{appt.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {appt.date}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {appt.time}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {appt.type}
            </TableCell>
            <TableCell>
              <Badge
                className={`${statusColorMap[appt.status]} px-2 py-1 text-xs`}
              >
                {appt.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {appt.status === "pending" && (
                  <>
                    <Button
                      size="icon"
                      className="text-green-500 hover:bg-green-100 bg-green-50"
                      aria-label="confirm appointment"
                    >
                      <Check />
                    </Button>
                    <Button
                      size="icon"
                      className="text-red-500 hover:bg-red-100 bg-red-50"
                      aria-label="cancel appointment"
                    >
                      <X />
                    </Button>
                  </>
                )}
                <Button
                  size="icon"
                  className="text-blue-500 hover:bg-blue-100 bg-blue-50"
                  aria-label="view calendar"
                >
                  <Calendar />
                </Button>
                <Button
                  variant="link"
                  className=""
                  onClick={() => onDetails && onDetails(appt)}
                >
                  Details
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </ShadTable>
  );
}
