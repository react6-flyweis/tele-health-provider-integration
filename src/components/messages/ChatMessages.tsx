import type { MessageItem } from "@/components/messages/types";
import { cn } from "@/lib/utils";

type ChatMessagesProps = {
  messages: MessageItem[];
};

export function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="flex-1 space-y-4 bg-gray-50 overflow-y-auto p-4">
      {messages.map((message) => {
        const isPatientMessage = message.sender === "patient";

        return (
          <div
            key={message.id}
            className={cn(
              "max-w-[80%]",
              isPatientMessage ? "ml-auto" : "mr-auto",
            )}
          >
            <div
              className={cn(
                "rounded-xl border px-4 py-3 text-sm leading-6",
                isPatientMessage
                  ? "bg-gradient-dash border-transparent text-primary-foreground"
                  : "bg-card",
              )}
            >
              {message.text}
            </div>
            <p
              className={cn(
                "text-muted-foreground mt-1 text-xs",
                isPatientMessage ? "text-right" : "text-left",
              )}
            >
              {message.time}
            </p>
          </div>
        );
      })}
    </div>
  );
}
