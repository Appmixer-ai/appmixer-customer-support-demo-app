import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TICKET_STATUSES, STATUS_COLORS, STATUS_LABELS } from '@/lib/constants';
import type { TicketStatus } from '@/types/support';

interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

/**
 * Displays a styled badge for ticket status
 *
 * @example
 * <StatusBadge status="in-progress" />
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS[TICKET_STATUSES.NEW];
  const label = STATUS_LABELS[status] || status;

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-medium',
        colorClass,
        className
      )}
    >
      {label}
    </Badge>
  );
}
