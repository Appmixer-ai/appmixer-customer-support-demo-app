import { useEffect, useRef } from "react";
import { useAppmixer } from "@/contexts/AppmixerContextSimple";

interface UseInsightsLogsOptions {
  flowId?: string;
  enabled?: boolean;
}

export function useInsightsLogs({ flowId, enabled = true }: UseInsightsLogsOptions = {}) {
  const { isInitialized, appmixer } = useAppmixer();
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const logsInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled || !isInitialized || !appmixer) {
      return;
    }

    // Use a slight delay to ensure the DOM is ready
    const timer = setTimeout(() => {
      if (!logsContainerRef.current) {
        console.error('Logs container ref is not available');
        return;
      }

      // Clean up previous logs instance if it exists
      if (logsInstanceRef.current) {
        try {
          logsInstanceRef.current.close?.();
        } catch (error) {
          console.error("Error closing previous logs viewer:", error);
        }
        logsInstanceRef.current = null;
      }

      // Clear the container
      logsContainerRef.current.innerHTML = '';

      try {
        const logMessage = flowId
          ? `Initializing InsightsLogs widget for flow ID: ${flowId}`
          : 'Initializing InsightsLogs widget for all flows';
        console.log(logMessage);

        // Create a new InsightsLogs instance
        const insightsLogs = appmixer.ui.InsightsLogs({
          el: logsContainerRef.current,
        });

        // Set the flow ID if provided to filter logs for a specific flow
        if (flowId) {
          insightsLogs.set('flowId', flowId);
        }

        // Store the instance for cleanup
        logsInstanceRef.current = insightsLogs;

        // Open the logs viewer
        insightsLogs.open();

        console.log('InsightsLogs widget created successfully');
      } catch (error) {
        console.error("Error initializing logs viewer:", error);
      }
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (logsInstanceRef.current) {
        try {
          logsInstanceRef.current.close?.();
        } catch (error) {
          console.error("Error closing logs viewer during cleanup:", error);
        }
        logsInstanceRef.current = null;
      }
    };
  }, [enabled, isInitialized, appmixer, flowId]);

  return {
    logsContainerRef,
    isInitialized,
  };
}
