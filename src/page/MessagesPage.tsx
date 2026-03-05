import { useMemo, useState } from "react";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { MessagesSidebar } from "@/components/messages/MessagesSidebar";
import { conversations } from "@/components/messages/messages-data";

export default function MessagesPage() {
  const [activeConversationId, setActiveConversationId] = useState<
    string | undefined
  >(undefined);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId),
    [activeConversationId],
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)]">
        <MessagesSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onConversationSelect={setActiveConversationId}
        />

        <ChatWindow
          activeConversation={activeConversation}
          onCloseConversation={() => setActiveConversationId(undefined)}
        />
      </div>
    </div>
  );
}
