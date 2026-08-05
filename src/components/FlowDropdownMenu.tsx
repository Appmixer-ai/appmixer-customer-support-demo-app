import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Play, Pause, Copy, ChevronDown, FileText, Edit, Trash2, Tag, Wrench } from "lucide-react";

interface FlowDropdownMenuProps {
  flowStage: string;
  isActiveSection: boolean;
  isPrebuilt: boolean;
  hasOpenEditor: boolean;
  hasManageTags: boolean;
  hasDeleteFlow: boolean;
  hasCustomizeFlow: boolean;
  onRunIntegration: () => void;
  onStopFlow: () => void;
  onCloneFlow: () => void;
  onCustomizeFlow?: () => void;
  onOpenEditor?: () => void;
  onManageTags?: () => void;
  onOpenLogs: () => void;
  onDeleteFlow?: () => void;
  buttonSize?: "default" | "sm";
  buttonClassName?: string;
}

export const FlowDropdownMenu: React.FC<FlowDropdownMenuProps> = ({
  flowStage,
  isActiveSection,
  isPrebuilt,
  hasOpenEditor,
  hasManageTags,
  hasDeleteFlow,
  hasCustomizeFlow,
  onRunIntegration,
  onStopFlow,
  onCloneFlow,
  onCustomizeFlow,
  onOpenEditor,
  onManageTags,
  onOpenLogs,
  onDeleteFlow,
  buttonSize = "sm",
  buttonClassName = "",
}) => {
  const isRunning = flowStage === 'running';

  const renderActiveSectionMenu = () => {
    if (isRunning) {
      return (
        <>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onStopFlow();
            }}
          >
            <Pause className="w-4 h-4 mr-2" />
            Stop
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onOpenLogs();
            }}
          >
            <FileText className="w-4 h-4 mr-2" />
            See logs
          </DropdownMenuItem>
          {hasDeleteFlow && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFlow?.();
              }}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          )}
        </>
      );
    }

    return (
      <>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onRunIntegration();
          }}
        >
          <Play className="w-4 h-4 mr-2" />
          Activate
        </DropdownMenuItem>
        {hasDeleteFlow && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFlow?.();
            }}
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
      </>
    );
  };

  const renderStandardMenu = () => {
    if (isRunning) {
      return (
        <>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onStopFlow();
            }}
          >
            <Pause className="w-4 h-4 mr-2" />
            Stop
          </DropdownMenuItem>
          {isPrebuilt && hasCustomizeFlow && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onCustomizeFlow?.();
              }}
            >
              <Wrench className="w-4 h-4 mr-2" />
              Customize
            </DropdownMenuItem>
          )}
          {!isPrebuilt && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onCloneFlow();
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Clone
            </DropdownMenuItem>
          )}
          {!isPrebuilt && hasOpenEditor && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onOpenEditor?.();
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Open in editor
            </DropdownMenuItem>
          )}
          {!isPrebuilt && hasManageTags && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onManageTags?.();
              }}
            >
              <Tag className="w-4 h-4 mr-2" />
              Manage tags
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onOpenLogs();
            }}
          >
            <FileText className="w-4 h-4 mr-2" />
            See logs
          </DropdownMenuItem>
          {!isPrebuilt && hasDeleteFlow && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFlow?.();
              }}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          )}
        </>
      );
    }

    return (
      <>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onRunIntegration();
          }}
        >
          <Play className="w-4 h-4 mr-2" />
          Activate
        </DropdownMenuItem>
        {isPrebuilt && hasCustomizeFlow && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onCustomizeFlow?.();
            }}
          >
            <Wrench className="w-4 h-4 mr-2" />
            Customize
          </DropdownMenuItem>
        )}
        {!isPrebuilt && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onCloneFlow();
            }}
          >
            <Copy className="w-4 h-4 mr-2" />
            Clone
          </DropdownMenuItem>
        )}
        {!isPrebuilt && hasOpenEditor && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onOpenEditor?.();
            }}
          >
            <Edit className="w-4 h-4 mr-2" />
            Open in editor
          </DropdownMenuItem>
        )}
        {!isPrebuilt && hasManageTags && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onManageTags?.();
            }}
          >
            <Tag className="w-4 h-4 mr-2" />
            Manage tags
          </DropdownMenuItem>
        )}
        {!isPrebuilt && hasDeleteFlow && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFlow?.();
            }}
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
      </>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={buttonSize}
          variant="outline"
          onClick={(e) => e.stopPropagation()}
          className={buttonClassName}
        >
          {isRunning ? (
            <>
              Active
              <ChevronDown className="w-4 h-4 ml-1" />
            </>
          ) : (
            <>
              Use
              <ChevronDown className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isActiveSection ? renderActiveSectionMenu() : renderStandardMenu()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
