import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useUpdatePatientRecordMutation } from "@/hooks/usePatientMutations";

export interface Patient {
  id: string;
  name: string;
  initials: string;
  age: number;
  sessions: number;
  gender?: string;
  phone?: string;
  email?: string;
  medicalHistory?: string;
  currentDiagnosis?: string;
  treatmentPlan?: string;
  currentMedications?: string;
}

interface EditPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  patient: Patient;
  onSave?: (patient: Patient) => void;
}

export default function EditPatientDialog({
  open,
  onOpenChange,
  patientId,
  patient,
  onSave,
}: EditPatientDialogProps) {
  const [formData, setFormData] = React.useState<Patient>(patient);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const updatePatientRecordMutation = useUpdatePatientRecordMutation();

  // when dialog opens or patient prop changes, sync form data
  React.useEffect(() => {
    setFormData(patient);
  }, [patient]);

  React.useEffect(() => {
    if (open) {
      setLocalError(null);
    }
  }, [open]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFormData(
      (prev) =>
        ({
          ...prev,
          // age and sessions are numbers
          [name]: name === "age" || name === "sessions" ? Number(value) : value,
        }) as Patient,
    );
  }

  async function handleSubmit() {
    setLocalError(null);

    try {
      updatePatientRecordMutation.reset();

      await updatePatientRecordMutation.mutateAsync({
        patientId,
        payload: {
          diagnosis: formData.currentDiagnosis?.trim(),
          treatmentNotes: formData.treatmentPlan?.trim(),
          medicalHistory: formData.medicalHistory?.trim(),
        },
      });

      onSave?.(formData);
      onOpenChange(false);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Could not save changes.",
      );
    }
  }

  const saveError =
    updatePatientRecordMutation.isError &&
    updatePatientRecordMutation.error instanceof Error
      ? updatePatientRecordMutation.error.message
      : null;
  const isSaving = updatePatientRecordMutation.isPending;
  const errorMessage = localError || saveError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>Edit Patient Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Personal Information */}
          <h4 className="text-sm font-semibold">Personal Information</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Age</label>
              <Input
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Gender</label>
              <Input
                name="gender"
                value={formData.gender || ""}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Medical Information</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm">Medical History</label>
                <Textarea
                  name="medicalHistory"
                  value={formData.medicalHistory || ""}
                  onChange={handleChange}
                  className="mt-1 h-20"
                  placeholder="Enter medical history..."
                />
              </div>
              <div>
                <label className="text-sm">Current Diagnosis</label>
                <Input
                  name="currentDiagnosis"
                  value={formData.currentDiagnosis || ""}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm">Treatment Plan</label>
                <Textarea
                  name="treatmentPlan"
                  value={formData.treatmentPlan || ""}
                  onChange={handleChange}
                  className="mt-1 h-20"
                  placeholder="Enter treatment plan..."
                />
              </div>
              <div>
                <label className="text-sm">Current Medications</label>
                <Textarea
                  name="currentMedications"
                  value={formData.currentMedications || ""}
                  onChange={handleChange}
                  className="mt-1 h-20"
                  placeholder="Enter current medications..."
                />
              </div>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <DialogFooter className="bg-transparent flex gap-5">
          <DialogClose asChild>
            <Button variant="outline" disabled={isSaving}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="bg-gradient-dash text-white hover:opacity-95"
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
