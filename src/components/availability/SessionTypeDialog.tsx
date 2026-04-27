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
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";

export interface SessionType {
  name: string;
  type: string; 
  duration: number;
  price: string;
}

const sessionTypeSchema = z.object({
  name: z.string().min(1, "Session name is required"),
  type: z.string().min(1, "Session type is required"),
  duration: z.number().min(1, "Duration is required"),
  price: z.string().min(1, "Price is required"),
});

type SessionTypeForm = z.infer<typeof sessionTypeSchema>;

interface SessionTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: SessionType;
  onSave: (data: SessionType) => void;
}

const DURATION_OPTIONS = [20, 30, 45, 50, 60, 75, 90];

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
    watch,
  } = useForm<SessionTypeForm>({
    resolver: zodResolver(sessionTypeSchema),
    defaultValues: session || { name: "", type: "video", duration: 20, price: "" },
  });

  const durationValue = watch("duration");

  // reset whenever session changes (edit vs create)
  React.useEffect(() => {
    reset(session || { name: "", type: "video", duration: 20, price: "" });
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
                placeholder=""
              />
            </FieldContent>
            <FieldError errors={errors.name ? [errors.name] : []} />
          </Field>
          <Field>
            <FieldLabel>Session Type</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select
                    onValueChange={(val) => field.onChange(val)}
                    value={field.value || ""}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select session type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">
                        Video Session
                      </SelectItem>
                      <SelectItem value="audio">
                        Audio Session
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FieldContent>
            <FieldError errors={errors.type ? [errors.type] : []} />
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
                    value={durationValue?.toString() || "20"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select duration" />
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
            <FieldLabel>Price (USD)</FieldLabel>
            <FieldContent>
              <Input
                {...register("price")}
                placeholder="e.g. $50"
              />
            </FieldContent>
            <FieldError errors={errors.price ? [errors.price] : []} />
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
