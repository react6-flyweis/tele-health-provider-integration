import { apiClient, getApiErrorMessage } from "@/lib/api";

export interface ProviderSessionPatient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ProviderSessionAppointment {
  _id: string;
  patientId: ProviderSessionPatient;
  providerId: string;
  date: string;
  time: string;
  status: string;
  type: string;
  reasonForVisit: string;
  appointmentType?: string;
  notes?: string;
}

export interface ProviderSession {
  _id: string;
  appointmentId: ProviderSessionAppointment;
  status: string;
  roomName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  providerNotes?: string | null;
}

interface ProviderSessionsResponse {
  status: "success" | "fail";
  results: number;
  total: number;
  data: {
    sessions: ProviderSession[];
  };
  message?: string;
}

export async function getProviderSessions() {
  try {
    const { data } = await apiClient.get<ProviderSessionsResponse>("/sessions");

    if (data?.status !== "success" || !data?.data?.sessions) {
      throw new Error(data?.message || "Could not load provider sessions");
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
