import { apiClient, getApiErrorMessage } from "@/lib/api";

export interface ProviderAvailabilitySlot {
  _id: string;
  startTime: string;
  endTime: string;
}

export interface ProviderAvailabilityDay {
  _id: string;
  day: string;
  slots: ProviderAvailabilitySlot[];
}

export interface ProviderSessionType {
  _id: string;
  name: string;
  duration: number;
  fee: number;
}

export interface ProviderBlockedDate {
  _id: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface ProviderAvailabilityData {
  availability: ProviderAvailabilityDay[];
  sessionTypes: ProviderSessionType[];
  blockedDates: ProviderBlockedDate[];
}

export interface UpdateProviderAvailabilityScheduleItem {
  day: string;
  slots: string[];
}

export interface UpdateProviderAvailabilityPayload {
  schedule: UpdateProviderAvailabilityScheduleItem[];
  timezone: string;
}

export interface UpdateProviderSessionTypeItem {
  name: string;
  duration: number;
  fee: number;
}

export interface UpdateProviderSessionTypesPayload {
  sessionTypes: UpdateProviderSessionTypeItem[];
}

export interface UpdateProviderBlockedDatesPayload {
  startDate: string;
  endDate: string;
  reason?: string;
}

interface ProviderAvailabilityResponse {
  status: "success" | "fail";
  data?: ProviderAvailabilityData;
  message?: string;
}

interface UpdateProviderAvailabilityResponse {
  status: "success" | "fail";
  data?: ProviderAvailabilityData;
  message?: string;
}

export async function getProviderAvailability() {
  try {
    const { data } =
      await apiClient.get<ProviderAvailabilityResponse>("/availability");

    if (data?.status !== "success" || !data?.data) {
      throw new Error(data?.message || "Could not load availability");
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function updateProviderAvailabilitySchedule(
  payload: UpdateProviderAvailabilityPayload,
) {
  try {
    const { data } = await apiClient.put<UpdateProviderAvailabilityResponse>(
      "/availability",
      payload,
    );

    if (data?.status !== "success") {
      throw new Error(data?.message || "Could not update availability");
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function updateProviderSessionTypes(
  payload: UpdateProviderSessionTypesPayload,
) {
  try {
    const { data } = await apiClient.put<UpdateProviderAvailabilityResponse>(
      "/availability/session-types",
      payload,
    );

    if (data?.status !== "success") {
      throw new Error(data?.message || "Could not update session types");
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
