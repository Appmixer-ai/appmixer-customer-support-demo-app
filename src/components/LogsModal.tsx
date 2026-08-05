import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInsightsLogs } from "@/hooks/use-insights-logs";
import type { Flow } from "@/lib/appmixer-api-types";

interface LogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  flow: Flow;
}

export const LogsModal: React.FC<LogsModalProps> = ({
  isOpen,
  onClose,
  flow,
}) => {
  const { logsContainerRef, isInitialized } = useInsightsLogs({
    flowId: flow.flowId,
    enabled: isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Logs - {flow.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden mt-4">
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
      </DialogContent>
    </Dialog>
  );
};
