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
    <div className="space-y-6 h-full min-h-screen">
      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] h-full">
        {/* sidebar: hide when a conversation is open on smaller screens */}
        <div className={activeConversationId ? "hidden xl:block" : "block"}>
          <MessagesSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onConversationSelect={setActiveConversationId}
          />
        </div>

        {/* chat window: hide when no conversation is selected on smaller screens */}
        <div className={activeConversationId ? "block" : "hidden xl:block"}>
          <ChatWindow
            activeConversation={activeConversation}
            onCloseConversation={() => setActiveConversationId(undefined)}
          />
        </div>
      </div>
    </div>
  );
}
