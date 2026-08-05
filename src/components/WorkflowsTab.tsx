import React from "react";
import { FilterBar } from "./FilterBar";
import { FlowsGrid } from "./FlowsGrid";
import type { Flow, App } from "@/lib/appmixer-api-types";

interface WorkflowsTabProps {
  // Filter state
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  showOnlyActive: boolean;
  setShowOnlyActive: (show: boolean) => void;
  categories: string[];

  // Data
  filteredFlows: {
    integrationTemplates: Flow[];
    automations: Flow[];
    integrationInstances: Flow[];
  };
  apps: Record<string, App>;
  isLoading: boolean;

  // Handlers
  onIntegrationClick: (flow: Flow) => void;
  onStartFlow: (flowId: string) => void;
  onStopFlow: (flowId: string) => void;
  onCloneFlow: (flowId: string) => void;
  onCustomizeFlow?: (flowId: string) => void;
  onNewWorkflowClick: () => void;
  onOpenEditor?: (flow: Flow) => void;
  onManageTags?: (flow: Flow) => void;
  onDeleteFlow?: (flowId: string) => void;
  onViewLogs?: (flow: Flow) => void;
}

export const WorkflowsTab: React.FC<WorkflowsTabProps> = ({
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  showOnlyActive,
  setShowOnlyActive,
  categories,
  filteredFlows,
  apps,
  isLoading,
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
  return (
    <>
      {/* Filter Bar */}
      <FilterBar
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showOnlyActive={showOnlyActive}
        setShowOnlyActive={setShowOnlyActive}
        categories={categories}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading automation flows...</p>
          </div>
        </div>
      )}

      {/* Active Section */}
      {!isLoading && (
        <FlowsGrid
          flows={filteredFlows.integrationInstances}
          apps={apps}
          viewMode={viewMode}
          searchQuery={searchQuery}
          isLoading={isLoading}
          sectionTitle="Active"
          sectionDescription="Automations activated from pre-built templates."
          emptyStateTitle="No active integrations found."
          emptyStateDescription={
            searchQuery
              ? undefined
              : "Start an integration from the Pre-built section to see it here."
          }
          isActiveSection={true}
          onIntegrationClick={onIntegrationClick}
          onStartFlow={onStartFlow}
          onStopFlow={onStopFlow}
          onCloneFlow={onCloneFlow}
          onManageTags={onManageTags}
          onDeleteFlow={onDeleteFlow}
          onViewLogs={onViewLogs}
        />
      )}

      {/* Pre-built Section */}
      {!isLoading && (
        <FlowsGrid
          flows={filteredFlows.integrationTemplates}
          apps={apps}
          viewMode={viewMode}
          searchQuery={searchQuery}
          isLoading={isLoading}
          sectionTitle="Templates"
          sectionDescription="Ready-to-use automation templates with a simple activation flow."
          emptyStateTitle="No integration templates found."
          isPrebuilt={true}
          onIntegrationClick={onIntegrationClick}
          onStartFlow={onStartFlow}
          onStopFlow={onStopFlow}
          onCloneFlow={onCloneFlow}
          onCustomizeFlow={onCustomizeFlow}
          onManageTags={onManageTags}
          onViewLogs={onViewLogs}
        />
      )}

      {/* Custom Section */}
      {!isLoading && (
        <FlowsGrid
          flows={filteredFlows.automations}
          apps={apps}
          viewMode={viewMode}
          searchQuery={searchQuery}
          isLoading={isLoading}
          sectionTitle="Custom automations"
          sectionDescription="Build your own flows using a visual automation builder."
          emptyStateTitle="No custom automation flows found."
          emptyStateDescription={
            searchQuery
              ? undefined
              : "Create your first custom automation flow!"
          }
          showCreateButton={true}
          createButtonText="Create Custom Flow"
          onIntegrationClick={onIntegrationClick}
          onStartFlow={onStartFlow}
          onStopFlow={onStopFlow}
          onCloneFlow={onCloneFlow}
          onNewWorkflowClick={onNewWorkflowClick}
          onOpenEditor={onOpenEditor}
          onManageTags={onManageTags}
          onDeleteFlow={onDeleteFlow}
          onViewLogs={onViewLogs}
        />
      )}
    </>
  );
};