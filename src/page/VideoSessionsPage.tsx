import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTitle } from "@/store/pageTitleStore";
import { Clock3, MessageSquare, Video } from "lucide-react";
import { useNavigate } from "react-router";
import {
  getProviderSessions,
  startProviderSession,
  type ProviderSession,
} from "@/api/sessions";

const buildInitials = (firstName?: string, lastName?: string) =>
  `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();

const formatScheduled = (date: string, time: string) => {
  const parsed = new Date(date);

  const formattedDate = parsed.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  return `${formattedDate}, ${time}`;
};

const getSessionHours = (
  startTime?: string | null,
  endTime?: string | null,
) => {
  if (!startTime || !endTime) return 0;
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  return (end - start) / (1000 * 60 * 60);
};

export default function VideoSessionsPage() {
  usePageTitle("Video Sessions");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["sessions"],
    queryFn: getProviderSessions,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  const sessions = useMemo(() => data?.sessions ?? [], [data?.sessions]);

  const startSessionMutation = useMutation({
    mutationFn: startProviderSession,
    onSuccess: (response, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      navigate(`/dashboard/video-sessions/live/${sessionId}`, {
        state: {
          session: response.session,
          connection: response.connection,
        },
      });
    },
  });

  const waitingSessions = useMemo<ProviderSession[]>(
    () => sessions.filter((session) => session.status === "scheduled"),
    [sessions],
  );

  const stats = useMemo(() => {
    const totalHours = sessions.reduce(
      (sum, session) =>
        sum + getSessionHours(session.startTime, session.endTime),
      0,
    );
    return [
      {
        label: "Active Sessions",
        value: `${waitingSessions.length}`,
        icon: Video,
      },
      {
        label: "Logged Hours",
        value: `${totalHours.toFixed(1)}`,
        icon: Clock3,
      },
      {
        label: "Total Sessions",
        value: `${sessions.length}`,
        icon: MessageSquare,
      },
    ];
  }, [sessions, waitingSessions.length]);

  const renderWaitingRoomContent = () => {
    if (isLoading || isFetching) {
      return (
        <div className="space-y-3 p-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <Skeleton key={`session-skel-${idx}`} className="h-14 w-full" />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">
          {error instanceof Error ? error.message : "Unable to load sessions."}
        </div>
      );
    }

    if (!waitingSessions.length) {
      return (
        <div className="p-4 text-sm text-muted-foreground">
          No scheduled sessions found.
        </div>
      );
    }

    return waitingSessions.map((session) => {
      const isStartingThisSession =
        startSessionMutation.isPending &&
        startSessionMutation.variables === session._id;
      const patient = session.appointmentId?.patientId;
      const name =
        `${patient?.firstName ?? "Unknown"} ${patient?.lastName ?? ""}`.trim();
      const initials = buildInitials(patient?.firstName, patient?.lastName);
      const scheduled = formatScheduled(
        session.appointmentId.date,
        session.appointmentId.time,
      );

      return (
        <div
          key={session._id}
          className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-3"
        >
          <div className="flex items-center gap-3">
            <Avatar className="size-11 bg-slate-200 text-slate-600">
              <AvatarFallback>{initials || "?"}</AvatarFallback>
            </Avatar>

            <div>
              <p className="text-sm font-medium text-slate-800">{name}</p>
              <p className="text-xs text-muted-foreground">
                Scheduled: {scheduled}
              </p>
            </div>
          </div>

          <Button
            className="bg-gradient-dash text-white hover:opacity-95"
            onClick={() => startSessionMutation.mutate(session._id)}
            disabled={startSessionMutation.isPending}
          >
            <Video className="size-4" />
            {isStartingThisSession ? "Starting..." : "Start Session"}
          </Button>
        </div>
      );
    });
  };

  return (
    <div className="space-y-4">
      <Card className="py-0">
        <CardHeader className="border-b py-4">
          <CardTitle className="text-xl font-semibold">
            Virtual Waiting Room
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Patients ready for consultation
          </p>
        </CardHeader>

        <CardContent className="space-y-3 py-4">
          {startSessionMutation.isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {startSessionMutation.error instanceof Error
                ? startSessionMutation.error.message
                : "Unable to start session."}
            </div>
          ) : null}

          {renderWaitingRoomContent()}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="py-5">
              <CardContent className="space-y-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-dash text-white">
                  <Icon className="size-5" />
                </div>
                <p className="text-base text-slate-700">{item.label}</p>
                <p className="text-3xl font-semibold leading-none text-slate-800">
                  {item.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
