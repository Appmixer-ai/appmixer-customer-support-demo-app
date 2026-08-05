import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
  };
  secondaryActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
  }>;
  dropdownActions?: Array<{
    label: string;
    onClick: () => void;
  }>;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  primaryAction,
  secondaryActions = [],
  dropdownActions = [],
  className = "",
}) => {
  const hasActions = primaryAction || secondaryActions.length > 0 || dropdownActions.length > 0;

  return (
    <div className={`flex items-${hasActions ? 'center justify-between' : 'start'} ${className}`}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>

      {hasActions && (
        <div className="flex items-center gap-2">
          {/* Secondary Actions */}
          {secondaryActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "secondary"}
              size={action.size || "sm"}
              onClick={action.onClick}
              className="hover:bg-gray-300 transition-colors"
            >
              {action.icon && action.icon}
              {action.label}
            </Button>
          ))}

          {/* Primary Action */}
          {primaryAction && (
            <Button
              variant={primaryAction.variant || "default"}
              size={primaryAction.size || "sm"}
              onClick={primaryAction.onClick}
            >
              {primaryAction.icon && primaryAction.icon}
              {primaryAction.label}
            </Button>
          )}

          {/* Dropdown Menu */}
          {dropdownActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {dropdownActions.map((action, index) => (
                  <DropdownMenuItem key={index} onClick={action.onClick}>
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;