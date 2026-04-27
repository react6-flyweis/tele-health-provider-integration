import { apiClient, getApiErrorMessage } from "@/lib/api";

export interface ProviderEarningsSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  lifetime: number;
  currency: string;
}

export interface ProviderEarningsPatient {
  _id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  patientCode?: string;
}

export interface ProviderEarningsAppointment {
  _id: string;
  patientId: ProviderEarningsPatient;
  date: string;
  type: string;
  appointmentType?: string;
}

export interface ProviderRecentPayment {
  _id: string;
  appointmentId: ProviderEarningsAppointment;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface ProviderEarningsData {
  summary: ProviderEarningsSummary;
  period: string;
  totalEarnings: number;
  totalPaidSessions: number;
  monthlySummary: Record<string, number>;
  recentPayments: ProviderRecentPayment[];
}

interface ProviderEarningsResponse {
  status: "success" | "fail";
  data: ProviderEarningsData;
  message?: string;
}

export async function getProviderEarnings() {
  try {
    const response = await apiClient.get<ProviderEarningsResponse>("/earnings");
    const data = response.data;

    if (data?.status !== "success" || !data?.data) {
      throw new Error(data?.message || "Could not load earnings data");
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
