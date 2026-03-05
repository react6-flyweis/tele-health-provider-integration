import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";

export interface SessionType {
  name: string;
  duration: number;
  fee: string;
}

const sessionTypeSchema = z.object({
  name: z.string().min(1, "Session name is required"),
  duration: z.number().min(1, "Duration is required"),
  fee: z.string().min(1, "Fee is required"),
});

type SessionTypeForm = z.infer<typeof sessionTypeSchema>;

interface SessionTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: SessionType;
  onSave: (data: SessionType) => void;
}

const DURATION_OPTIONS = [30, 45, 50, 60, 75, 90];

export default function SessionTypeDialog({
  open,
  onOpenChange,
  session,
  onSave,
}: SessionTypeDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SessionTypeForm>({
    resolver: zodResolver(sessionTypeSchema),
    defaultValues: session || { name: "", duration: 60, fee: "" },
  });

  // reset whenever session changes (edit vs create)
  React.useEffect(() => {
    reset(session || { name: "", duration: 60, fee: "" });
  }, [session, reset]);

  const onSubmit = (data: SessionTypeForm) => {
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>
            {session ? "Edit Session Type" : "Add Session Type"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Field>
            <FieldLabel>Session Name</FieldLabel>
            <FieldContent>
              <Input
                {...register("name")}
                className="mt-1"
                placeholder="e.g., Follow-up Session"
              />
            </FieldContent>
            <FieldError errors={errors.name ? [errors.name] : []} />
          </Field>

          <Field>
            <FieldLabel>Duration</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="duration"
                render={({ field }) => (
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={String(field.value)}
                  >
                    <SelectTrigger className="w-full">
                      {field.value} Minutes
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d} Minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FieldContent>
            <FieldError errors={errors.duration ? [errors.duration] : []} />
          </Field>

          <Field>
            <FieldLabel>Fee (USD)</FieldLabel>
            <FieldContent>
              <Input {...register("fee")} className="mt-1" placeholder="$150" />
            </FieldContent>
            <FieldError errors={errors.fee ? [errors.fee] : []} />
          </Field>
        </div>

        <DialogFooter className="bg-transparent flex gap-5">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            className="bg-gradient-dash text-white hover:opacity-95"
            onClick={handleSubmit(onSubmit)}
          >
            {session ? "Save Changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
