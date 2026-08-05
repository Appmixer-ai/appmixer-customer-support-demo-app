import React from "react";
import { useInsightsLogs } from "@/hooks/use-insights-logs";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Flow } from "@/lib/appmixer-api-types";

interface LogsViewProps {
  selectedFlow?: Flow | null;
  onClearFilter?: () => void;
}

export const LogsView: React.FC<LogsViewProps> = ({ selectedFlow, onClearFilter }) => {
  const { logsContainerRef, isInitialized } = useInsightsLogs({
    flowId: selectedFlow?.flowId
  });

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          
          {selectedFlow && onClearFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilter}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear filter
            </Button>
          )}
        </div>
        {selectedFlow && (
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              Filtered by flow: {selectedFlow.name}
            </Badge>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {!isInitialized ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Initializing logs viewer...</p>
            </div>
          </div>
        ) : (
          <div
            ref={logsContainerRef}
            className="rounded-md border bg-background"
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              position: 'relative',
            }}
          />
        )}
      </div>
    </div>
  );
};
