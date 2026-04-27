import { apiClient, getApiErrorMessage } from "@/lib/api";

export interface ProviderChatUser {
  _id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

export interface ProviderChatPatient extends ProviderChatUser {
  patientCode?: string;
}

export interface ProviderChatItem {
  _id: string;
  patientId: ProviderChatPatient;
  providerId: ProviderChatUser;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderChatMessage {
  _id: string;
  senderId: string;
  senderType: "provider" | "patient";
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderChatDetail extends ProviderChatItem {
  messages: ProviderChatMessage[];
}

interface ProviderChatsResponse {
  status: "success" | "fail";
  results: number;
  data?: {
    chats: ProviderChatItem[];
  };
  message?: string;
}

interface ProviderChatByIdResponse {
  status: "success" | "fail";
  data?: {
    chat: ProviderChatDetail;
  };
  message?: string;
}

interface SendProviderChatMessageResponse {
  status: "success" | "fail";
  data?: {
    message?: ProviderChatMessage;
    chat?: ProviderChatDetail;
  };
  message?: string;
}

export async function getProviderChats() {
  try {
    const { data } = await apiClient.get<ProviderChatsResponse>("/chat");

    if (data?.status !== "success" || !data?.data?.chats) {
      throw new Error(data?.message || "Could not load conversations");
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function getProviderChatById(chatId: string) {
  try {
    const { data } = await apiClient.get<ProviderChatByIdResponse>(
      `/chat/${chatId}`,
    );

    if (data?.status !== "success" || !data?.data?.chat) {
      throw new Error(data?.message || "Could not load conversation details");
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function sendProviderChatMessage(chatId: string, content: string) {
  try {
    const { data } = await apiClient.post<SendProviderChatMessageResponse>(
      `/chat/${chatId}/message`,
      { content },
    );

    if (data?.status !== "success") {
      throw new Error(data?.message || "Could not send message");
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
