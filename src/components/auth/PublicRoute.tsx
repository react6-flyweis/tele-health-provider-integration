import { Navigate, Outlet } from "react-router";

import { Loading } from "@/components/Loading";
import { useAuthStore } from "@/store/authStore";

export default function PublicRoute() {
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return <Loading />;
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
