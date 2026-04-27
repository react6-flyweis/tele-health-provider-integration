import { apiClient, getApiErrorMessage } from "@/lib/api";

export interface DashboardStats {
  todayAppointments: number;
  todayEarnings: number;
  pendingFollowups: number;
  totalSessionsThisMonth: number;
  uniquePatients: number;
}

export interface DashboardEarnings {
  today: number;
  thisWeek: number;
  thisMonth: number;
  currency: string;
}

export interface DashboardAppointment {
  _id: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  providerId: string;
  date: string;
  time: string;
  status: string;
  type: string;
  reasonForVisit: string;
  appointmentType?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  earnings: DashboardEarnings;
  todayAppointments: DashboardAppointment[];
  upcomingConsultations: DashboardAppointment[];
  pendingFollowups: DashboardAppointment[];
}

interface DashboardResponse {
  status: "success" | "fail";
  data: DashboardData;
  message?: string;
}

export async function getProviderDashboard() {
  try {
    const { data } = await apiClient.get<DashboardResponse>("/dashboard");

    if (data?.status !== "success" || !data?.data) {
      throw new Error(data?.message || "Could not load dashboard data");
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
