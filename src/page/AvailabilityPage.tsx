import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePageTitle } from "@/store/pageTitleStore";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteTimeSlotDialog from "@/components/availability/DeleteTimeSlotDialog";
import SessionTypeDialog, {
  type SessionType,
} from "@/components/availability/SessionTypeDialog";
import { getProviderAvailability } from "@/api/availability";
import { useUpdateAvailabilityScheduleMutation } from "@/hooks/useAvailabilityMutations";

type Slot = {
  start: string;
  end: string;
};

type DaySchedule = {
  day: string;
  slots: Slot[];
};

const DAYS_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const INITIAL_SCHEDULE: DaySchedule[] = [
  { day: "Monday", slots: [{ start: "09:00", end: "10:00" }] },
  { day: "Tuesday", slots: [{ start: "09:00", end: "10:00" }] },
  { day: "Wednesday", slots: [{ start: "09:00", end: "10:00" }] },
  { day: "Thursday", slots: [{ start: "09:00", end: "10:00" }] },
  { day: "Friday", slots: [{ start: "09:00", end: "10:00" }] },
  { day: "Saturday", slots: [] },
  { day: "Sunday", slots: [] },
];

const INITIAL_SESSION_TYPES: SessionType[] = [
  { name: "Initial Consultation", duration: 60, fee: "$200" },
  { name: "Follow-up Session", duration: 50, fee: "$150" },
  { name: "Therapy Session", duration: 50, fee: "$150" },
  { name: "Medication Review", duration: 30, fee: "$100" },
];

export default function AvailabilityPage() {
  usePageTitle("Availability");

  const [scheduleEdits, setScheduleEdits] = useState<DaySchedule[] | null>(
    null,
  );
  const [sessionTypesEdits, setSessionTypesEdits] = useState<
    SessionType[] | null
  >(null);
  const [blockedDateEdits, setBlockedDateEdits] = useState<{
    startDate: string;
    endDate: string;
    reason: string;
  } | null>(null);

  // dialog state for editing/adding session types
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingSession, setEditingSession] = useState<SessionType | null>(
    null,
  );

  // confirmation dialog for deleting a slot
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    day: string;
    index: number;
  } | null>(null);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["availability"],
    queryFn: getProviderAvailability,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
  const updateScheduleMutation = useUpdateAvailabilityScheduleMutation();

  const mappedSchedule = useMemo<DaySchedule[]>(() => {
    if (!data) return INITIAL_SCHEDULE;

    const scheduleByDay = new Map(
      data.availability.map((daySchedule) => [daySchedule.day, daySchedule]),
    );

    return DAYS_ORDER.map((day) => {
      const daySchedule = scheduleByDay.get(day);

      return {
        day,
        slots:
          daySchedule?.slots.map((slot) => ({
            start: slot.startTime,
            end: slot.endTime,
          })) ?? [],
      };
    });
  }, [data]);

  const mappedSessionTypes = useMemo<SessionType[]>(() => {
    if (!data) return INITIAL_SESSION_TYPES;

    return data.sessionTypes.map((item) => ({
      name: item.name,
      duration: item.duration,
      fee: `$${item.fee}`,
    }));
  }, [data]);

  const mappedBlockedDate = useMemo(() => {
    if (!data?.blockedDates?.length) {
      return { startDate: "", endDate: "", reason: "" };
    }

    const latestBlockedDate = data.blockedDates[data.blockedDates.length - 1];
    return {
      startDate: latestBlockedDate.startDate.slice(0, 10),
      endDate: latestBlockedDate.endDate.slice(0, 10),
      reason: latestBlockedDate.reason || "",
    };
  }, [data]);

  const schedule = scheduleEdits ?? mappedSchedule;
  const sessionTypes = sessionTypesEdits ?? mappedSessionTypes;
  const blockedDate = blockedDateEdits ?? mappedBlockedDate;

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "Unable to load availability."
    : null;

  function addSlot(dayName: string) {
    setScheduleEdits((prev) =>
      (prev ?? mappedSchedule).map((day) =>
        day.day === dayName
          ? {
              ...day,
              slots: [...day.slots, { start: "09:00", end: "10:00" }],
            }
          : day,
      ),
    );
  }

  function updateSlot(
    dayName: string,
    index: number,
    key: keyof Slot,
    value: string,
  ) {
    setScheduleEdits((prev) =>
      (prev ?? mappedSchedule).map((day) => {
        if (day.day !== dayName) return day;

        return {
          ...day,
          slots: day.slots.map((slot, slotIndex) =>
            slotIndex === index ? { ...slot, [key]: value } : slot,
          ),
        };
      }),
    );
  }

  function removeSlot(dayName: string, index: number) {
    setScheduleEdits((prev) =>
      (prev ?? mappedSchedule).map((day) => {
        if (day.day !== dayName) return day;

        return {
          ...day,
          slots: day.slots.filter((_, slotIndex) => slotIndex !== index),
        };
      }),
    );
  }

  function openDeleteDialog(dayName: string, index: number) {
    setPendingDelete({ day: dayName, index });
    setConfirmOpen(true);
  }

  function confirmDelete() {
    if (pendingDelete) {
      removeSlot(pendingDelete.day, pendingDelete.index);
    }
    setConfirmOpen(false);
    setPendingDelete(null);
  }

  // session type dialog related helpers
  function openNewSession() {
    setEditingIndex(null);
    setEditingSession(null);
    setDialogOpen(true);
  }

  function openEditSession(index: number) {
    setEditingIndex(index);
    setEditingSession(sessionTypes[index]);
    setDialogOpen(true);
  }

  function handleSaveSession(session: SessionType) {
    setSessionTypesEdits((prev) => {
      const source = prev ?? mappedSessionTypes;

      if (editingIndex !== null && editingIndex >= 0) {
        const updated = [...source];
        updated[editingIndex] = session;
        return updated;
      }
      return [...source, session];
    });
  }

  function handleSaveSchedule() {
    const payloadSchedule = schedule
      .map((item) => ({
        day: item.day,
        slots: Array.from(
          new Set(
            item.slots
              .map((slot) => slot.start)
              .filter((slotStart) => slotStart.trim().length > 0),
          ),
        ).sort((a, b) => a.localeCompare(b)),
      }))
      .filter((item) => item.slots.length > 0);

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    updateScheduleMutation.mutate(
      {
        schedule: payloadSchedule,
        timezone,
      },
      {
        onSuccess: () => {
          setScheduleEdits(null);
        },
      },
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card className="py-0">
        <CardHeader className="border-b py-4">
          <CardTitle className="text-base font-semibold">
            Weekly Schedule
          </CardTitle>
          <CardDescription className="text-xs">
            Set your available time slots
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 py-4">
          {isLoading || isFetching ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton
                  key={`availability-skel-${idx}`}
                  className="h-10 w-full"
                />
              ))}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {!isLoading && !isFetching
            ? schedule.map((item) => (
                <div
                  key={item.day}
                  className="rounded-lg border bg-background px-3 py-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700">
                      {item.day}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addSlot(item.day)}
                      className="h-auto gap-1 px-1.5 text-xs text-primary hover:bg-transparent hover:text-primary/90"
                    >
                      <Plus className="size-3.5" />
                      Add Slot
                    </Button>
                  </div>

                  {item.slots.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Unavailable</p>
                  ) : (
                    <div className="space-y-2">
                      {item.slots.map((slot, index) => (
                        <div
                          key={`${item.day}-${index}`}
                          className="flex items-center gap-2"
                        >
                          <Input
                            type="time"
                            value={slot.start}
                            onChange={(event) =>
                              updateSlot(
                                item.day,
                                index,
                                "start",
                                event.target.value,
                              )
                            }
                            className="w-24 text-xs"
                          />
                          <span className="text-xs text-muted-foreground">
                            to
                          </span>
                          <Input
                            type="time"
                            value={slot.end}
                            onChange={(event) =>
                              updateSlot(
                                item.day,
                                index,
                                "end",
                                event.target.value,
                              )
                            }
                            className="w-24 text-xs"
                          />
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openDeleteDialog(item.day, index)}
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            : null}

          {updateScheduleMutation.isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {updateScheduleMutation.error instanceof Error
                ? updateScheduleMutation.error.message
                : "Unable to update schedule."}
            </div>
          ) : null}

          <Button
            className="w-full bg-gradient-dash text-white hover:opacity-95"
            onClick={handleSaveSchedule}
            disabled={
              updateScheduleMutation.isPending || isLoading || isFetching
            }
          >
            {updateScheduleMutation.isPending ? "Saving..." : "Save Schedule"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="py-0">
          <CardHeader className="border-b py-4">
            <CardTitle className="text-base font-semibold">
              Session Types & Fees
            </CardTitle>
            <CardDescription className="text-xs">
              Configure consultation types and pricing
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2.5 py-4">
            {isLoading || isFetching ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton
                    key={`session-type-skel-${idx}`}
                    className="h-14 w-full"
                  />
                ))}
              </div>
            ) : null}

            {!isLoading && !isFetching
              ? sessionTypes.map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {item.name}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.duration} min</span>
                        <span className="font-medium text-primary">
                          {item.fee}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => openEditSession(idx)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  </div>
                ))
              : null}

            <Button
              variant="outline"
              className="w-full gap-1.5"
              onClick={openNewSession}
            >
              <Plus className="size-4" />
              Add Session Type
            </Button>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardHeader className="border-b py-4">
            <CardTitle className="text-base font-semibold">
              Block Time
            </CardTitle>
            <CardDescription className="text-xs">
              Mark unavailable dates
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 py-4">
            <div className="space-y-1.5">
              <p className="text-xs text-slate-600">Start Date</p>
              <Input
                type="date"
                value={blockedDate.startDate}
                onChange={(event) =>
                  setBlockedDateEdits((prev) => ({
                    ...(prev ?? mappedBlockedDate),
                    startDate: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-slate-600">End Date</p>
              <Input
                type="date"
                value={blockedDate.endDate}
                onChange={(event) =>
                  setBlockedDateEdits((prev) => ({
                    ...(prev ?? mappedBlockedDate),
                    endDate: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-slate-600">Reason (Optional)</p>
              <Textarea
                rows={2}
                placeholder="e.g., Vacation, Conference"
                value={blockedDate.reason}
                onChange={(event) =>
                  setBlockedDateEdits((prev) => ({
                    ...(prev ?? mappedBlockedDate),
                    reason: event.target.value,
                  }))
                }
              />
            </div>

            <Button className="w-full bg-gradient-dash text-white hover:opacity-95">
              Block Time
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* dialog for creating / editing session types */}
      <SessionTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        session={editingSession || undefined}
        onSave={handleSaveSession}
      />

      {/* confirmation dialog for deleting a slot */}
      <DeleteTimeSlotDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setPendingDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
