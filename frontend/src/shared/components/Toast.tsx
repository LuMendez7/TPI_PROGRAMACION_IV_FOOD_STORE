import { useEffect } from "react";
import { useNotificationStore } from "@/stores/notificationStore";

export default function Toast() {
  const message = useNotificationStore((state) => state.message);
  const visible = useNotificationStore((state) => state.visible);
  const kind = useNotificationStore((state) => state.kind);
  const hideNotification = useNotificationStore((state) => state.hideNotification);

  useEffect(() => {
    if (!visible) return;
    const timeout = window.setTimeout(hideNotification, 3000);
    return () => window.clearTimeout(timeout);
  }, [visible, message, hideNotification]);

  if (!visible) return null;
  const color = kind === "error" ? "bg-red-700" : kind === "success" ? "bg-green-700" : "bg-slate-800";
  return (
    <div role="status" aria-live="polite" className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-lg px-5 py-3 text-white shadow-lg ${color}`}>
      <div className="flex items-start gap-3">
        <span>{message}</span>
        <button type="button" onClick={hideNotification} aria-label="Cerrar notificación" className="font-bold">×</button>
      </div>
    </div>
  );
}
