import { cn } from "@/lib/utils";
import { SupportTicket } from "@/types/support";

interface TicketPriorityIndicatorProps {
  priority: SupportTicket["priority"];
}

const priorityColors = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

export function TicketPriorityIndicator({ priority }: TicketPriorityIndicatorProps) {
  return (
    <div
      className={cn(
        "w-2 h-2 rounded-full flex-shrink-0",
        priorityColors[priority]
      )}
      title={`${priority} priority`}
    />
  );
}
