import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { usePageTitle } from "@/store/pageTitleStore";
import { Pencil, Search } from "lucide-react";
import EditPatientDialog, {
  type Patient,
} from "@/components/patients/EditPatientDialog";

// sample patient data with extra fields for editing
const INITIAL_PATIENTS: Patient[] = [
  {
    id: "#PT000001",
    name: "John Doe",
    initials: "J",
    age: 32,
    sessions: 6,
    gender: "Male",
    phone: "(555) 123-4567",
    email: "john.doe@email.com",
    medicalHistory:
      "History of anxiety and mild depression. No chronic physical conditions.",
    currentDiagnosis: "Generalized Anxiety Disorder (GAD)",
    treatmentPlan:
      "Cognitive Behavioral Therapy (CBT), weekly sessions, medication if needed",
    currentMedications: "Sertraline 50mg daily",
  },
  {
    id: "#PT000002",
    name: "Emily Smith",
    initials: "E",
    age: 28,
    sessions: 12,
  },
  {
    id: "#PT000003",
    name: "Michael Brown",
    initials: "M",
    age: 45,
    sessions: 5,
  },
  {
    id: "#PT000004",
    name: "Sarah Johnson",
    initials: "S",
    age: 36,
    sessions: 15,
  },
];

const CONSULTATION_NOTES = [
  {
    date: "Feb 1, 2026",
    note: "Patient reports improvement in sleep quality. Anxiety levels reduced. Continue current treatment plan.",
  },
  {
    date: "Jan 25, 2026",
    note: "Discussed coping mechanisms for work-related stress. Patient receptive to mindfulness techniques.",
  },
];

export default function PatientRecordsPage() {
  usePageTitle("Patient Records");

  const [patients, setPatients] = React.useState<Patient[]>(INITIAL_PATIENTS);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [editOpen, setEditOpen] = React.useState(false);
  // keep track of a prescription text for each consultation note (keyed by date)
  const [notePrescriptions, setNotePrescriptions] = React.useState<
    Record<string, string>
  >({});

  const selectedPatient = patients[selectedIndex];

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_1fr]">
      <Card className="py-3">
        <CardContent className="space-y-3">
          <InputGroup className="h-10 border bg-muted/70 shadow-none">
            <InputGroupAddon className="pl-3">
              <Search className="size-4 text-muted-foreground" />
            </InputGroupAddon>

            <InputGroupInput
              placeholder="Search patients..."
              className="pr-3"
            />
          </InputGroup>

          <div className="space-y-1">
            {patients.map((patient, index) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`w-full rounded-lg px-3 py-2 text-left ${
                  index === selectedIndex ? "bg-slate-100" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-8 bg-slate-200 text-slate-600">
                    <AvatarFallback>{patient.initials}</AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {patient.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {patient.age} years • {patient.sessions} sessions
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-3xl font-semibold leading-none text-slate-800">
                {selectedPatient.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Patient ID: {selectedPatient.id}
              </p>
            </div>

            <Button
              className="bg-gradient-dash text-white hover:opacity-95"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="size-4" />
              Edit Record
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-md bg-muted/50 px-4 py-3">
              <p className="text-xs text-muted-foreground">Age</p>
              <p className="mt-1 text-sm text-slate-800">
                {selectedPatient.age} years
              </p>
            </div>
            <div className="rounded-md bg-muted/50 px-4 py-3">
              <p className="text-xs text-muted-foreground">Gender</p>
              <p className="mt-1 text-sm text-slate-800">
                {selectedPatient.gender || "-"}
              </p>
            </div>
            <div className="rounded-md bg-muted/50 px-4 py-3">
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="mt-1 text-sm text-slate-800">
                {selectedPatient.phone || "-"}
              </p>
            </div>
            <div className="rounded-md bg-muted/50 px-4 py-3">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="mt-1 text-sm text-slate-800">
                {selectedPatient.email || "-"}
              </p>
            </div>
          </div>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800">
              Medical History
            </h3>
            <div className="rounded-md bg-muted/50 px-4 py-3 text-sm text-slate-700">
              {selectedPatient.medicalHistory || "-"}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800">
              Current Diagnosis
            </h3>
            <div className="rounded-md border-l-4 border-teal-500 bg-slate-100 px-4 py-3 text-sm text-slate-800">
              {selectedPatient.currentDiagnosis || "-"}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800">
              Treatment Plan
            </h3>
            <div className="rounded-md bg-muted/50 px-4 py-3 text-sm text-slate-700">
              {selectedPatient.treatmentPlan || "-"}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800">
              Current Medications
            </h3>
            <div className="rounded-md bg-amber-50 px-4 py-3 text-sm text-slate-800">
              {selectedPatient.currentMedications || "-"}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800">
              Consultation Notes
            </h3>

            <div className="space-y-2">
              {CONSULTATION_NOTES.map((entry) => (
                <div key={entry.date} className="rounded-md border px-4 py-3">
                  <p className="text-xs text-muted-foreground">{entry.date}</p>
                  <p className="mt-2 text-sm text-slate-700">{entry.note}</p>

                  {/* per-note prescription area */}
                  <textarea
                    className="w-full rounded-md border px-3 py-2 text-sm mt-2"
                    placeholder="Write prescription here..."
                    value={notePrescriptions[entry.date] || ""}
                    onChange={(e) =>
                      setNotePrescriptions((prev) => ({
                        ...prev,
                        [entry.date]: e.target.value,
                      }))
                    }
                  />
                  <Button
                    className="bg-gradient-dash text-white hover:opacity-95 mt-2"
                    onClick={() => {
                      const pres = notePrescriptions[entry.date]?.trim();
                      if (pres) {
                        console.log("Prescription for", entry.date, ":", pres);
                        setNotePrescriptions((prev) => ({
                          ...prev,
                          [entry.date]: "",
                        }));
                      }
                    }}
                  >
                    Send
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </CardContent>
      </Card>

      {/* edit dialog instance */}
      <EditPatientDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        patient={selectedPatient}
        onSave={(updated) => {
          setPatients((prev) =>
            prev.map((p, i) => (i === selectedIndex ? updated : p)),
          );
        }}
      />
    </div>
  );
}
