import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, FileText, User } from "lucide-react";
import type { Appointment } from "./AppointmentTable";

const statusColorMap: Record<Appointment["status"], string> = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment;
}

export default function AppointmentDialog({
  open,
  onOpenChange,
  appointment,
}: AppointmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Appointment Details</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 bg-slate-200 text-slate-600">
            <AvatarFallback>{appointment.initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-base">{appointment.name}</p>
            {appointment.patientId && (
              <p className="text-sm text-muted-foreground">
                Patient ID:{" "}
                {appointment.patientId.startsWith("#")
                  ? appointment.patientId
                  : `#${appointment.patientId}`}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
          {/* Date card */}
          <div className="bg-gray-50 rounded-lg p-3 flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Date
              </p>
              <p>
                  {new Date(appointment.date).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  })}
              </p>
            </div>
          </div>
          {/* Time card */}
          <div className="bg-gray-50 rounded-lg p-3 flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Time
              </p>
              <p>{appointment.time}</p>
            </div>
          </div>
          {/* Type card */}
          <div className="bg-gray-50 rounded-lg p-3 flex items-start gap-3">
            <FileText className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Type
              </p>
              <p>{appointment.type}</p>
            </div>
          </div>
          {/* Status card */}
          <div className="bg-gray-50 rounded-lg p-3 flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-1" />
            <div className="flex flex-col">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Status
              </p>
              <Badge
                className={`${statusColorMap[appointment.status]} px-2 py-1 text-xs`}
              >
                {appointment.status}
              </Badge>
            </div>
          </div>
        </div>

        {appointment.reason && (
          <div className="mt-4">
            <p className="text-sm font-medium">Reason for Visit</p>
            <p className="text-sm text-muted-foreground">
              {appointment.reason}
            </p>
          </div>
        )}

        <div className="mt-4">
          <p className="text-sm font-medium">Notes</p>
          <Textarea
            className="mt-1 h-24"
            placeholder="Add appointment notes..."
            defaultValue={appointment.notes}
          />
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
