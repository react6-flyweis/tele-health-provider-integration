import { apiClient, getApiErrorMessage } from "@/lib/api";

export type ProviderPatientGender = "male" | "female" | null;

export type ProviderPatientAppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface ProviderPatientProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: ProviderPatientGender;
  dateOfBirth?: string;
  profileImageUrl?: string;
  patientCode?: string;
}

export interface ProviderPatientLastAppointment {
  date: string;
  time: string;
  status: ProviderPatientAppointmentStatus;
}

export interface ProviderPatientRecord {
  patient: ProviderPatientProfile;
  age: number | null;
  sessionCount: number;
  lastAppointment?: ProviderPatientLastAppointment;
}

export interface ProviderPatientNotificationPrefs {
  email: boolean;
  sms: boolean;
  push: boolean;
  appointmentReminders: boolean;
  newMessages: boolean;
  treatmentReminders: boolean;
}

export interface ProviderPatientBilling {
  billingAddress?: string;
  autoPay?: boolean;
}

export interface ProviderPatientPrivacy {
  shareDataForResearch?: boolean;
  marketingCommunications?: boolean;
}

export interface ProviderPatientDetail extends ProviderPatientProfile {
  notificationPrefs?: ProviderPatientNotificationPrefs;
  billing?: ProviderPatientBilling;
  privacy?: ProviderPatientPrivacy;
  medicalHistory?: string[];
  currentDiagnosis?: string;
  treatmentPlan?: string;
  currentMedications?: string;
  address?: string;
  insurance?: string;
  ssn?: string;
  maritalStatus?: string;
  country?: string;
  timezone?: string;
  age?: number;
}

export interface ProviderPatientAppointment {
  _id: string;
  patientId: string;
  providerId: string;
  date: string;
  time: string;
  status: ProviderPatientAppointmentStatus;
  type?: string;
  appointmentType?: string;
  notes?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ProviderPatientsData {
  patients: ProviderPatientRecord[];
}

interface ProviderPatientsResponse {
  status: "success" | "fail";
  results: number;
  data?: ProviderPatientsData;
  message?: string;
}

interface ProviderPatientDetailData {
  patient: ProviderPatientDetail;
  sessionCount: number;
  appointments: ProviderPatientAppointment[];
}

interface ProviderPatientDetailResponse {
  status: "success" | "fail";
  data?: ProviderPatientDetailData;
  message?: string;
}

export interface UpdateProviderPatientRecordPayload {
  diagnosis?: string;
  treatmentNotes?: string;
  medicalHistory?: string;
}

interface UpdateProviderPatientRecordResponse {
  status: "success" | "fail";
  message?: string;
}

export async function getProviderPatients() {
  try {
    const response = await apiClient.get<ProviderPatientsResponse>("/patients");

    const data = response.data;

    if (data?.status !== "success" || !data?.data) {
      throw new Error(data?.message || "Could not load patients");
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function getProviderPatientDetail(patientId: string) {
  try {
    const response = await apiClient.get<ProviderPatientDetailResponse>(
      `/patients/${patientId}`,
    );

    const data = response.data;

    if (data?.status !== "success" || !data?.data) {
      throw new Error(data?.message || "Could not load patient details");
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function updateProviderPatientRecord(
  patientId: string,
  payload: UpdateProviderPatientRecordPayload,
) {
  try {
    const response = await apiClient.put<UpdateProviderPatientRecordResponse>(
      `/patients/${patientId}`,
      payload,
    );

    if (response.data?.status !== "success") {
      throw new Error(response.data?.message || "Could not update patient");
    }

    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
