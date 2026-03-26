import { apiClient, getApiErrorMessage } from "@/lib/api";

export interface ProviderNotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  emailAppointments: boolean;
  emailMessages: boolean;
  pushAppointments: boolean;
}

export interface UpdateProviderNotificationPreferencesPayload {
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  marketingEmails: boolean;
}

export interface UpdateProviderPasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface NotificationPreferencesResponse {
  status: "success" | "fail";
  data?: {
    notificationPrefs?: ProviderNotificationPreferences;
  };
  message?: string;
}

interface UpdateNotificationPreferencesResponse {
  status: "success" | "fail";
  data?: {
    notificationPrefs?: ProviderNotificationPreferences;
  };
  message?: string;
}

interface UpdatePasswordResponse {
  status: "success" | "fail";
  message?: string;
}

export async function getProviderNotificationPreferences() {
  try {
    const { data } = await apiClient.get<NotificationPreferencesResponse>(
      "/settings/notifications",
    );

    if (data?.status !== "success" || !data?.data?.notificationPrefs) {
      throw new Error(data?.message || "Could not load notification settings");
    }

    return data.data.notificationPrefs;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function updateProviderNotificationPreferences(
  payload: UpdateProviderNotificationPreferencesPayload,
) {
  try {
    const { data } = await apiClient.put<UpdateNotificationPreferencesResponse>(
      "/settings/notifications",
      payload,
    );

    if (data?.status !== "success") {
      throw new Error(
        data?.message || "Could not update notification settings",
      );
    }

    return {
      prefs: data?.data?.notificationPrefs,
      message: data?.message || "Notification settings updated successfully.",
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function updateProviderPassword(
  payload: UpdateProviderPasswordPayload,
) {
  try {
    const { data } = await apiClient.put<UpdatePasswordResponse>(
      "/settings/password",
      payload,
    );

    if (data?.status !== "success") {
      throw new Error(data?.message || "Could not update password");
    }

    return {
      message: data?.message || "Password updated successfully.",
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
