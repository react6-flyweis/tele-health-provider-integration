import { useEffect } from "react";
import { create } from "zustand";

interface PageTitleState {
  title: string;
  setTitle: (t: string) => void;
}

// simple global store for current page title
export const usePageTitleStore = create<PageTitleState>((set) => ({
  title: "",
  setTitle: (t: string) => set({ title: t }),
}));

// hook to set the title when a component mounts or when the value changes
export function usePageTitle(title: string) {
  const setTitle = usePageTitleStore((s) => s.setTitle);

  useEffect(() => {
    setTitle(title);
    return () => {
      // optionally clear title on unmount
      setTitle("");
    };
  }, [title, setTitle]);
}
