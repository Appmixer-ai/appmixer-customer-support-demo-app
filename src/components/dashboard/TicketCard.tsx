import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SupportTicket } from "@/types/support";
import { useDraggable } from "@dnd-kit/core";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { TicketCardHeader } from "./TicketCardHeader";
import { TicketCardFooter } from "./TicketCardFooter";

interface TicketCardProps {
  ticket: SupportTicket;
  onTicketClick?: (ticket: SupportTicket) => void;
  isDragging?: boolean;
}

export function TicketCard({ ticket, onTicketClick, isDragging = false }: TicketCardProps) {
  const { isDemoMode } = useDemoMode();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isBeingDragged,
  } = useDraggable({
    id: ticket.id,
    data: { ticket }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  // Don't show the original when it's being used in DragOverlay
  if (isDragging) {
    return null;
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "mb-3 hover:shadow-md transition-all duration-200 cursor-pointer",
        isBeingDragged && "opacity-30"
      )}
      onClick={(e) => {
        if (!isBeingDragged) {
          onTicketClick?.(ticket);
        }
      }}
    >
      <TicketCardHeader
        ticket={ticket}
        showStatus={!isDemoMode}
        listeners={listeners}
        attributes={attributes}
      />
      <TicketCardFooter
        ticket={ticket}
        showDescription={!isDemoMode}
        showAvatar={!isDemoMode}
        showAssignee={!isDemoMode}
        showTags={!isDemoMode}
      />
    </Card>
  );
}
