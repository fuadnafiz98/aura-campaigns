import { useSyncExternalStore } from "react";
import { calculateSendDate, formatEmailSendDate } from "@/lib/date-utils";

interface SendDateDisplayProps {
  delay: number;
  delayUnit: string;
}

// Simple time store
let currentTime = Date.now();
const listeners = new Set<() => void>();

// Update time every minute
setInterval(() => {
  currentTime = Date.now();
  listeners.forEach((listener) => listener());
}, 60000);

const timeStore = {
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => currentTime,
};

export const SendDateDisplay = ({ delay, delayUnit }: SendDateDisplayProps) => {
  useSyncExternalStore(timeStore.subscribe, timeStore.getSnapshot);

  const delayValue = Number(delay) || 0;
  const sendDate = calculateSendDate(delay, delayUnit);

  if (delayValue === 0) {
    return (
      <div className="text-sm text-muted-foreground/70 mt-2">
        Will be sent immediately
      </div>
    );
  }

  return (
    <div className="text-sm text-muted-foreground/70 mt-2">
      Will be sent on:{" "}
      <span className="font-medium">{formatEmailSendDate(sendDate)}</span>
    </div>
  );
};
