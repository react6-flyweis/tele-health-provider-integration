import logo from "@/assets/images/logo.svg";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";
import { useState } from "react";
import LogoutDialog from "@/components/settings/LogoutDialog";
import { useAuthStore } from "@/store/authStore";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  LayoutGrid,
  Search,
  Calendar,
  Video,
  Pill,
  CreditCard,
  MessageSquare,
  Settings,
  LogOutIcon,
} from "lucide-react";
import { NavLink } from "react-router";

const SIDEBAR_MENU = [
  { href: "/dashboard", icon: LayoutGrid, label: "Dashboard", isActive: true },
  { href: "/dashboard/appointments", icon: Calendar, label: "Appointments" },
  { href: "/dashboard/video-sessions", icon: Video, label: "Video Sessions" },
  {
    href: "/dashboard/patient-records",
    icon: Search,
    label: "Patient Records",
  },
  { href: "/dashboard/prescriptions", icon: Pill, label: "Prescriptions" },
  { href: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
  { href: "/dashboard/earnings", icon: CreditCard, label: "Earnings" },
  { href: "/dashboard/availability", icon: Calendar, label: "Availability" },
  { href: "/dashboard/profile", icon: Search, label: "Profile" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  { href: "/provider-login", icon: LogOutIcon, label: "Logout" },
];

export default function DashSidebar() {
  const navigate = useNavigate();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
const clearAuth = useAuthStore((state) => state.clearAuth);
  return (
    <Sidebar side="left">
      <SidebarHeader className="border-b p-3 mb-5">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <img src={logo} alt="Mental Health Tele" className="h-9 w-auto" />
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {SIDEBAR_MENU.map(({ href, icon: Icon, label }) => {
                const isLogout = label === "Logout";

               if (isLogout) {
  return (
    <SidebarMenuItem key={href}>
      <button
        onClick={() => setIsLogoutDialogOpen(true)}
        className="w-full"
      >
        <SidebarMenuButton
          className={cn(
            "h-10",
            "hover:bg-red-50 text-red-500 [&_svg]:text-red-500 hover:text-red-600"
          )}
        >
          <Icon />
          <span>{label}</span>
        </SidebarMenuButton>
      </button>
    </SidebarMenuItem>
  );
}

                return (
                  <SidebarMenuItem key={href}>
                    <NavLink
                      to={href}
                      end={href === "/dashboard"}
                      className="w-full"
                    >
                      {({ isActive }) => (
                        <SidebarMenuButton
                          className={cn(
                            "h-10",
                            isActive && "bg-gradient-dash text-white!",
                          )}
                          isActive={isActive}
                        >
                          <Icon />
                          <span>{label}</span>
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto">
        <SidebarSeparator />
        <SidebarFooter className="px-4 py-3 text-sm text-muted-foreground">
          © 2026 MindCare
        </SidebarFooter>
      </div>
      <LogoutDialog
  open={isLogoutDialogOpen}
  onOpenChange={setIsLogoutDialogOpen}
  onConfirm={() => {
    clearAuth();
    setIsLogoutDialogOpen(false);
    navigate("/provider-login", { replace: true });
  }}
/>
    </Sidebar>
  );
}
