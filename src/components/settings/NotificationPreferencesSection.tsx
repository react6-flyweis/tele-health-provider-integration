import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";

import {
  getProviderNotificationPreferences,
  type ProviderNotificationPreferences,
} from "@/api/settings";
import { useUpdateNotificationPreferencesMutation } from "@/hooks/useNotificationPreferencesMutations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

const DEFAULT_NOTIFICATION_PREFERENCES: ProviderNotificationPreferences = {
  email: true,
  sms: false,
  push: true,
  emailAppointments: true,
  emailMessages: true,
  pushAppointments: true,
};

const TOGGLE_ITEMS: Array<{
  key: keyof ProviderNotificationPreferences;
  label: string;
}> = [
  { key: "email", label: "Email Notifications" },
  { key: "sms", label: "SMS Notifications" },
  { key: "push", label: "Push Notifications" },
  { key: "emailAppointments", label: "Email - Appointments" },
  { key: "emailMessages", label: "Email - Messages" },
  { key: "pushAppointments", label: "Push - Appointments" },
];

function arePreferencesEqual(
  left: ProviderNotificationPreferences,
  right: ProviderNotificationPreferences,
) {
  return (
    left.email === right.email &&
    left.sms === right.sms &&
    left.push === right.push &&
    left.emailAppointments === right.emailAppointments &&
    left.emailMessages === right.emailMessages &&
    left.pushAppointments === right.pushAppointments
  );
}

export default function NotificationPreferencesSection() {
  const [draftPreferences, setDraftPreferences] =
    useState<ProviderNotificationPreferences | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(
    null,
  );

  const query = useQuery({
    queryKey: ["notificationPreferences"],
    queryFn: getProviderNotificationPreferences,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  const updatePreferencesMutation = useUpdateNotificationPreferencesMutation();

  useEffect(() => {
    if (!query.data) {
      return;
    }

    setDraftPreferences(query.data);
  }, [query.data]);

  const currentPreferences =
    draftPreferences ?? query.data ?? DEFAULT_NOTIFICATION_PREFERENCES;

  const hasUnsavedChanges = useMemo(() => {
    const source = query.data ?? DEFAULT_NOTIFICATION_PREFERENCES;
    return !arePreferencesEqual(currentPreferences, source);
  }, [currentPreferences, query.data]);

  const loadErrorMessage = query.isError
    ? query.error instanceof Error
      ? query.error.message
      : "Unable to load notification settings."
    : null;

  const updateErrorMessage = updatePreferencesMutation.isError
    ? updatePreferencesMutation.error instanceof Error
      ? updatePreferencesMutation.error.message
      : "Unable to update notification settings."
    : null;

  function handleToggle(key: keyof ProviderNotificationPreferences) {
    setSaveSuccessMessage(null);

    setDraftPreferences((prev) => {
      const source = prev ?? query.data ?? DEFAULT_NOTIFICATION_PREFERENCES;
      return { ...source, [key]: !source[key] };
    });
  }

  function handleSave() {
    setSaveSuccessMessage(null);

    updatePreferencesMutation.mutate(
      {
        emailNotifications: currentPreferences.email,
        smsNotifications: currentPreferences.sms,
        appointmentReminders:
          currentPreferences.emailAppointments ||
          currentPreferences.pushAppointments,
        marketingEmails: currentPreferences.emailMessages,
      },
      {
        onSuccess: (response) => {
          setSaveSuccessMessage(response.message);

          if (response.prefs) {
            setDraftPreferences(response.prefs);
          }
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader className="border-b flex gap-2">
        <div className="bg-gradient-dash rounded-md size-10 text-white flex items-center justify-center">
          <Bell className="size-5" />
        </div>
        <div>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage how you receive notifications
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {query.isLoading || query.isFetching ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton
                key={`notifications-skeleton-${idx}`}
                className="h-10 w-full"
              />
            ))}
          </div>
        ) : null}

        {loadErrorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadErrorMessage}
          </div>
        ) : null}

        {updateErrorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {updateErrorMessage}
          </div>
        ) : null}

        {saveSuccessMessage ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {saveSuccessMessage}
          </div>
        ) : null}

        {!query.isLoading && !query.isFetching ? (
          <>
            {TOGGLE_ITEMS.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3"
              >
                <span>{item.label}</span>
                <Switch
                  checked={currentPreferences[item.key]}
                  onCheckedChange={() => handleToggle(item.key)}
                  disabled={updatePreferencesMutation.isPending}
                />
              </div>
            ))}

            <Button
              className="w-fit bg-gradient-dash"
              onClick={handleSave}
              disabled={
                updatePreferencesMutation.isPending ||
                query.isLoading ||
                !hasUnsavedChanges
              }
            >
              {updatePreferencesMutation.isPending
                ? "Saving..."
                : "Save Notification Preferences"}
            </Button>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
