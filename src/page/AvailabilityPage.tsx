import { useState } from "react";
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
import DeleteTimeSlotDialog from "@/components/availability/DeleteTimeSlotDialog";
import SessionTypeDialog, {
  type SessionType,
} from "@/components/availability/SessionTypeDialog";

type Slot = {
  start: string;
  end: string;
};

type DaySchedule = {
  day: string;
  slots: Slot[];
};

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

  const [schedule, setSchedule] = useState<DaySchedule[]>(INITIAL_SCHEDULE);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>(
    INITIAL_SESSION_TYPES,
  );

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

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  function addSlot(dayName: string) {
    setSchedule((prev) =>
      prev.map((day) =>
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
    setSchedule((prev) =>
      prev.map((day) => {
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
    setSchedule((prev) =>
      prev.map((day) => {
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
    setSessionTypes((prev) => {
      if (editingIndex !== null && editingIndex >= 0) {
        const updated = [...prev];
        updated[editingIndex] = session;
        return updated;
      }
      return [...prev, session];
    });
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
          {schedule.map((item) => (
            <div
              key={item.day}
              className="rounded-lg border bg-background px-3 py-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">{item.day}</p>
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
                      <span className="text-xs text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={slot.end}
                        onChange={(event) =>
                          updateSlot(item.day, index, "end", event.target.value)
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
          ))}

          <Button className="w-full bg-gradient-dash text-white hover:opacity-95">
            Save Schedule
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
            {sessionTypes.map((item, idx) => (
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
                    <span className="font-medium text-primary">{item.fee}</span>
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
            ))}

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
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-slate-600">End Date</p>
              <Input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-slate-600">Reason (Optional)</p>
              <Textarea
                rows={2}
                placeholder="e.g., Vacation, Conference"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
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
