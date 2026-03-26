import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send } from "lucide-react";

type MessageComposerProps = {
  onSend?: (content: string) => Promise<void>;
  isSending?: boolean;
  isDisabled?: boolean;
  errorMessage?: string | null;
};

export function MessageComposer({
  onSend,
  isSending,
  isDisabled,
  errorMessage,
}: MessageComposerProps) {
  const [content, setContent] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onSend || isDisabled || isSending) {
      return;
    }

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    try {
      await onSend(trimmedContent);
      setContent("");
    } catch {
      // Error state is surfaced by the parent mutation.
    }
  }

  return (
    <div className="space-y-2 border-t p-3">
      <form className="flex items-center gap-2" onSubmit={handleSubmit}>
        <Button type="button" variant="ghost" size="icon-sm" disabled>
          <Paperclip className="size-4" />
        </Button>

        <Input
          placeholder="Type your message..."
          className="h-9 bg-muted"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          disabled={isDisabled || isSending}
        />

        <Button
          type="submit"
          className="bg-gradient-dash"
          size="icon-sm"
          disabled={isDisabled || isSending || content.trim().length === 0}
        >
          <Send className="size-4" />
        </Button>
      </form>

      {errorMessage ? (
        <p className="text-xs text-red-700">{errorMessage}</p>
      ) : null}

      {/* <p className="text-muted-foreground text-xs">
        All messages are encrypted and HIPAA compliant
      </p> */}
    </div>
  );
}
