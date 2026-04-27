import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteTimeSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function DeleteTimeSlotDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteTimeSlotDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        {/* top-right close icon (ghost button like other dialogs) */}
        <AlertDialogCancel asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </AlertDialogCancel>

        <AlertDialogHeader className="border-b pb-2">
          <AlertDialogTitle>Delete Time Slot</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="py-2">
          <AlertDialogDescription>
            Are you sure you want to delete this time slot? This action cannot
            be undone.
          </AlertDialogDescription>
        </div>
        <AlertDialogFooter className="bg-transparent py-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-red-500" onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
