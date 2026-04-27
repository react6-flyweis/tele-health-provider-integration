import { apiClient, getApiErrorMessage } from "@/lib/api";

export type ProviderAppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface ProviderAppointmentPatient {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  profileImageUrl?: string;
  patientCode?: string;
}

export interface ProviderAppointment {
  _id: string;
  patientId: ProviderAppointmentPatient;
  providerId: string;
  date: string;
  time: string;
  status: ProviderAppointmentStatus;
  type: string;
  reasonForVisit?: string;
  notes?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  appointmentType?: string;
}

interface ProviderAppointmentData {
  appointments: ProviderAppointment[];
  results: number;
  total: number;
}

interface ProviderAppointmentsResponse {
  status: "success" | "fail";
  results: number;
  total: number;
  data: ProviderAppointmentData;
  message?: string;
}

export interface GetProviderAppointmentsParams {
  status: ProviderAppointmentStatus | "upcoming";
  page?: number;
  limit?: number;
}

export async function getProviderAppointments({
  status,
  page = 1,
  limit = 10,
}: GetProviderAppointmentsParams) {
  try {
    const params: Record<string, string | number> = {
      page,
      limit,
    };

    if (status === "upcoming") {
      params.status = "pending";
    } else {
      params.status = status;
    }

    const response = await apiClient.get<ProviderAppointmentsResponse>(
      "/appointments",
      {
        params,
      },
    );

    const data = response.data;

    if (data?.status !== "success" || !data?.data) {
      throw new Error(data?.message || "Could not fetch appointments");
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

interface ProviderAppointmentMutationResponse {
  status: "success" | "fail";
  data?: {
    appointment?: ProviderAppointment;
  };
  message?: string;
}

export async function confirmProviderAppointment(appointmentId: string) {
  try {
    const response = await apiClient.put<ProviderAppointmentMutationResponse>(
      `/appointments/${appointmentId}/confirm`,
    );

    if (response.data?.status !== "success") {
      throw new Error(
        response.data?.message || "Could not confirm appointment",
      );
    }

    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function rejectProviderAppointment(appointmentId: string) {
  try {
    const response = await apiClient.put<ProviderAppointmentMutationResponse>(
      `/appointments/${appointmentId}/reject`,
    );

    if (response.data?.status !== "success") {
      throw new Error(response.data?.message || "Could not reject appointment");
    }

    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function completeProviderAppointment(appointmentId: string) {
  try {
    const response = await apiClient.put<ProviderAppointmentMutationResponse>(
      `/appointments/${appointmentId}/complete`,
    );

    if (response.data?.status !== "success") {
      throw new Error(
        response.data?.message || "Could not complete appointment",
      );
    }

    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
