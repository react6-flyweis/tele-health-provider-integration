import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/store/pageTitleStore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import AppointmentTable from "@/components/appointments/AppointmentTable";
import type { Appointment as TableAppointment } from "@/components/appointments/AppointmentTable";
import AppointmentDialog from "@/components/appointments/AppointmentDialog";
import {
  getProviderAppointments,
  type ProviderAppointment,
  type ProviderAppointmentStatus,
} from "@/api/appointments";
import {
  useCompleteAppointmentMutation,
  useConfirmAppointmentMutation,
  useRejectAppointmentMutation,
} from "@/hooks/useAppointmentMutations";

type AppointmentTab = "pending" | "confirmed" | "completed" | "cancelled";

function formatDate(isoDate: string) {
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function mapAppointmentFromApi(
  appointment: ProviderAppointment,
): TableAppointment {
  const initials = `${appointment.patientId.firstName?.[0] ?? ""}${
    appointment.patientId.lastName?.[0] ?? ""
  }`;

  return {
    id: appointment._id,
    patientId: appointment.patientId.patientCode
      ? `#${appointment.patientId.patientCode.replace(/^#/, "")}`
      : appointment.patientId._id,
    name: `${appointment.patientId.firstName} ${appointment.patientId.lastName}`,
    initials,
    date: formatDate(appointment.date),
    time: appointment.time,
    type: appointment.appointmentType || appointment.type || "Unknown",
    status: appointment.status,
    reason: appointment.reasonForVisit,
    notes: appointment.notes ?? "",
  };
}

export default function AppointmentsPage() {
  usePageTitle("Appointments");

  const [currentTab, setCurrentTab] = useState<AppointmentTab>("pending");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<TableAppointment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processingAppointmentId, setProcessingAppointmentId] = useState<
    string | null
  >(null);

  const statusParam: ProviderAppointmentStatus = currentTab;

  const confirmMutation = useConfirmAppointmentMutation();
  const rejectMutation = useRejectAppointmentMutation();
  const completeMutation = useCompleteAppointmentMutation();

  const handleMutation = (mutation: any, appointmentId: string) => {
    setProcessingAppointmentId(appointmentId);

    mutation.mutate(appointmentId, {
      onSettled: () => setProcessingAppointmentId(null),
    });
  };

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["appointments", statusParam, page],
    queryFn: () =>
      getProviderAppointments({
        status: statusParam,
        page,
        limit: 10,
      }),
    // keepPreviousData: true,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  const appointments: TableAppointment[] =
    data?.appointments?.map(mapAppointmentFromApi) ?? [];

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "Unable to load appointments."
    : null;

  function handleDetails(appt: TableAppointment) {
    setSelected(appt);
    setDialogOpen(true);
  }

  const renderContent = () => {
    if (isLoading || isFetching) {
      return (
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={`appt-skel-${idx}`} className="h-14 w-full" />
          ))}
        </div>
      );
    }

    if (errorMessage) {
      return (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">
          {errorMessage}
        </div>
      );
    }

    if (appointments.length === 0) {
      return (
        <div className="p-4 text-sm text-muted-foreground">
          No appointments found for {currentTab}.
        </div>
      );
    }

    return (
      <AppointmentTable
        data={appointments}
        onDetails={handleDetails}
        onConfirm={(id) => handleMutation(confirmMutation, id)}
        onReject={(id) => handleMutation(rejectMutation, id)}
        onComplete={(id) => handleMutation(completeMutation, id)}
        processingAppointmentId={processingAppointmentId}
      />
    );
  };

  return (
    <>
      <Card className="p-0">
        <Tabs
          defaultValue="pending"
          value={currentTab}
          onValueChange={(value) => {
            setCurrentTab(value as AppointmentTab);
            setPage(1);
          }}
          className="h-auto!"
        >
          <TabsList variant="line" className="pt-2">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="p-0">
            {renderContent()}
          </TabsContent>
          <TabsContent value="confirmed" className="p-0">
            {renderContent()}
          </TabsContent>
          <TabsContent value="completed" className="p-0">
            {renderContent()}
          </TabsContent>
          <TabsContent value="cancelled" className="p-0">
            {renderContent()}
          </TabsContent>
        </Tabs>
      </Card>

      {selected && (
        <AppointmentDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
            setDialogOpen(open);
          }}
          appointment={selected}
        />
      )}
    </>
  );
}
