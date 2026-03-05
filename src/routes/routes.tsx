import { lazy } from "react";
import type { RouteObject } from "react-router";

import AuthLayout from "@/components/layout/AuthLayout";
import DashLayout from "@/components/layout/DashLayout";
import { NotFound } from "@/page/NotFound";

// lazily load page components
const SignupRolePage = lazy(() => import("@/page/SignupRolePage"));
const PatientLoginPage = lazy(() => import("@/page/PatientLoginPage"));
const ProviderLoginPage = lazy(() => import("@/page/ProviderLoginPage"));
const DashboardPage = lazy(() => import("@/page/DashboardPage"));
const AppointmentsPage = lazy(() => import("@/page/AppointmentsPage"));
const VideoSessionsPage = lazy(() => import("@/page/VideoSessionsPage"));
const SingleVideoSessionPage = lazy(
  () => import("@/page/SingleVideoSessionPage"),
);
const PatientRecordsPage = lazy(() => import("@/page/PatientRecordsPage"));
const EarningsPage = lazy(() => import("@/page/EarningsPage"));

export const Routes: RouteObject[] = [
  {
    element: <AuthLayout />, // default path is "/"
    children: [
      { path: "/", element: <SignupRolePage /> },
      { path: "patient-login", element: <PatientLoginPage /> },
      { path: "provider-login", element: <ProviderLoginPage /> },
    ],
  },
  {
    path: "dashboard",
    element: <DashLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "appointments", element: <AppointmentsPage /> },
      { path: "video-sessions", element: <VideoSessionsPage /> },
      { path: "video-sessions/live", element: <SingleVideoSessionPage /> },
      { path: "patient-records", element: <PatientRecordsPage /> },
      { path: "earnings", element: <EarningsPage /> },
      // catch-all within dashboard
      { path: "*", element: <NotFound /> },
    ],
  },
  // global 404 (optional)
  { path: "*", element: <NotFound /> },
];
