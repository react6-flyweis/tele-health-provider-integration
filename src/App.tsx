import { Suspense, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Routes } from "@/routes/routes";
import { Loading } from "@/components/Loading";
import { useAuthStore } from "@/store/authStore";

const router = createBrowserRouter(Routes);

export function App() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const validateStoredToken = useAuthStore(
    (state) => state.validateStoredToken,
  );

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    validateStoredToken();
  }, [hasHydrated, validateStoredToken]);

  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
