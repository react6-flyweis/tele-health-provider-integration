import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/api/notifications";

export function useMarkNotificationAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (notificationId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueriesData({ queryKey: ["notifications"] });

      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: ["notifications"] }, (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          unreadCount: Math.max(0, oldData.unreadCount - 1),
          notifications: oldData.notifications?.map((notification: any) =>
            notification._id === notificationId
              ? { ...notification, isRead: true }
              : notification
          ),
        };
      });

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (_err, _notificationId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: ["notifications"] }, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueriesData({ queryKey: ["notifications"] });

      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: ["notifications"] }, (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          unreadCount: 0,
          notifications: oldData.notifications?.map((notification: any) => ({
            ...notification,
            isRead: true,
          })),
        };
      });

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: ["notifications"] }, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onMutate: async (notificationId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueriesData({ queryKey: ["notifications"] });

      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: ["notifications"] }, (oldData: any) => {
        if (!oldData) return oldData;

        const notificationToDelete = oldData.notifications?.find((n: any) => n._id === notificationId);
        const wasUnread = notificationToDelete && !notificationToDelete.isRead;

        return {
          ...oldData,
          total: Math.max(0, oldData.total - 1),
          results: Math.max(0, oldData.results - 1),
          unreadCount: wasUnread ? Math.max(0, oldData.unreadCount - 1) : oldData.unreadCount,
          notifications: oldData.notifications?.filter((notification: any) => notification._id !== notificationId),
        };
      });

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (_err, _notificationId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: ["notifications"] }, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}