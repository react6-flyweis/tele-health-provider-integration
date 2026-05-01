import { apiClient } from "@/lib/api";
import type {
  LoginPayload,
  ProviderLoginResponse,
  ProviderRegisterResponse,
  ProviderSpecialtiesData,
  RegisterProviderPayload,
} from "@/types/auth";

export async function loginProvider(payload: LoginPayload) {
  const { data } = await apiClient.post<ProviderLoginResponse>(
    "/auth/login",
    payload,
  );

  if (data.status !== "success" || !data.data?.token) {
    throw new Error(data.message || "Invalid email or password");
  }

  return data.data;
}

export async function registerProvider(payload: RegisterProviderPayload) {
  const { data } = await apiClient.post<ProviderRegisterResponse>(
    "/auth/register",
    payload,
  );

  if (data.status !== "success") {
    throw new Error(data.message || "Unable to create provider account");
  }

  return data.data;
}

export async function getProviderSpecialties() {
  const { data } = await apiClient.get<{
    status: "success" | "fail";
    results?: number;
    data?: ProviderSpecialtiesData;
    message?: string;
  }>("/auth/specialties");

  if (data.status !== "success" || !data.data?.specialties) {
    throw new Error(data.message || "Unable to load specialties");
  }

  return data.data;
}
