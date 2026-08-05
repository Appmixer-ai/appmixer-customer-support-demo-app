import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAppmixer } from "@/contexts/AppmixerContextSimple";
import type { Flow } from "@/lib/appmixer-api-types";

// Add styles to constrain Appmixer Designer widget
const designerContainerStyles = `
  .appmixer-designer-container {
    position: relative !important;
    overflow: hidden !important;
  }
  .appmixer-designer-container > div {
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    max-height: 100% !important;
  }
  .appmixer-designer-container canvas {
    max-width: 100% !important;
    max-height: 100% !important;
  }
  .appmixer-designer-container .appmixer-designer {
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    max-height: 100% !important;
    position: relative !important;
  }
  /* The designer header carries no horizontal padding of its own, so the flow
     name ended up glued to the app sidebar. 16px lines its left edge up with
     the breadcrumb header above it (which uses Tailwind's px-4). */
  .appmixer-designer-container .am-designer-header {
    padding-left: 16px;
  }
`;

interface DesignerViewProps {
  flow: Flow;
  onClose: () => void;
  onFlowRemove?: (flowId: string) => void;
}

export const DesignerView: React.FC<DesignerViewProps> = ({
  flow,
  onClose,
  onFlowRemove,
}) => {
  const { isInitialized, appmixer } = useAppmixer();
  const designerContainerRef = useRef<HTMLDivElement>(null);
  const designerInstanceRef = useRef<any>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [availableHeight, setAvailableHeight] = useState<number | null>(null);

  // The amount of app chrome above the designer is not constant: the demo
  // banner adds 60px of padding (and can be collapsed at runtime, with a
  // transition), and the breadcrumb header adds another 64px unless we're in
  // demo mode. Hardcoding a viewport offset makes the designer taller than the
  // viewport in some combinations, which pushed the bottom logs panel below the
  // fold. Measure the real offset instead and fill exactly what's left.
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const measure = () => {
      // Offset from the top of the *document*, so the result doesn't depend on
      // the current scroll position (which would otherwise feed back into the
      // height we set and settle on a wrong value).
      const offsetTop = el.getBoundingClientRect().top + window.scrollY;
      const viewport = document.documentElement.clientHeight;
      setAvailableHeight(Math.max(0, viewport - offsetTop));
    };

    measure();

    window.addEventListener("resize", measure);
    // Collapsing/expanding the demo banner animates padding-top on the
    // <main> wrapper, which shifts our offset.
    const main = el.closest("main");
    main?.addEventListener("transitionend", measure);
    // Catches document-height changes (e.g. the page losing its scrollbar once
    // we size ourselves correctly).
    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);

    return () => {
      window.removeEventListener("resize", measure);
      main?.removeEventListener("transitionend", measure);
      observer.disconnect();
    };
  }, []);

  // Inject styles to constrain Appmixer Designer widget
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = designerContainerStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // The designer lays itself out on window resize; nudge it after our own
  // height settles so the canvas and the bottom panel re-fit.
  useEffect(() => {
    if (availableHeight === null) return;
    window.dispatchEvent(new Event("resize"));
  }, [availableHeight]);

  useEffect(() => {
    if (!isInitialized || !appmixer || !flow || !designerContainerRef.current) {
      return;
    }

    // Clean up previous designer instance if it exists
    if (designerInstanceRef.current) {
      try {
        designerInstanceRef.current.close();
      } catch (error) {
        console.error("Error closing previous designer:", error);
      }
      designerInstanceRef.current = null;
    }

    // Clear the container
    designerContainerRef.current.innerHTML = '';

    try {
      console.log('Initializing Designer widget for flow:', flow.name);

      // Create a new Designer instance
      const designer = appmixer.ui.Designer({
        el: designerContainerRef.current,
        // Start with the apps/connectors stencil collapsed so the canvas
        // gets the full width; the user can open it from the left edge.
        state: {
          stencilLayout: 'collapsed',
        },
        options: {
          width: "100%",
          height: "100%",
          autoResize: true,
          fitToParent: true,
          menu: [

            {
              event: "flow:rename",
              label: "Rename",
            },
            { event: "flow:share", label: "Share" },
            { event: "flow:remove", label: "Remove" },
            { event: "back-to-workflows", label: "Back to workflows" },
          ],
          toolbar: [
            ["undo", "redo"],
            ["zoom-to-fit", "zoom-in", "zoom-out"],
            // "logs" toggles the bottom panel with flow logs / executions
            ["logs"],
          ],
          // Open the bottom logs panel automatically once the flow is running
          autoOpenLogs: true,
          // Auto-open the trigger selector when a flow has no trigger yet
          // (new flows or flows created without one) so the user is guided
          // into picking a trigger instead of facing an empty canvas.
          triggerSelector: {
            enabled: true,
          },
        },
      });

      // Set the flow ID
      designer.set('flowId', flow.flowId);

      designer.on('flow:remove', async (event: any) => {
        // SDK passes {data: {flowId, ...}, next: fn}
        const flowId = event?.data?.flowId;
        if (flowId) {
          try {
            await appmixer.api.deleteFlow(flowId);
          } catch (error) {
            console.error('Failed to delete flow:', error);
          }
        }
        if (onFlowRemove) {
          onFlowRemove(flowId);
        } else {
          onClose();
        }
      });

      designer.on('back-to-workflows', () => {
        onClose();
      });
      // Store the designer instance for cleanup
      designerInstanceRef.current = designer;

      designer.open();

      console.log('Designer widget created successfully');
    } catch (error) {
      console.error("Error initializing designer:", error);
    }

    // Cleanup function
    return () => {
      if (designerInstanceRef.current) {
        try {
          designerInstanceRef.current.close();
        } catch (error) {
          console.error("Error closing designer during cleanup:", error);
        }
        designerInstanceRef.current = null;
      }
    };
  }, [isInitialized, appmixer, flow]);

  return (
    <div
      ref={rootRef}
      className="relative"
      style={{
        height: availableHeight !== null ? `${availableHeight}px` : '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Designer container - full height */}
      <div className="h-full w-full">
        {!isInitialized ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Initializing designer...</p>
            </div>
          </div>
        ) : (
          <div
            ref={designerContainerRef}
            className="appmixer-designer-container bg-background"
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              position: 'relative',
              contain: 'layout style size',
              backgroundColor: 'transparent'
            }}
          />
        )}
      </div>
    </div>
  );
};
