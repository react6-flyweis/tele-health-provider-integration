import type { Conversation } from "@/components/messages/types";
import { ChatHeader } from "@/components/messages/ChatHeader";
import { ChatMessages } from "@/components/messages/ChatMessages";
import { MessageComposer } from "@/components/messages/MessageComposer";
import { MessageSquare } from "lucide-react";

type ChatWindowProps = {
  activeConversation?: Conversation;
  isLoading?: boolean;
  errorMessage?: string | null;
  isSendingMessage?: boolean;
  sendMessageError?: string | null;
  onSendMessage: (content: string) => Promise<void>;
  onCloseConversation: () => void;
};

export function ChatWindow({
  activeConversation,
  isLoading,
  errorMessage,
  isSendingMessage,
  sendMessageError,
  onSendMessage,
  onCloseConversation,
}: ChatWindowProps) {
  if (isLoading && activeConversation) {
    return (
      <section className="flex h-full min-h-100 md:min-h-155 flex-col rounded-r-lg border bg-card">
        <ChatHeader
          conversation={activeConversation}
          onClose={onCloseConversation}
        />
        <div className="text-muted-foreground flex flex-1 items-center justify-center p-6 text-sm">
          Loading conversation...
        </div>
        <MessageComposer isDisabled />
      </section>
    );
  }

  if (errorMessage && activeConversation) {
    return (
      <section className="flex h-full min-h-100 md:min-h-155 flex-col rounded-r-lg border bg-card">
        <ChatHeader
          conversation={activeConversation}
          onClose={onCloseConversation}
        />
        <div className="text-red-700 flex flex-1 items-center justify-center p-6 text-sm">
          {errorMessage}
        </div>
        <MessageComposer isDisabled />
      </section>
    );
  }

  if (!activeConversation) {
    return (
      <section className="flex h-full min-h-100 items-center justify-center rounded-r-lg border bg-card p-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <MessageSquare className="text-muted-foreground size-14" />
          </div>
          <p className="text-base font-medium">Select a conversation</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Choose a patient from the list to start messaging
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-100 md:min-h-155 flex-col rounded-r-lg border bg-card">
      <ChatHeader
        conversation={activeConversation}
        onClose={onCloseConversation}
      />
      <ChatMessages messages={activeConversation.messages} />
      <MessageComposer
        onSend={onSendMessage}
        isSending={isSendingMessage}
        errorMessage={sendMessageError}
      />
    </section>
  );
}
