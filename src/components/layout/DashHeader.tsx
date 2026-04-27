import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";

// store for managing the header title
import { usePageTitleStore } from "@/store/pageTitleStore";
import { useAuthStore } from "@/store/authStore";
import { SidebarTrigger } from "../ui/sidebar";
import { Link } from "react-router";
import NotificationDrawer from "./NotificationDrawer";

export default function DashHeader() {
  const title = usePageTitleStore((s) => s.title);
  const provider = useAuthStore((state) => state.provider);

  // const fullName = provider
  //   ? `${provider.firstName} ${provider.lastName}`
  //   : "Provider";
  const initials = provider
    ? `${provider.firstName.charAt(0)}${provider.lastName.charAt(0)}`.toUpperCase()
    : "PR";

  return (
    <header className="w-full">
      <div className="container mx-auto flex items-center justify-between gap-6 px-4 py-4">
        <div className="flex flex-1 items-center justify-between gap-6">
          <SidebarTrigger className="md:hidden" />
          {/* optionally show a page title from the store */}
          {title && <h1 className="text-xl font-semibold">{title}</h1>}

          {/* Search */}
          <div className="flex-1 max-w-sm hidden sm:block">
            <InputGroup className="h-10 border bg-muted/70 shadow-none">
              <InputGroupAddon className="pl-4">
                <Search className="size-4 text-muted-foreground" />
              </InputGroupAddon>

              <InputGroupInput
                placeholder="Search therapist, appointment, prescription..."
                className="pr-4"
              />
            </InputGroup>
          </div>

          {/* Notifications + Profile */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <NotificationDrawer />
            </div>

            <Link to="/dashboard/profile" className="">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border border-slate-100 bg-white">
                  <AvatarImage src={provider?.profileImageUrl} alt={initials} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                {/* <div className="hidden sm:flex flex-col">
                <span className="text-sm font-semibold">{fullName}</span>
                <span className="text-xs text-muted-foreground">
                  {provider?.email ?? "provider@email.com"}
                </span>
              </div> */}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
