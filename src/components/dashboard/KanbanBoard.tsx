import { CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SupportTicket, TicketStatus } from "@/types/support";
import { TicketCard } from "./TicketCard";
import { KANBAN_COLUMNS } from "@/lib/constants";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import { useState } from "react";
import "./kanban-drag-styles.css";

// Droppable column component
function DroppableColumn({ 
  status, 
  children, 
  isDragActive 
}: { 
  status: string; 
  children: React.ReactNode;
  isDragActive: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full transition-colors duration-200 rounded-lg border-2 border-dashed p-1 ${
        isDragActive && isOver ? 'bg-blue-50 border-blue-300' : 
        isDragActive ? 'bg-gray-50 border-gray-300' : 'border-transparent'
      }`}
      data-status={status}
    >
      {children}
    </div>
  );
}

interface KanbanBoardProps {
  tickets: SupportTicket[];
  onTicketClick?: (ticket: SupportTicket) => void;
  onTicketStatusUpdate?: (ticketId: string, newStatus: TicketStatus) => Promise<void>;
}

// Use centralized column configuration from constants
const columnConfig = KANBAN_COLUMNS.reduce((acc, col) => {
  acc[col.id] = col;
  return acc;
}, {} as Record<string, typeof KANBAN_COLUMNS[number]>);

export function KanbanBoard({ tickets, onTicketClick, onTicketStatusUpdate }: KanbanBoardProps) {
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const getTicketsByStatus = (status: TicketStatus) => {
    return tickets.filter((ticket) => ticket.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ticket = tickets.find((t) => t.id === active.id);
    if (ticket) {
      setActiveTicket(ticket);
      setIsDragActive(true);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);
    setIsDragActive(false);

    if (!over) return;

    const ticketId = active.id as string;
    let newStatus: TicketStatus;

    // Determine the new status from the drop zone
    if (typeof over.id === 'string' && Object.keys(columnConfig).includes(over.id)) {
      newStatus = over.id as TicketStatus;
    } else {
      // Check if we dropped on a ticket, get its status
      const targetTicket = tickets.find((t) => t.id === over.id);
      if (targetTicket) {
        newStatus = targetTicket.status;
      } else {
        return;
      }
    }

    // Find the ticket and check if status actually changed
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.status === newStatus) return;

    // Call the update function if provided
    if (onTicketStatusUpdate) {
      try {
        await onTicketStatusUpdate(ticketId, newStatus);
      } catch (error) {
        console.error('Failed to update ticket status:', error);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 h-full">
        {Object.entries(columnConfig).map(([status, config]) => {
          const statusTickets = getTicketsByStatus(status as TicketStatus);

          return (
            <DroppableColumn 
              key={status} 
              status={status} 
              isDragActive={isDragActive}
            >
                <div className="mb-4">
                  <div className="text-base flex items-center justify-between font-semibold">
                    <span>{config.title}</span>
                    <Badge className={config.badgeColor}>
                      {statusTickets.length}
                    </Badge>
                  </div>
                </div>
                <div 
                  className="flex-1 min-h-[200px] relative"
                  data-droppable-id={status}
                >
                  <div className="space-y-3 pb-4">
                    {statusTickets.length === 0 ? (
                      <div className={`text-center text-muted-foreground text-sm py-8 rounded-lg transition-colors border border-transparent ${
                        isDragActive ? 'bg-blue-50 border-blue-200' : ''
                      }`}>
                        {isDragActive ? 'Drop ticket here' : 'No tickets in this column'}
                      </div>
                    ) : (
                      statusTickets.map((ticket) => (
                        <TicketCard
                          key={ticket.id}
                          ticket={ticket}
                          onTicketClick={onTicketClick}
                          isDragging={activeTicket?.id === ticket.id}
                        />
                      ))
                    )}
                  </div>
                </div>
            </DroppableColumn>
          );
        })}
      </div>
      
      <DragOverlay dropAnimation={null}>
        {activeTicket ? (
          <div className="transform rotate-2 shadow-2xl opacity-95 scale-105">
            <TicketCard 
              ticket={activeTicket} 
              onTicketClick={() => {}} 
              isDragging={false}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
