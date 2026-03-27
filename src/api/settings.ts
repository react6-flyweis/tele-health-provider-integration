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

export interface ProviderPaymentAccount {
  bankName: string;
  last4: string;
  accountType: string;
  stripeAccountId: string;
}

export interface ProviderDataExport {
  exportedAt?: string;
  [key: string]: unknown;
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

interface PaymentAccountResponse {
  status: "success" | "fail";
  data?: {
    paymentAccount?: ProviderPaymentAccount;
  };
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

export async function getProviderPaymentAccount() {
  try {
    const { data } = await apiClient.get<PaymentAccountResponse>(
      "/settings/payment-account",
    );

    const paymentAccount = data?.data?.paymentAccount;

    if (data?.status !== "success" || !paymentAccount) {
      throw new Error(data?.message || "Could not load payment account");
    }

    return paymentAccount;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function downloadProviderDataExport() {
  try {
    const { data } = await apiClient.get<
      ProviderDataExport | { data?: ProviderDataExport }
    >("/settings/download-data");

    const payload =
      typeof data === "object" && data !== null && "data" in data
        ? data.data
        : data;

    if (!payload || typeof payload !== "object") {
      throw new Error("Could not download provider data");
    }

    return payload as ProviderDataExport;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
