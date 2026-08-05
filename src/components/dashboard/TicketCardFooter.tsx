import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, User } from "lucide-react";
import { SupportTicket } from "@/types/support";
import { formatTimeAgo } from "@/lib/date-utils";

interface TicketCardFooterProps {
  ticket: SupportTicket;
  showDescription?: boolean;
  showAvatar?: boolean;
  showAssignee?: boolean;
  showTags?: boolean;
}

export function TicketCardFooter({
  ticket,
  showDescription = false,
  showAvatar = false,
  showAssignee = false,
  showTags = false,
}: TicketCardFooterProps) {
  return (
    <div className="px-6 pb-6">
      {/* Description (only in normal mode) */}
      {showDescription && (
        <p className="text-xs text-muted-foreground mb-3 overflow-hidden h-8">
          {ticket.description.length > 100
            ? ticket.description.substring(0, 100) + "..."
            : ticket.description}
        </p>
      )}

      {/* Customer and time info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {showAvatar ? (
            <>
              <Avatar className="w-5 h-5">
                <AvatarFallback className="text-xs">
                  {ticket.customer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-20">{ticket.customer.name}</span>
            </>
          ) : (
            <span className="truncate">{ticket.customer.name}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {showAssignee && ticket.assignee && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{ticket.assignee}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(ticket.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Tags (only in normal mode) */}
      {showTags && ticket.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {ticket.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs px-1.5 py-0.5"
            >
              {tag}
            </Badge>
          ))}
          {ticket.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              +{ticket.tags.length - 2}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
