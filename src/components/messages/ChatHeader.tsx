import type { Conversation } from "@/components/messages/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { X } from "lucide-react";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type ChatHeaderProps = {
  conversation: Conversation;
  onClose: () => void;
};

export function ChatHeader({ conversation, onClose }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-3">
        {/* mobile back button placed at start */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-muted-foreground md:hidden"
        >
          <ArrowLeft className="size-5" />
        </Button>

        <Avatar className="size-10">
          <AvatarFallback>{conversation.avatarInitials}</AvatarFallback>
        </Avatar>

        <div>
          <p className="text-base font-medium">{conversation.providerName}</p>
          <p className="text-muted-foreground text-sm">
            {conversation.specialty}
          </p>
        </div>
      </div>
    </div>
  );
}
