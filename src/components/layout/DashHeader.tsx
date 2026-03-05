import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Search } from "lucide-react";

// store for managing the header title
import { usePageTitleStore } from "@/store/pageTitleStore";
import { SidebarTrigger } from "../ui/sidebar";

export default function DashHeader() {
  const title = usePageTitleStore((s) => s.title);
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
              <button
                aria-label="Notifications"
                className="rounded-md p-2 hover:bg-muted/50 transition-colors"
              >
                <Bell className="size-5 text-foreground" />
              </button>

              <span className="absolute -top-1 -right-0.5 flex h-5 w-5 items-center justify-center rounded-xl bg-gradient-dash text-[11px] font-semibold text-white ring-2 ring-background">
                2
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="size-10 border border-slate-100 bg-white">
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>

              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-semibold">Sarah Johnson</span>
                <span className="text-xs text-muted-foreground">
                  sarah.j@email.com
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
