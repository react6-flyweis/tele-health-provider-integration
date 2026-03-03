import DashHeader from "@/components/layout/DashHeader";
import DashSidebar from "@/components/layout/DashSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Outlet } from "react-router";

export default function DashLayout() {
  return (
    <SidebarProvider className="font-serif">
      <DashSidebar />

      <SidebarInset>
        <DashHeader />
        <div className="container mx-auto bg-[#F9FAFB] px-4 py-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
