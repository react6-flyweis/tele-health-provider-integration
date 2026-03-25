import { apiClient } from "@/lib/api";
import type { LoginPayload, ProviderLoginResponse } from "@/types/auth";

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
