import { apiClient } from "@/lib/api";
import type {
  LoginPayload,
  ProviderLoginResponse,
  ProviderRegisterResponse,
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
