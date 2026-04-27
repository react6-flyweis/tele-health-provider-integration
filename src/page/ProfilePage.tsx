import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePageTitle } from "@/store/pageTitleStore";
import { Save, Upload } from "lucide-react";
import {
  getProviderProfile,
  updateProviderProfile,
  uploadProviderLicenseDocument,
} from "@/api/profile";
import ProfileAvatarUploader from "@/components/profile/ProfileAvatarUploader";

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim(),
  specialty: z.string().trim().min(1, "Specialty is required"),
  licenseNumber: z.string().trim().min(1, "License number is required"),
  yearsOfExperience: z
    .string()
    .trim()
    .min(1, "Years of experience is required")
    .regex(/^\d+$/, "Years of experience must be a number"),
  professionalBio: z.string(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const INITIAL_FORM: ProfileForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  specialty: "",
  licenseNumber: "",
  yearsOfExperience: "",
  professionalBio: "",
};

export default function ProfilePage() {
  usePageTitle("Profile");
  const queryClient = useQueryClient();

  const [uploadedLicenseFiles, setUploadedLicenseFiles] = useState<
    string[] | null
  >(null);
  const [licenseUploadSuccessMessage, setLicenseUploadSuccessMessage] =
    useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(
    null,
  );
  const query = useQuery({
    queryKey: ["providerProfile"],
    queryFn: getProviderProfile,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const profileData = query.data;

  const updateProfileMutation = useMutation({
    mutationFn: updateProviderProfile,
    onSuccess: async (response) => {
      setSaveSuccessMessage(response.message);
      await queryClient.invalidateQueries({ queryKey: ["providerProfile"] });
    },
  });

  const uploadLicenseMutation = useMutation({
    mutationFn: async (documents: File[]) =>
      Promise.all(
        documents.map((document) => uploadProviderLicenseDocument(document)),
      ),
    onSuccess: async (_responses, documents) => {
      setLicenseUploadSuccessMessage(
        documents.length === 1
          ? "License document uploaded successfully."
          : `${documents.length} license documents uploaded successfully.`,
      );
      await queryClient.invalidateQueries({ queryKey: ["providerProfile"] });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: INITIAL_FORM,
  });

  useEffect(() => {
    if (!profileData) {
      return;
    }

    reset({
      firstName: profileData.firstName ?? "",
      lastName: profileData.lastName ?? "",
      email: profileData.email ?? "",
      phone: profileData.phone ?? "",
      specialty: profileData.specialty ?? "",
      licenseNumber: profileData.licenseNumber ?? "",
      yearsOfExperience: String(profileData.experience ?? ""),
      professionalBio: profileData.bio ?? "",
    });
  }, [profileData, reset]);

  const apiLicenseFiles = useMemo(
    () =>
      profileData?.licenseDocuments?.map((documentUrl) => {
        const urlSegment = documentUrl.split("/").pop() || documentUrl;
        return decodeURIComponent(urlSegment);
      }) ?? [],
    [profileData?.licenseDocuments],
  );

  const licenseFiles = uploadedLicenseFiles ?? apiLicenseFiles;

  const errorMessage = query.isError
    ? query.error instanceof Error
      ? query.error.message
      : "Unable to load profile data."
    : null;

  function onSubmit(data: ProfileForm) {
    setSaveSuccessMessage(null);

    updateProfileMutation.mutate({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      bio: data.professionalBio.trim(),
      specialty: data.specialty.trim(),
      experience: Number(data.yearsOfExperience),
    });
  }

  function handleLicenseUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setLicenseUploadSuccessMessage(null);
    setUploadedLicenseFiles(files.map((file) => file.name));

    uploadLicenseMutation.mutate(files);

    // Reset so selecting the same file still triggers onChange.
    event.target.value = "";
  }

  return (
    <div className="mx-auto max-w-4xl">
      {errorMessage && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {errorMessage}
        </div>
      )}

      {updateProfileMutation.isError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {updateProfileMutation.error instanceof Error
            ? updateProfileMutation.error.message
            : "Unable to update profile data."}
        </div>
      )}

      {saveSuccessMessage && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
          {saveSuccessMessage}
        </div>
      )}

      <Card className="py-0">
        <CardHeader className="border-b py-5">
          <CardTitle className="text-base font-semibold text-slate-800">
            Professional Profile
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Manage your professional information
          </CardDescription>
        </CardHeader>

        <CardContent className="py-5">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <ProfileAvatarUploader
              firstName={profileData?.firstName}
              lastName={profileData?.lastName}
              profileImageUrl={profileData?.profileImageUrl}
              disabled={query.isLoading || updateProfileMutation.isPending}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel className="text-xs font-medium text-slate-700">
                  First Name
                </FieldLabel>
                <FieldContent>
                  <Input
                    className="h-10"
                    aria-invalid={!!errors.firstName}
                    disabled={
                      query.isLoading || updateProfileMutation.isPending
                    }
                    {...register("firstName")}
                  />
                </FieldContent>
                <FieldError
                  errors={errors.firstName ? [errors.firstName] : []}
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-medium text-slate-700">
                  Last Name
                </FieldLabel>
                <FieldContent>
                  <Input
                    className="h-10"
                    aria-invalid={!!errors.lastName}
                    disabled={
                      query.isLoading || updateProfileMutation.isPending
                    }
                    {...register("lastName")}
                  />
                </FieldContent>
                <FieldError errors={errors.lastName ? [errors.lastName] : []} />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-medium text-slate-700">
                  Email
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="email"
                    className="h-10"
                    aria-invalid={!!errors.email}
                    disabled={
                      query.isLoading || updateProfileMutation.isPending
                    }
                    {...register("email")}
                  />
                </FieldContent>
                <FieldError errors={errors.email ? [errors.email] : []} />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-medium text-slate-700">
                  Phone
                </FieldLabel>
                <FieldContent>
                  <Input
                    className="h-10"
                    aria-invalid={!!errors.phone}
                    disabled={
                      query.isLoading || updateProfileMutation.isPending
                    }
                    {...register("phone")}
                  />
                </FieldContent>
                <FieldError errors={errors.phone ? [errors.phone] : []} />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-medium text-slate-700">
                  Professional Information
                </FieldLabel>
                <FieldContent>
                  <Input
                    className="h-10"
                    aria-invalid={!!errors.specialty}
                    disabled={
                      query.isLoading || updateProfileMutation.isPending
                    }
                    {...register("specialty")}
                  />
                </FieldContent>
                <FieldError
                  errors={errors.specialty ? [errors.specialty] : []}
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-medium text-slate-700">
                  License Number
                </FieldLabel>
                <FieldContent>
                  <Input
                    className="h-10"
                    aria-invalid={!!errors.licenseNumber}
                    disabled={
                      query.isLoading || updateProfileMutation.isPending
                    }
                    {...register("licenseNumber")}
                  />
                </FieldContent>
                <FieldError
                  errors={errors.licenseNumber ? [errors.licenseNumber] : []}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel className="text-xs font-medium text-slate-700">
                Years of Experience
              </FieldLabel>
              <FieldContent>
                <Input
                  className="h-10"
                  aria-invalid={!!errors.yearsOfExperience}
                  disabled={query.isLoading || updateProfileMutation.isPending}
                  {...register("yearsOfExperience")}
                />
              </FieldContent>
              <FieldError
                errors={
                  errors.yearsOfExperience ? [errors.yearsOfExperience] : []
                }
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs font-medium text-slate-700">
                Professional Bio
              </FieldLabel>
              <FieldContent>
                <Textarea
                  className="min-h-28 resize-none"
                  aria-invalid={!!errors.professionalBio}
                  disabled={query.isLoading || updateProfileMutation.isPending}
                  {...register("professionalBio")}
                />
              </FieldContent>
              <FieldError
                errors={errors.professionalBio ? [errors.professionalBio] : []}
              />
            </Field>

            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-700">
                License Documents
              </p>

              {uploadLicenseMutation.isError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                  {uploadLicenseMutation.error instanceof Error
                    ? uploadLicenseMutation.error.message
                    : "Unable to upload license document."}
                </div>
              )}

              {licenseUploadSuccessMessage && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
                  {licenseUploadSuccessMessage}
                </div>
              )}

              <label
                htmlFor="license-documents"
                className="block cursor-pointer"
              >
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center transition-colors hover:border-emerald-400/70">
                  <Upload className="mx-auto size-5 text-slate-500" />
                  <p className="mt-2 text-xs text-slate-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    PDF, JPG or PNG (max. 5MB)
                  </p>
                </div>
              </label>

              <input
                id="license-documents"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                multiple
                className="sr-only"
                disabled={
                  query.isLoading ||
                  updateProfileMutation.isPending ||
                  uploadLicenseMutation.isPending
                }
                onChange={handleLicenseUpload}
              />

              {licenseFiles.length > 0 && (
                <p className="text-xs text-slate-600">
                  {uploadLicenseMutation.isPending
                    ? `Uploading: ${licenseFiles[0]}`
                    : `Selected: ${licenseFiles.join(", ")}`}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                disabled={query.isLoading || updateProfileMutation.isPending}
                className="h-9 gap-2 bg-gradient-dash px-4"
              >
                <Save className="size-4" />
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
