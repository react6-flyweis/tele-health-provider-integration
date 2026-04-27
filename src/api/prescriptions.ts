import { apiClient, getApiErrorMessage } from "@/lib/api";

export type ProviderPrescriptionStatus = "active" | "completed";

export interface ProviderPrescriptionPatient {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  profileImageUrl?: string;
  patientCode?: string;
}

export interface ProviderPrescriptionProvider {
  _id: string;
  firstName: string;
  lastName: string;
  specialty?: string;
  profileImageUrl?: string;
  licenseNumber?: string;
}

export interface ProviderPrescriptionAppointment {
  _id: string;
  date: string;
  time: string;
  type?: string;
}

export interface ProviderPrescriptionMedication {
  _id?: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface ProviderPrescription {
  _id: string;
  patientId: ProviderPrescriptionPatient;
  providerId: string | ProviderPrescriptionProvider;
  appointmentId?: ProviderPrescriptionAppointment;
  medications: ProviderPrescriptionMedication[];
  instructions?: string;
  refillsRemaining?: number;
  nextRefillDate?: string;
  date: string;
  status: ProviderPrescriptionStatus;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ProviderPrescriptionsData {
  prescriptions: ProviderPrescription[];
}

interface ProviderPrescriptionsResponse {
  status: "success" | "fail";
  results: number;
  total: number;
  data?: ProviderPrescriptionsData;
  message?: string;
}

interface ProviderPrescriptionDetailData {
  prescription: ProviderPrescription;
}

interface ProviderPrescriptionDetailResponse {
  status: "success" | "fail";
  data?: ProviderPrescriptionDetailData;
  message?: string;
}

export interface CreateProviderPrescriptionPayload {
  patientId: string;
  medications: ProviderPrescriptionMedication[];
  instructions?: string;
  refillsAllowed?: number;
}

interface CreateProviderPrescriptionData {
  prescription: ProviderPrescription;
}

interface CreateProviderPrescriptionResponse {
  status: "success" | "fail";
  data?: CreateProviderPrescriptionData;
  message?: string;
}

export async function getProviderPrescriptions() {
  try {
    const response =
      await apiClient.get<ProviderPrescriptionsResponse>("/prescriptions");

    const data = response.data;

    if (data?.status !== "success" || !data?.data) {
      throw new Error(data?.message || "Could not load prescriptions");
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function getProviderPrescriptionDetail(prescriptionId: string) {
  try {
    const response = await apiClient.get<ProviderPrescriptionDetailResponse>(
      `/prescriptions/${prescriptionId}`,
    );

    const data = response.data;

    if (data?.status !== "success" || !data?.data) {
      throw new Error(data?.message || "Could not load prescription details");
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function createProviderPrescription(
  payload: CreateProviderPrescriptionPayload,
) {
  try {
    const response = await apiClient.post<CreateProviderPrescriptionResponse>(
      "/prescriptions",
      payload,
    );

    const data = response.data;

    if (data?.status !== "success") {
      throw new Error(data?.message || "Could not create prescription");
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
