import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { MessagesSidebar } from "@/components/messages/MessagesSidebar";
import type { Conversation, MessageItem } from "@/components/messages/types";
import {
  getProviderChatById,
  getProviderChats,
  sendProviderChatMessage,
  type ProviderChatItem,
  type ProviderChatMessage,
} from "@/api/chat";
import { usePageTitle } from "@/store/pageTitleStore";

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "PT";
}

function getConversationTime(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();

  if (isSameDay) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getMessageTime(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function mapProviderChatMessage(message: ProviderChatMessage): MessageItem {
  return {
    id: message._id,
    sender: message.senderType,
    text: message.content,
    time: getMessageTime(message.createdAt),
  };
}

function mapChatToConversation(chat: ProviderChatItem): Conversation {
  const patientName =
    `${chat.patientId?.firstName ?? "Unknown"} ${chat.patientId?.lastName ?? "Patient"}`.trim();
  const latestText = chat.lastMessage?.trim() || "No messages yet";
  const latestTime = getConversationTime(chat.lastMessageAt || chat.updatedAt);

  return {
    id: chat._id,
    providerName: patientName,
    specialty: chat.patientId?.patientCode || "Patient",
    avatarInitials: getInitials(
      chat.patientId?.firstName,
      chat.patientId?.lastName,
    ),
    previewText: latestText,
    previewTime: latestTime,
    unreadCount: chat.unreadCount ?? 0,
    messages: chat.lastMessage
      ? [
          {
            id: `${chat._id}-last`,
            sender: "patient",
            text: chat.lastMessage,
            time: latestTime,
          },
        ]
      : [],
  };
}

export default function MessagesPage() {
  usePageTitle("Messages");
  const queryClient = useQueryClient();

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >(undefined);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["providerChats"],
    queryFn: getProviderChats,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  const conversations = useMemo(
    () => (data?.chats ?? []).map(mapChatToConversation),
    [data],
  );

  const activeConversationId = useMemo(() => {
    if (conversations.length === 0) {
      return undefined;
    }

    const exists = conversations.some(
      (item) => item.id === selectedConversationId,
    );
    return exists ? selectedConversationId : conversations[0].id;
  }, [conversations, selectedConversationId]);

  const {
    data: activeChatData,
    isLoading: isActiveChatLoading,
    isError: isActiveChatError,
    error: activeChatError,
  } = useQuery({
    queryKey: ["providerChat", activeConversationId],
    queryFn: () => getProviderChatById(activeConversationId as string),
    enabled: Boolean(activeConversationId),
    staleTime: 1000 * 30,
    retry: 1,
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ chatId, content }: { chatId: string; content: string }) =>
      sendProviderChatMessage(chatId, content),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["providerChat", variables.chatId],
        }),
        queryClient.invalidateQueries({ queryKey: ["providerChats"] }),
      ]);
    },
  });

  const activeConversation = useMemo(() => {
    const baseConversation = conversations.find(
      (item) => item.id === activeConversationId,
    );

    if (!baseConversation) {
      return undefined;
    }

    const activeChat = activeChatData?.chat;

    if (!activeChat || activeChat._id !== baseConversation.id) {
      return baseConversation;
    }

    return {
      ...baseConversation,
      messages: activeChat.messages.map(mapProviderChatMessage),
    };
  }, [activeChatData?.chat, activeConversationId, conversations]);

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "Unable to load conversations."
    : null;

  const activeChatErrorMessage = isActiveChatError
    ? activeChatError instanceof Error
      ? activeChatError.message
      : "Unable to load this conversation."
    : null;

  const sendMessageError = sendMessageMutation.isError
    ? sendMessageMutation.error instanceof Error
      ? sendMessageMutation.error.message
      : "Unable to send message."
    : null;

  async function handleSendMessage(content: string) {
    if (!activeConversationId) {
      return;
    }

    await sendMessageMutation.mutateAsync({
      chatId: activeConversationId,
      content,
    });
  }

  return (
    <div className="space-y-6 h-full min-h-screen">
      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] h-full">
        {/* sidebar: hide when a conversation is open on smaller screens */}
        <div className={activeConversationId ? "hidden xl:block" : "block"}>
          <MessagesSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onConversationSelect={setSelectedConversationId}
            isLoading={isLoading || isFetching}
            errorMessage={errorMessage}
          />
        </div>

        {/* chat window: hide when no conversation is selected on smaller screens */}
        <div className={activeConversationId ? "block" : "hidden xl:block"}>
          <ChatWindow
            activeConversation={activeConversation}
            isLoading={isActiveChatLoading}
            errorMessage={activeChatErrorMessage}
            isSendingMessage={sendMessageMutation.isPending}
            sendMessageError={sendMessageError}
            onSendMessage={handleSendMessage}
            onCloseConversation={() => setSelectedConversationId(undefined)}
          />
        </div>
      </div>
    </div>
  );
}
