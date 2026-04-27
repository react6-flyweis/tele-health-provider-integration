import { apiClient, getApiErrorMessage } from "@/lib/api";

export interface Notification {
  _id: string;
  userId: string;
  userType: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  timeAgo: string;
  __v: number;
}

export interface NotificationsResponse {
  status: "success" | "fail";
  results: number;
  total: number;
  unreadCount: number;
  data: {
    notifications: Notification[];
  };
  message?: string;
}

export interface NotificationActionResponse {
  status: "success" | "fail";
  message?: string;
}

export async function getProviderNotifications(
  filter: "all" | "unread" = "all",
  page: number = 1,
  limit: number = 20,
) {
  try {
    const { data } = await apiClient.get<NotificationsResponse>(
      `/notifications?filter=${filter}&page=${page}&limit=${limit}`,
    );

    if (data?.status !== "success" || !data?.data) {
      throw new Error(data?.message || "Could not load notifications");
    }

    return {
      notifications: data.data.notifications,
      total: data.total,
      unreadCount: data.unreadCount,
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { data } = await apiClient.put<NotificationActionResponse>(
      `/notifications/${notificationId}/read`,
    );

    if (data?.status !== "success") {
      throw new Error(data?.message || "Could not mark notification as read");
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const { data } = await apiClient.put<NotificationActionResponse>(
      "/notifications/read-all",
    );

    if (data?.status !== "success") {
      throw new Error(data?.message || "Could not mark all notifications as read");
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const { data } = await apiClient.delete<NotificationActionResponse>(
      `/notifications/${notificationId}`,
    );

    if (data?.status !== "success") {
      throw new Error(data?.message || "Could not delete notification");
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}