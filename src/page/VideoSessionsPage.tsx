import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePageTitle } from "@/store/pageTitleStore";
import { Clock3, MessageSquare, Video } from "lucide-react";

const WAITING_PATIENTS = [
  {
    name: "John Doe",
    initials: "J",
    scheduled: "10:00 AM",
    waiting: "2 min",
  },
  {
    name: "Emily Smith",
    initials: "E",
    scheduled: "11:30 AM",
    waiting: "1 min",
  },
];

const SESSION_STATS = [
  {
    label: "Sessions Today",
    value: "8",
    icon: Video,
  },
  {
    label: "Total Hours",
    value: "6.5",
    icon: Clock3,
  },
  {
    label: "Messages",
    value: "12",
    icon: MessageSquare,
  },
];

export default function VideoSessionsPage() {
  usePageTitle("Video Sessions");

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
          {WAITING_PATIENTS.map((patient) => (
            <div
              key={patient.name}
              className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-3"
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-11 bg-slate-200 text-slate-600">
                  <AvatarFallback>{patient.initials}</AvatarFallback>
                </Avatar>

                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {patient.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Scheduled: {patient.scheduled} • Waiting: {patient.waiting}
                  </p>
                </div>
              </div>

              <Button className="bg-gradient-dash text-white hover:opacity-95">
                <Video className="size-4" />
                Start Session
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {SESSION_STATS.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="py-5">
            <CardContent className="space-y-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-dash text-white">
                <Icon className="size-5" />
              </div>
              <p className="text-base text-slate-700">{label}</p>
              <p className="text-3xl font-semibold leading-none text-slate-800">
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
