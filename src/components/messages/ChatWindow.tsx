import type { Conversation } from "@/components/messages/types";
import { ChatHeader } from "@/components/messages/ChatHeader";
import { ChatMessages } from "@/components/messages/ChatMessages";
import { MessageComposer } from "@/components/messages/MessageComposer";
import { MessageSquare } from "lucide-react";

type ChatWindowProps = {
  activeConversation?: Conversation;
  onCloseConversation: () => void;
};

export function ChatWindow({
  activeConversation,
  onCloseConversation,
}: ChatWindowProps) {
  if (!activeConversation) {
    return (
      <section className="flex h-full min-h-[400px] items-center justify-center rounded-r-lg border bg-card p-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <MessageSquare className="text-muted-foreground size-14" />
          </div>
          <p className="text-base font-medium">Select a conversation</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Choose a therapist from the list to start messaging
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-[400px] md:min-h-[620px] flex-col rounded-r-lg border bg-card">
      <ChatHeader
        conversation={activeConversation}
        onClose={onCloseConversation}
      />
      <ChatMessages messages={activeConversation.messages} />
      <MessageComposer />
    </section>
  );
}
