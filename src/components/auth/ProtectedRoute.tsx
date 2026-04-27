import { Navigate, Outlet, useLocation } from "react-router";

import { Loading } from "@/components/Loading";
import { isTokenExpired } from "@/lib/token";
import { forceLogoutWithAlert, useAuthStore } from "@/store/authStore";

export default function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const location = useLocation();

  if (!hasHydrated) {
    return <Loading />;
  }

  if (token && isTokenExpired(token)) {
    forceLogoutWithAlert("Your session has expired. Please log in again.");
    return <Navigate to="/provider-login" replace />;
  }

  if (!token) {
    return (
      <Navigate
        to="/provider-login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
}
