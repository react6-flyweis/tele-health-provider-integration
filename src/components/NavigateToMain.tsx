import { useEffect } from "react";

// simple component that redirects the user to the main public website
// the URL is defined in VITE_MAIN_WEBSITE_URL; if not available we fall
// back to the internal dashboard route.
export default function NavigateToMain() {
  const websiteURL = import.meta.env.VITE_MAIN_WEBSITE_URL;

  useEffect(() => {
    if (websiteURL) {
      window.location.href = websiteURL;
    } else {
      // fallback to internal route so the app doesn't get stuck
      window.location.href = "/dashboard";
    }
  }, [websiteURL]);

  return null; // nothing to render, navigation happens immediately
}
