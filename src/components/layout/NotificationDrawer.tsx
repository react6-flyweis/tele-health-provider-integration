import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Trash2, X } from "lucide-react";
import { getProviderNotifications } from "@/api/notifications";
import {
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
} from "@/hooks/useNotificationMutations";

export default function NotificationDrawer() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["notifications", activeTab],
    queryFn: () => getProviderNotifications(activeTab, 1, 20),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  const markAsReadMutation = useMarkNotificationAsReadMutation();
  const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation();
  const deleteNotificationMutation = useDeleteNotificationMutation();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotificationMutation.mutate(id);
  };

  const filtered =
    activeTab === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative rounded-md p-2 hover:bg-muted/50 transition-colors"
      >
        <Bell className="size-5 text-foreground" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-0.5 flex h-5 w-5 items-center justify-center rounded-xl bg-black text-[11px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}
      />

      <div
        className={`fixed top-0 right-0 h-full pb-5 max-w-100 w-full bg-white z-50 shadow-xl transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>

          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 text-xs rounded-md ${
                activeTab === "all"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              All
            </button>

            <button
              onClick={() => setActiveTab("unread")}
              className={`px-3 py-1 text-xs rounded-md ${
                activeTab === "unread"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Unread
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="p-4 pt-0 space-y-3 overflow-y-auto h-[calc(100%-100px)]">
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="p-3 rounded-lg border animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <p className="text-sm text-red-500 text-center min-h-[200px] flex items-center justify-center">
              {error instanceof Error ? error.message : "Failed to load notifications"}
            </p>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <p className="text-sm text-gray-500 text-center min-h-[200px] flex items-center justify-center">
              No notifications
            </p>
          )}

          {!isLoading && !isError && filtered.map((item) => (
            <div
              key={item._id}
              onClick={() => {
                if (!item.isRead) handleMarkAsRead(item._id);
              }}
              className={`p-3 rounded-lg border cursor-pointer group ${
                item.isRead
                  ? "bg-white border-gray-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex justify-between">
                <h4 className="text-sm font-medium">{item.title}</h4>

                <div className="flex items-center gap-3">
                  {!item.isRead && (
                    <span className="text-[10px] px-2 py-0.5 bg-blue-600 text-white rounded-full">
                      New
                    </span>
                  )}

                  <Trash2
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(item._id);
                    }}
                    className="w-4 h-4 text-red-400 hover:text-red-600 cursor-pointer"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-1">
                {item.message}
              </p>

              <p className="text-[10px] text-gray-400 mt-2">
                {item.timeAgo}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}