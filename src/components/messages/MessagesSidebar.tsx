import type { Conversation } from "@/components/messages/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type MessagesSidebarProps = {
  conversations: Conversation[];
  activeConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
};

export function MessagesSidebar({
  conversations,
  activeConversationId,
  onConversationSelect,
  isLoading,
  errorMessage,
}: MessagesSidebarProps) {
  return (
    <aside className="h-full rounded-l-lg border bg-card">
      <div className="border-b p-3">
        <div className="relative">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search conversations..."
            className="h-9 bg-muted pl-9"
          />
        </div>
      </div>

      <div className="h-105 overflow-y-auto md:h-140">
        <div className="divide-y">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`conversation-skeleton-${index}`}
                  className="px-3 py-3"
                >
                  <Skeleton className="h-14 w-full" />
                </div>
              ))
            : null}

          {!isLoading && errorMessage ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              Conversations are unavailable right now.
            </p>
          ) : null}

          {!isLoading && !errorMessage && conversations.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              No conversations found.
            </p>
          ) : null}

          {!isLoading && !errorMessage
            ? conversations.map((conversation) => {
                const isActive = activeConversationId === conversation.id;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => onConversationSelect(conversation.id)}
                    className={cn(
                      "w-full px-3 py-3 text-left transition-colors",
                      isActive ? "bg-muted/70" : "hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="mt-0.5 size-10">
                        <AvatarFallback>
                          {conversation.avatarInitials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">
                            {conversation.providerName}
                          </p>
                          <p className="text-muted-foreground shrink-0 text-xs">
                            {conversation.previewTime || "-"}
                          </p>
                        </div>

                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {conversation.specialty}
                        </p>

                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="text-muted-foreground line-clamp-1 text-xs">
                            {conversation.previewText}
                          </p>
                          {conversation.unreadCount ? (
                            <Badge className="bg-gradient-dash h-5 min-w-5 rounded-full px-1.5 text-[10px]">
                              {conversation.unreadCount}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            : null}
        </div>
      </div>
    </aside>
  );
}
