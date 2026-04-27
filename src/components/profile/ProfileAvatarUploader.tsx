import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";

import { updateProviderProfilePhoto } from "@/api/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ProfileAvatarUploaderProps {
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  disabled?: boolean;
}

export default function ProfileAvatarUploader({
  firstName,
  lastName,
  profileImageUrl,
  disabled = false,
}: ProfileAvatarUploaderProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const updatePhotoMutation = useMutation({
    mutationFn: updateProviderProfilePhoto,
    onSuccess: async (response) => {
      setSuccessMessage(response.message);
      await queryClient.invalidateQueries({ queryKey: ["providerProfile"] });
    },
  });

  const providerInitials =
    `${firstName?.trim().charAt(0) ?? ""}${lastName?.trim().charAt(0) ?? ""}`
      .toUpperCase()
      .trim();

  const errorMessage =
    updatePhotoMutation.isError && updatePhotoMutation.error instanceof Error
      ? updatePhotoMutation.error.message
      : updatePhotoMutation.isError
        ? "Unable to update profile photo."
        : null;

  function handleTriggerFilePicker() {
    if (disabled || updatePhotoMutation.isPending) {
      return;
    }

    inputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSuccessMessage(null);
    updatePhotoMutation.mutate(file);

    // Reset so selecting the same file again still triggers onChange.
    event.target.value = "";
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-slate-700">Profile Photo</p>

      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <Avatar className="size-14 border border-slate-200 bg-slate-100">
          <AvatarImage
            src={profileImageUrl}
            alt={
              `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Profile image"
            }
          />
          <AvatarFallback className="font-medium text-slate-600">
            {providerInitials || "--"}
          </AvatarFallback>
        </Avatar>

        <Button
          type="button"
          variant="outline"
          className="h-9 gap-2 border-slate-200 text-slate-700"
          onClick={handleTriggerFilePicker}
          disabled={disabled || updatePhotoMutation.isPending}
        >
          <Upload className="size-4" />
          {updatePhotoMutation.isPending ? "Updating..." : "Change Photo"}
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
          disabled={disabled || updatePhotoMutation.isPending}
        />
      </div>
    </div>
  );
}
