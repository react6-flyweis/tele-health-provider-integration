import { useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  CircleAlert,
  Clock3,
  DollarSign,
  Users,
  Video,
} from "lucide-react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { getProviderDashboard } from "@/api/dashboard";

export default function DashboardPage() {
  const websiteURL = import.meta.env.VITE_MAIN_WEBSITE_URL;
  const provider = useAuthStore((state) => state.provider);

  const query = useQuery({
    queryKey: ["providerDashboard"],
    queryFn: getProviderDashboard,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const loading = query.isLoading;
  const error = query.isError
    ? query.error instanceof Error
      ? query.error.message
      : "Unable to load dashboard data"
    : null;

  const stats = query.data?.stats ?? {
    todayAppointments: 0,
    todayEarnings: 0,
    pendingFollowups: 0,
    totalSessionsThisMonth: 0,
    uniquePatients: 0,
  };

  const earnings = query.data?.earnings ?? {
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    currency: "USD",
  };

  const todayAppointments = query.data?.todayAppointments ?? [];
  const upcomingConsultations = query.data?.upcomingConsultations ?? [];
  const pendingFollowups = query.data?.pendingFollowups ?? [];

  const firstName = provider?.firstName ?? "Doctor";
  const providerSpecialty = provider?.specialty ?? "Mental Health";

  const statsCards = useMemo(
    () => [
      {
        label: "Today's Appointments",
        value: stats.todayAppointments,
        icon: Calendar,
      },
      {
        label: "Today's Earnings",
        value: `${earnings.currency.toUpperCase()} ${stats.todayEarnings.toLocaleString()}`,
        icon: DollarSign,
      },
      {
        label: "Pending Follow-ups",
        value: stats.pendingFollowups,
        icon: Clock3,
      },
      {
        label: "Total Sessions (Month)",
        value: stats.totalSessionsThisMonth,
        icon: Video,
      },
      { label: "Unique Patients", value: stats.uniquePatients, icon: Users },
    ],
    [stats, earnings],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-slate-800">
  Welcome back, {firstName?.toLowerCase().startsWith("dr.") ? firstName : `Dr. ${firstName}`} 👋
</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s your {providerSpecialty.toLowerCase()} overview for
            today
          </p>
        </div>

        <Link to={websiteURL}>
          <Button className="bg-gradient-dash text-white hover:opacity-95">
            <ArrowLeft className="size-4" />
            Back To website
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statsCards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="py-5">
            <CardContent className="space-y-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-dash text-white">
                <Icon className="size-5" />
              </div>
              <p className="text-3xl font-semibold leading-none text-slate-800">
                {loading ? <Skeleton className="mx-auto h-8 w-20" /> : value}
              </p>
              <p className="text-sm text-muted-foreground">
                {loading ? <Skeleton className="h-4 w-28" /> : label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="py-0">
          <CardHeader className="border-b py-4">
            <CardTitle className="text-xl font-semibold">
              Today&apos;s Appointments
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 py-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={`today-skel-${idx}`}
                  className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-11 w-11 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24 rounded" />
                </div>
              ))
            ) : todayAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No appointments for today.
              </p>
            ) : (
              todayAppointments.map((appointment) => {
                const initials = `${appointment.patientId.firstName?.[0] ?? ""}${appointment.patientId.lastName?.[0] ?? ""}`;

                return (
                  <div
                    key={appointment._id}
                    className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-11 bg-slate-200 text-slate-600">
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="text-base font-medium text-slate-700">
                          {appointment.patientId.firstName}{" "}
                          {appointment.patientId.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.time}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.appointmentType || appointment.type}
                        </p>
                      </div>
                    </div>

                    <Button className="bg-gradient-dash px-4 text-white hover:opacity-95">
                      Join Call
                    </Button>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardHeader className="border-b py-4">
            <CardTitle className="text-xl font-semibold">Alerts</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 py-4">
            {loading ? (
              Array.from({ length: 2 }).map((_, idx) => (
                <div
                  key={`alerts-skel-${idx}`}
                  className="rounded-lg border border-amber-300/80 bg-amber-50/60 px-4 py-3"
                >
                  <div className="flex items-start gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-amber-300/80 bg-amber-50/60 px-4 py-3">
                <div className="flex items-start gap-2">
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm text-slate-700">
                      No alerts available.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Notifications will appear here.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="py-0">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-xl font-semibold">
                Upcoming Consultations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 py-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={`upcoming-skel-${idx}`}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))
              ) : upcomingConsultations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No upcoming consultations.
                </p>
              ) : (
                upcomingConsultations.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <div>
                      <p className="text-base font-medium text-slate-700">
                        {item.patientId.firstName} {item.patientId.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.time} · {new Date(item.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.appointmentType || item.type}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="py-0">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-xl font-semibold">
                Pending Follow-ups
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 py-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={`pending-skel-${idx}`}
                    className="flex items-center justify-between bg-muted/40 border-l-4 border-primary px-4 py-3"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))
              ) : pendingFollowups.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No pending follow-ups.
                </p>
              ) : (
                pendingFollowups.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between bg-muted/40 border-l-4 border-primary px-4 py-3"
                  >
                    <div>
                      <p className="text-base font-medium text-slate-700">
                        {item.patientId.firstName} {item.patientId.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.reasonForVisit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.time} · {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="py-0">
          <CardHeader className="border-b py-4">
            <CardTitle className="text-xl font-semibold">
              Earnings Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {loading
                ? ["Today", "This Week", "This Month"].map((label) => (
                    <div className="text-center" key={label}>
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <Skeleton className="mx-auto mt-2 h-8 w-24" />
                    </div>
                  ))
                : [
                    { label: "Today", value: earnings.today },
                    { label: "This Week", value: earnings.thisWeek },
                    { label: "This Month", value: earnings.thisMonth },
                  ].map((item) => (
                    <div className="text-center" key={item.label}>
                      <p className="text-sm text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="text-2xl font-semibold text-slate-800">
                        {earnings.currency.toUpperCase()}{" "}
                        {item.value.toLocaleString()}
                      </p>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
