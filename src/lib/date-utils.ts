/**
 * Utility function to calculate when an email will be sent
 * based on delay value and unit from current time
 */
export const calculateSendDate = (delay: number, delayUnit: string): Date => {
  const now = new Date();
  const delayValue = Number(delay) || 0;

  switch (delayUnit) {
    case "minutes":
      return new Date(now.getTime() + delayValue * 60 * 1000);
    case "hours":
      return new Date(now.getTime() + delayValue * 60 * 60 * 1000);
    case "days":
      return new Date(now.getTime() + delayValue * 24 * 60 * 60 * 1000);
    default:
      return now;
  }
};

/**
 * Format a date for display in email send date preview
 */
export const formatEmailSendDate = (date: Date): string => {
  return date.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
