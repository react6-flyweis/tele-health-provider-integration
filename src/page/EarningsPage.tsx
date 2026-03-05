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
import { usePageTitle } from "@/store/pageTitleStore";
import {
  CalendarDays,
  Download,
  DollarSign,
  TrendingUp,
  Wallet,
} from "lucide-react";

const SUMMARY_CARDS = [
  {
    label: "Today's Earnings",
    value: "$2,450",
    icon: DollarSign,
  },
  {
    label: "This Week",
    value: "$12,800",
    icon: CalendarDays,
  },
  {
    label: "This Month",
    value: "$48,500",
    icon: TrendingUp,
  },
  {
    label: "Total Lifetime",
    value: "$156,300",
    icon: Wallet,
  },
];

const COMPLETED_SESSIONS = [
  {
    patient: "John Doe",
    initials: "J",
    date: "Feb 1, 2026",
    duration: "50 min",
    amount: "$150",
  },
  {
    patient: "Emily Smith",
    initials: "E",
    date: "Feb 1, 2026",
    duration: "50 min",
    amount: "$150",
  },
  {
    patient: "Alex Turner",
    initials: "A",
    date: "Jan 31, 2026",
    duration: "50 min",
    amount: "$150",
  },
  {
    patient: "Lisa Anderson",
    initials: "L",
    date: "Jan 31, 2026",
    duration: "50 min",
    amount: "$150",
  },
];

const PAYOUT_HISTORY = [
  {
    date: "Jan 31, 2026",
    amount: "$12,450",
    status: "Completed",
    method: "Bank Transfer",
  },
  {
    date: "Jan 15, 2026",
    amount: "$11,800",
    status: "Completed",
    method: "Bank Transfer",
  },
  {
    date: "Dec 31, 2025",
    amount: "$13,200",
    status: "Completed",
    method: "Bank Transfer",
  },
];

export default function EarningsPage() {
  usePageTitle("Earnings");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {SUMMARY_CARDS.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="py-5">
            <CardContent className="space-y-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-dash text-white">
                <Icon className="size-5" />
              </div>
              <p className="text-3xl font-medium leading-none text-slate-800">
                {value}
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
                  Duration
                </TableHead>
                <TableHead className="pr-4 text-xs uppercase tracking-wide text-muted-foreground">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {COMPLETED_SESSIONS.map((session) => (
                <TableRow key={`${session.patient}-${session.date}`}>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 bg-slate-200 text-slate-600">
                        <AvatarFallback>{session.initials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-slate-800">
                        {session.patient}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-slate-600">
                    {session.date}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-slate-600">
                    {session.duration}
                  </TableCell>
                  <TableCell className="pr-4 py-3 text-sm text-slate-800">
                    {session.amount}
                  </TableCell>
                </TableRow>
              ))}
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
                  Date
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
              {PAYOUT_HISTORY.map((payout) => (
                <TableRow key={`${payout.date}-${payout.amount}`}>
                  <TableCell className="px-4 py-3 text-sm text-slate-600">
                    {payout.date}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-slate-800">
                    {payout.amount}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      {payout.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-slate-600">
                    {payout.method}
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
