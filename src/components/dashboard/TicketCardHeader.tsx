import { CardHeader } from "@/components/ui/card";
import { SupportTicket } from "@/types/support";
import { TicketPriorityIndicator } from "./TicketPriorityIndicator";
import { TicketDragHandle } from "./TicketDragHandle";
import { StatusBadge } from "@/components/ui/status-badge";
import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

interface TicketCardHeaderProps {
  ticket: SupportTicket;
  showStatus?: boolean;
  listeners: SyntheticListenerMap | undefined;
  attributes: DraggableAttributes;
}

export function TicketCardHeader({
  ticket,
  showStatus = false,
  listeners,
  attributes
}: TicketCardHeaderProps) {
  return (
    <CardHeader className="pb-2">
      <div className="w-full">
        <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <TicketPriorityIndicator priority={ticket.priority} />
            <span className="text-xs text-muted-foreground flex-shrink-0">
              #{ticket.id}
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            {showStatus && (
              <StatusBadge status={ticket.status} className="min-w-0 truncate" />
            )}
            <TicketDragHandle listeners={listeners} attributes={attributes} />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium leading-tight overflow-hidden text-ellipsis">
            {ticket.title}
          </h4>
        </div>
      </div>
    </CardHeader>
  );
}
