import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { WizardModal } from "./WizardModal";
import { FlowAppIcons } from "./FlowAppIcons";
import { FlowTags } from "./FlowTags";
import { FlowDropdownMenu } from "./FlowDropdownMenu";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import type { Flow, App } from "@/lib/appmixer-api-types";

interface FlowCardProps {
  flow: Flow;
  showActions?: boolean;
  viewMode: "grid" | "list";
  apps: Record<string, App>;
  isPrebuilt?: boolean;
  isActiveSection?: boolean;
  onIntegrationClick: (flow: Flow) => void;
  onStartFlow: (flowId: string) => void;
  onStopFlow: (flowId: string) => void;
  onCloneFlow: (flowId: string) => void;
  onCustomizeFlow?: (flowId: string) => void;
  onOpenEditor?: (flow: Flow) => void;
  onManageTags?: (flow: Flow) => void;
  onDeleteFlow?: (flowId: string) => void;
  onViewLogs?: (flow: Flow) => void;
}

export const FlowCard: React.FC<FlowCardProps> = ({
  flow,
  showActions = true,
  viewMode,
  apps,
  isPrebuilt = false,
  isActiveSection = false,
  onIntegrationClick,
  onStartFlow,
  onStopFlow,
  onCloneFlow,
  onCustomizeFlow,
  onOpenEditor,
  onManageTags,
  onDeleteFlow,
  onViewLogs,
}) => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const handleRunIntegration = () => {
    if (isPrebuilt && flow.stage !== 'running') {
      setIsWizardOpen(true);
    } else {
      onStartFlow(flow.flowId);
    }
  };

  const handleWizardComplete = (flowId: string) => {
    console.log('Integration wizard completed for flow:', flowId);
    setIsWizardOpen(false);
  };

  const handleDeleteFlow = async () => {
    const confirmed = await confirm({
      title: `Delete flow ${flow.name}`,
      description: "Deleted flows can not be restored.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "destructive"
    });

    if (confirmed && onDeleteFlow) {
      onDeleteFlow(flow.flowId);
    }
  };

  // Utility function to extract app IDs from flow components
  const getAppsFromFlow = (flow: Flow): string[] => {
    if (!flow.flow) return [];

    const appIds = new Set<string>();

    Object.values(flow.flow).forEach(component => {
      if (component.type) {
        const parts = component.type.split('.');
        if (parts.length >= 3) {
          const appName = parts.slice(0, -1).join('.');
          appIds.add(appName);
        }
      }
    });

    return Array.from(appIds);
  };

  // Get apps used in this flow
  const flowAppIds = getAppsFromFlow(flow);

  // Find matching apps using partial matching logic
  const flowApps = flowAppIds.map(extractedAppId => {
    if (apps?.[extractedAppId]) {
      return apps[extractedAppId];
    }

    const availableAppIds = Object.keys(apps || {});
    const partialMatch = availableAppIds.find(availableAppId => {
      return extractedAppId.includes(availableAppId) || availableAppId.includes(extractedAppId);
    });

    return partialMatch ? apps?.[partialMatch] : null;
  }).filter(Boolean) || [];

  const listViewCard = (
    <Card
      className={cn(
        "hover:shadow-md transition-shadow",
        isActiveSection && "border-green-200 bg-green-50/30 shadow-sm"
      )}
      onClick={() => onIntegrationClick(flow)}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="grid grid-cols-[140px_1fr_auto] sm:grid-cols-[160px_1fr_auto] lg:grid-cols-[180px_1fr_auto] gap-2 sm:gap-3 lg:gap-4 items-center">
          {/* First column: App icons */}
          <div className="flex items-center w-full">
            <FlowAppIcons apps={flowApps} flowId={flow.flowId} size="md" responsive />
          </div>

          {/* Second column: Title and description */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2 h-5 mb-1">
              <h3 className="font-medium text-sm truncate">{flow.name}</h3>
              {flow.stage === 'running' && (
                <Badge variant="default" className="text-xs bg-green-100 font-normal text-green-700 hover:bg-green-300 rounded-sm">
                  Active
                </Badge>
              )}
            </div>
            <div className="min-h-[32px] flex flex-col gap-1">
              {flow.description ? (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {flow.description}
                </p>
              ) : (
                <span className="text-xs text-muted-foreground italic">No description</span>
              )}
              {/* Tags display */}
              {flow.customFields?.tags && flow.customFields.tags.length > 0 && (
                <div className="mt-0.5">
                  <FlowTags tags={flow.customFields.tags} maxTags={3} />
                </div>
              )}
            </div>
          </div>

          {/* Third column: Action button */}
          <div className="flex justify-end">
            {showActions && (
              <FlowDropdownMenu
                flowStage={flow.stage}
                isActiveSection={isActiveSection}
                isPrebuilt={isPrebuilt}
                hasOpenEditor={!!onOpenEditor}
                hasManageTags={!!onManageTags}
                hasDeleteFlow={!!onDeleteFlow}
                hasCustomizeFlow={!!onCustomizeFlow}
                onRunIntegration={handleRunIntegration}
                onStopFlow={() => onStopFlow(flow.flowId)}
                onCloneFlow={() => onCloneFlow(flow.flowId)}
                onCustomizeFlow={() => onCustomizeFlow?.(flow.flowId)}
                onOpenEditor={() => onOpenEditor?.(flow)}
                onManageTags={() => onManageTags?.(flow)}
                onOpenLogs={() => onViewLogs?.(flow)}
                onDeleteFlow={handleDeleteFlow}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const gridViewCard = (
    <Card
      className={cn(
        "hover:shadow-md transition-shadow h-48 flex flex-col",
        isActiveSection && "border-green-200 bg-green-50/30 shadow-sm"
      )}
      onClick={() => onIntegrationClick(flow)}
    >
      <CardHeader className="pb-2 flex-1">
        <div className="flex flex-col gap-2 h-full">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm font-medium line-clamp-2">
                {flow.name}
              </CardTitle>
            </div>
            <div className="ml-2 flex-shrink-0">
              {flow.stage === 'running' && (
                <Badge variant="default" className="text-xs bg-green-100 font-normal text-green-700 hover:bg-green-300 rounded-sm">
                  Active
                </Badge>
              )}
            </div>
          </div>
          {/* Tags display under title */}
          {flow.customFields?.tags && flow.customFields.tags.length > 0 && (
            <FlowTags tags={flow.customFields.tags} maxTags={3} />
          )}
        </div>
      </CardHeader>
      {showActions && (
        <CardContent className="pt-0 mt-auto">
          {flow.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {flow.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            {flowApps.length > 0 && (
              <FlowAppIcons apps={flowApps} flowId={flow.flowId} size="sm" responsive />
            )}
            <FlowDropdownMenu
              flowStage={flow.stage}
              isActiveSection={isActiveSection}
              isPrebuilt={isPrebuilt}
              hasOpenEditor={!!onOpenEditor}
              hasManageTags={!!onManageTags}
              hasDeleteFlow={!!onDeleteFlow}
              hasCustomizeFlow={!!onCustomizeFlow}
              onRunIntegration={handleRunIntegration}
              onStopFlow={() => onStopFlow(flow.flowId)}
              onCloneFlow={() => onCloneFlow(flow.flowId)}
              onCustomizeFlow={() => onCustomizeFlow?.(flow.flowId)}
              onOpenEditor={() => onOpenEditor?.(flow)}
              onManageTags={() => onManageTags?.(flow)}
              onOpenLogs={() => onViewLogs?.(flow)}
              onDeleteFlow={handleDeleteFlow}
              buttonClassName="text-xs sm:text-sm px-2 sm:px-3"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <>
      {viewMode === "list" ? listViewCard : gridViewCard}

      {/* Wizard Modal for Pre-built flows */}
      <WizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        flow={flow}
        onComplete={handleWizardComplete}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog />
    </>
  );
};
