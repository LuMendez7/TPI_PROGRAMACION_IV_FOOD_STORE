import { create } from "zustand";

type NotificationKind = "success" | "error" | "info";

type NotificationState = {
  message: string;
  visible: boolean;
  kind: NotificationKind;
  showNotification: (message: string, kind?: NotificationKind) => void;
  hideNotification: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  message: "",
  visible: false,
  kind: "info",
  showNotification: (message, kind = "info") => set({ message, kind, visible: true }),
  hideNotification: () => set({ visible: false }),
}));
