import React from "react";
import { Button } from "@/components/ui/button";
import { Zap, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlowCard } from "./FlowCard";
import type { Flow, App } from "@/lib/appmixer-api-types";

interface FlowsGridProps {
  flows: Flow[];
  apps: Record<string, App>;
  viewMode: "grid" | "list";
  searchQuery: string;
  isLoading: boolean;
  sectionTitle: string;
  sectionDescription: string;
  emptyStateTitle: string;
  emptyStateDescription?: string;
  showCreateButton?: boolean;
  createButtonText?: string;
  isPrebuilt?: boolean; // New prop to indicate if these are pre-built flows
  isActiveSection?: boolean; // New prop to indicate if this is the Active section
  onIntegrationClick: (flow: Flow) => void;
  onStartFlow: (flowId: string) => void;
  onStopFlow: (flowId: string) => void;
  onCloneFlow: (flowId: string) => void;
  onCustomizeFlow?: (flowId: string) => void;
  onNewWorkflowClick?: () => void;
  onOpenEditor?: (flow: Flow) => void;
  onManageTags?: (flow: Flow) => void;
  onDeleteFlow?: (flowId: string) => void;
  onViewLogs?: (flow: Flow) => void;
}

export const FlowsGrid: React.FC<FlowsGridProps> = ({
  flows,
  apps,
  viewMode,
  searchQuery,
  isLoading,
  sectionTitle,
  sectionDescription,
  emptyStateTitle,
  emptyStateDescription,
  showCreateButton = false,
  createButtonText = "Create Flow",
  isPrebuilt = false,
  isActiveSection = false,
  onIntegrationClick,
  onStartFlow,
  onStopFlow,
  onCloneFlow,
  onCustomizeFlow,
  onNewWorkflowClick,
  onOpenEditor,
  onManageTags,
  onDeleteFlow,
  onViewLogs,
}) => {
  if (isLoading) {
    return null; // Loading is handled by parent
  }

  return (
    <div className="space-y-4">
      <div className={showCreateButton ? "flex items-center justify-between" : ""}>
        <div>
          <h2 className="text-xl font-semibold">{sectionTitle}</h2>
          <p className="text-muted-foreground">{sectionDescription}</p>
        </div>
        {showCreateButton && onNewWorkflowClick && (
          <Button onClick={onNewWorkflowClick} variant="default">
            <Zap className="w-4 h-4 mr-2" />
            {createButtonText}
          </Button>
        )}
      </div>

      {flows.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {showCreateButton ? (
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
          ) : (
            <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
          )}
          <p className="text-sm">{emptyStateTitle}</p>
          {emptyStateDescription && (
            <p className="text-sm mt-1">{emptyStateDescription}</p>
          )}
          {searchQuery && (
            <p className="text-sm mt-1">Try adjusting your search criteria.</p>
          )}
        </div>
      ) : (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "space-y-3"
          )}
        >
          {flows.map((flow) => (
            <FlowCard
              key={flow.flowId}
              flow={flow}
              showActions={true}
              viewMode={viewMode}
              apps={apps}
              isPrebuilt={isPrebuilt}
              isActiveSection={isActiveSection}
              onIntegrationClick={onIntegrationClick}
              onStartFlow={onStartFlow}
              onStopFlow={onStopFlow}
              onCloneFlow={onCloneFlow}
              onCustomizeFlow={onCustomizeFlow}
              onOpenEditor={onOpenEditor}
              onManageTags={onManageTags}
              onDeleteFlow={onDeleteFlow}
              onViewLogs={onViewLogs}
            />
          ))}
        </div>
      )}
    </div>
  );
};