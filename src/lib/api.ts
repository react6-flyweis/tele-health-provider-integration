import axios from "axios";

import { forceLogoutWithAlert, useAuthStore } from "@/store/authStore";

const API_BASE_URL = "https://mr-telerxs-backend.vercel.app/api/v1/provider";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status as number | undefined;
    const apiMessage =
      (error?.response?.data?.message as string | undefined) ?? "";
    const lowerMessage = apiMessage.toLowerCase();
    const hasToken = Boolean(useAuthStore.getState().token);

    if (
      hasToken &&
      (status === 401 ||
        lowerMessage.includes("expired") ||
        lowerMessage.includes("invalid token") ||
        lowerMessage.includes("jwt"))
    ) {
      forceLogoutWithAlert(
        "Your session is no longer valid. Please log in again.",
      );
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiMessage = error.response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
      return apiMessage;
    }

    if (error.message) {
      return error.message;
    }
  }

  return "Something went wrong. Please try again.";
}
