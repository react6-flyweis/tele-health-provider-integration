import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProviderPatients } from "@/api/patients";
import { createProviderPrescription } from "@/api/prescriptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export interface NewPrescriptionData {
  patientId: string;
  patientName: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  specialInstructions?: string;
}

interface NewPrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewPrescriptionDialog({
  open,
  onOpenChange,
}: NewPrescriptionDialogProps) {
  const queryClient = useQueryClient();

  const createPrescriptionMutation = useMutation({
    mutationFn: createProviderPrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providerPrescriptions"] });
    },
  });

  const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
    queryKey: ["providerPatients"],
    queryFn: getProviderPatients,
    enabled: open,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const patientOptions = React.useMemo(() => {
    return (patientsData?.patients || []).map((item) => ({
      id: item.patient._id,
      name: `${item.patient.firstName || ""} ${item.patient.lastName || ""}`.trim(),
      code: item.patient.patientCode || "",
    }));
  }, [patientsData]);

  const [formData, setFormData] = React.useState<NewPrescriptionData>({
    patientId: "",
    patientName: "",
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    specialInstructions: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit() {
    if (!formData.patientId) {
      return;
    }

    try {
      await createPrescriptionMutation.mutateAsync({
        patientId: formData.patientId,
        medications: [
          {
            name: formData.medication,
            dosage: formData.dosage,
            frequency: formData.frequency,
            duration: formData.duration,
          },
        ],
        instructions: formData.specialInstructions,
        // refillsAllowed: 0,
      });

      onOpenChange(false);
      // reset form for next time
      setFormData({
        patientId: "",
        patientName: "",
        medication: "",
        dosage: "",
        frequency: "",
        duration: "",
        specialInstructions: "",
      });
    } catch {
      // Keep dialog open when create fails so user can retry.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>Create New Prescription</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {createPrescriptionMutation.isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {createPrescriptionMutation.error instanceof Error
                ? createPrescriptionMutation.error.message
                : "Unable to create prescription."}
            </div>
          ) : null}

          <div>
            <label className="text-sm font-medium">Patient</label>
            <Select
              value={formData.patientId}
              onValueChange={(value) => {
                const selectedPatient = patientOptions.find(
                  (p) => p.id === value,
                );
                setFormData((prev) => ({
                  ...prev,
                  patientId: value,
                  patientName: selectedPatient?.name || "",
                }));
              }}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue
                  placeholder={
                    isPatientsLoading ? "Loading patients..." : "Select patient"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {patientOptions.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} {patient.code ? `(${patient.code})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Medication Name</label>
            <Input
              name="medication"
              value={formData.medication}
              onChange={handleChange}
              className="mt-1"
              placeholder="e.g., Sertraline"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Dosage</label>
              <Input
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                className="mt-1"
                placeholder="e.g., 50mg"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Frequency</label>
              <Input
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="mt-1"
                placeholder=""
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Duration</label>
            <Input
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="mt-1"
              placeholder="e.g., 30 days"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Special Instructions</label>
            <Textarea
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleChange}
              className="mt-1 h-24"
              placeholder="Any special instructions for the patient..."
            />
          </div>
        </div>

        <DialogFooter className="bg-transparent flex gap-5">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            className="bg-gradient-dash text-white hover:opacity-95"
            onClick={handleSubmit}
            disabled={
              !formData.patientId || createPrescriptionMutation.isPending
            }
          >
            {createPrescriptionMutation.isPending
              ? "Creating..."
              : "Create & Send to Patient"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
