import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProviderEarnings } from "@/api/earnings";
import { usePageTitle } from "@/store/pageTitleStore";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Download,
  DollarSign,
  TrendingUp,
  Wallet,
} from "lucide-react";

const formatCurrency = (value: number, currency: string = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatMonth = (monthKey: string) => {
  const [year, month] = monthKey.split("-");
  const date = new Date(`${year}-${month}-01T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return monthKey;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

const getPatientInitials = (firstName: string, lastName: string) => {
  const first = firstName?.[0] ?? "";
  const last = lastName?.[0] ?? "";
  return `${first}${last}`.toUpperCase() || "P";
};

export default function EarningsPage() {
  usePageTitle("Earnings");

  const query = useQuery({
    queryKey: ["providerEarnings"],
    queryFn: getProviderEarnings,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const loading = query.isLoading;
  const error = query.isError
    ? query.error instanceof Error
      ? query.error.message
      : "Unable to load earnings data"
    : null;

  const summary = query.data?.summary ?? {
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    lifetime: 0,
    currency: "USD",
  };

  const summaryCards = [
    {
      label: "Today's Earnings",
      value: formatCurrency(summary.today, summary.currency),
      icon: DollarSign,
    },
    {
      label: "This Week",
      value: formatCurrency(summary.thisWeek, summary.currency),
      icon: CalendarDays,
    },
    {
      label: "This Month",
      value: formatCurrency(summary.thisMonth, summary.currency),
      icon: TrendingUp,
    },
    {
      label: "Total Lifetime",
      value: formatCurrency(summary.lifetime, summary.currency),
      icon: Wallet,
    },
  ];

  const completedSessions = query.data?.recentPayments ?? [];

  const payoutHistory = Object.entries(query.data?.monthlySummary ?? {})
    .sort(([monthA], [monthB]) => monthB.localeCompare(monthA))
    .map(([month, amount]) => ({
      month,
      amount,
    }));

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="py-5">
            <CardContent className="space-y-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-dash text-white">
                <Icon className="size-5" />
              </div>
              <p className="text-3xl font-medium leading-none text-slate-800">
                {loading ? <Skeleton className="h-8 w-24" /> : value}
              </p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="py-0">
        <CardHeader className="border-b py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-semibold">
                Completed Sessions
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Recent billable sessions
              </p>
            </div>

            <Button variant="outline" className="gap-2">
              <Download className="size-4" />
              Export
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-0 py-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-4 text-xs uppercase tracking-wide text-muted-foreground">
                  Patient
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Session
                </TableHead>
                <TableHead className="pr-4 text-xs uppercase tracking-wide text-muted-foreground">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={`earnings-session-skeleton-${idx}`}>
                    <TableCell className="px-4 py-3">
                      <Skeleton className="h-6 w-40" />
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-5 w-28" />
                    </TableCell>
                    <TableCell className="pr-4 py-3">
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              ) : completedSessions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No completed sessions found.
                  </TableCell>
                </TableRow>
              ) : (
                completedSessions.map((session) => {
                  const patient = session.appointmentId?.patientId;
                  const fullName = patient
                    ? `${patient.firstName} ${patient.lastName}`
                    : "Unknown Patient";

                  const sessionType =
                    session.appointmentId?.appointmentType ||
                    session.appointmentId?.type ||
                    "Session";

                  return (
                    <TableRow key={session._id}>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8 bg-slate-200 text-slate-600">
                            <AvatarFallback>
                              {patient
                                ? getPatientInitials(
                                    patient.firstName,
                                    patient.lastName,
                                  )
                                : "P"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-slate-800">
                            {fullName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-sm text-slate-600">
                        {formatDate(session.createdAt)}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-slate-600">
                        {sessionType}
                      </TableCell>
                      <TableCell className="pr-4 py-3 text-sm text-slate-800">
                        {formatCurrency(session.amount / 100, session.currency)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader className="border-b py-4">
          <CardTitle className="text-xl font-semibold">
            Payout History
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your payment disbursements
          </p>
        </CardHeader>

        <CardContent className="px-0 py-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-4 text-xs uppercase tracking-wide text-muted-foreground">
                  Month
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Amount
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Method
                </TableHead>
                <TableHead className="pr-4 text-xs uppercase tracking-wide text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={`earnings-payout-skeleton-${idx}`}>
                    <TableCell className="px-4 py-3">
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell className="pr-4 py-3">
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : payoutHistory.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No payout history available.
                  </TableCell>
                </TableRow>
              ) : (
                payoutHistory.map((payout) => (
                  <TableRow key={payout.month}>
                    <TableCell className="px-4 py-3 text-sm text-slate-600">
                      {formatMonth(payout.month)}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-slate-800">
                      {formatCurrency(payout.amount, summary.currency)}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        Completed
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-sm text-slate-600">
                      Stripe
                    </TableCell>
                    <TableCell className="pr-4 py-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-sm text-teal-700 hover:underline"
                      >
                        <Download className="size-3.5" />
                        Statement
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
