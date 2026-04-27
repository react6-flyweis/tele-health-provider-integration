import type { Conversation } from "@/components/messages/types";

export const conversations: Conversation[] = [
  {
    id: "emily-chen",
    providerName: "Dr. Emily Chen",
    specialty: "Clinical Psychologist",
    avatarInitials: "EC",
    previewText: "I've updated your treatment plan. Please review it.",
    previewTime: "10:30 AM",
    unreadCount: 2,
    messages: [
      {
        id: "m-1",
        sender: "provider",
        text: "Good morning! How have you been feeling since our last session?",
        time: "9:15 AM",
      },
      {
        id: "m-2",
        sender: "patient",
        text: "I've been doing much better, thank you. The breathing exercises have really helped.",
        time: "9:45 AM",
      },
      {
        id: "m-3",
        sender: "provider",
        text: "That's wonderful to hear! Keep up the great work. I've updated your treatment plan. Please review it when you have a moment.",
        time: "10:30 AM",
      },
    ],
  },
  {
    id: "michael-ross",
    providerName: "Dr. Michael Ross",
    specialty: "Psychiatrist",
    avatarInitials: "MR",
    previewText: "Your treatments refill has been approved.",
    previewTime: "Yesterday",
    messages: [
      {
        id: "m-4",
        sender: "provider",
        text: "Your treatment refill has been approved and sent to your pharmacy.",
        time: "3:10 PM",
      },
    ],
  },
  {
    id: "sarah-miller",
    providerName: "Dr. Sarah Miller",
    specialty: "Licensed Therapist",
    avatarInitials: "SM",
    previewText: "See you at our next session on Friday!",
    previewTime: "Jan 10",
    messages: [
      {
        id: "m-5",
        sender: "provider",
        text: "See you at our next session on Friday!",
        time: "11:50 AM",
      },
    ],
  },
];
