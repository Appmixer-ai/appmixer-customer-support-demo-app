import { GripVertical } from "lucide-react";
import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

interface TicketDragHandleProps {
  listeners: SyntheticListenerMap | undefined;
  attributes: DraggableAttributes;
}

export function TicketDragHandle({ listeners, attributes }: TicketDragHandleProps) {
  return (
    <div
      className="p-1.5 rounded-md opacity-60 hover:opacity-100 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 touch-none cursor-grab active:cursor-grabbing flex-shrink-0"
      data-drag-handle
      title="Drag to move ticket"
      onClick={(e) => e.stopPropagation()}
      {...listeners}
      {...attributes}
    >
      <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
    </div>
  );
}
