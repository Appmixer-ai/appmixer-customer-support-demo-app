import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TICKET_PRIORITIES, PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/constants';
import type { TicketPriority } from '@/types/support';

interface PriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
}

/**
 * Displays a styled badge for ticket priority
 *
 * @example
 * <PriorityBadge priority="urgent" />
 */
export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const colorClass = PRIORITY_COLORS[priority] || PRIORITY_COLORS[TICKET_PRIORITIES.MEDIUM];
  const label = PRIORITY_LABELS[priority] || priority;

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-medium capitalize',
        colorClass,
        className
      )}
    >
      {label}
    </Badge>
  );
}
