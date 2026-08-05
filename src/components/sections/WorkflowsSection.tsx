import React, { useEffect, useRef, useState } from "react";
import { useAppmixer } from "@/contexts/AppmixerContextSimple";

// Add styles to constrain Appmixer widgets
const appmixerContainerStyles = `
  .appmixer-widget-container {
    position: relative !important;
    overflow: hidden !important;
  }
  .appmixer-widget-container > div {
    width: 100% !important;
    height: 1000px !important;
    max-width: 100% !important;
    max-height: 1000px !important;
  }
  .appmixer-widget-container canvas {
    max-width: 100% !important;
    max-height: 1000px !important;
  }
  .appmixer-widget-container .appmixer-designer {
    width: 100% !important;
    height: 1000px !important;
    max-width: 100% !important;
    max-height: 1000px !important;
    position: relative !important;
  }
  .appmixer-widget-container .appmixer-flow-manager {
    width: 100% !important;
    height: 1000px !important;
    max-width: 100% !important;
    max-height: 1000px !important;
    position: relative !important;
  }
`;

interface WorkflowsSectionProps {
  isHighlightingAppmixer?: boolean;
  showWorkflowBuilder: boolean;
  onNewWorkflowClick: () => void;
}

const WorkflowsSection: React.FC<WorkflowsSectionProps> = ({
  isHighlightingAppmixer = false,
  showWorkflowBuilder,
  onNewWorkflowClick,
}) => {
  const { isInitialized, appmixer, error } = useAppmixer();
  const sharedContainerRef = useRef<HTMLDivElement>(null);
  const [widgetInitialized, setWidgetInitialized] = useState(false);
  const [flowManagerWidget, setFlowManagerWidget] = useState<any>(null);
  const [designerWidget, setDesignerWidget] = useState<any>(null);

  // Inject styles to constrain Appmixer widgets
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = appmixerContainerStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    if (isInitialized && appmixer && !widgetInitialized) {
      try {
        console.log("Attempting to initialize FlowManager widget");
        // Initialize the FlowManager widget for listing workflows
        const flowManager = appmixer.ui.FlowManager({
          el: sharedContainerRef.current,
          options: {
            showHeader: true,
          },
        });

        console.log("Attempting to initialize Designer widget");
        // Initialize the Designer widget for workflow building
        const designer = appmixer.ui.Designer({
          el: sharedContainerRef.current,
          options: {
            theme: "light",
            width: "100%",
            height: "1000px",
            autoResize: true,
            fitToParent: true,
            toolbar: [
              ["undo", "redo"],
              ["zoom-to-fit", "zoom-in", "zoom-out"],
              ["logs"],
            ],

            menu: [
              {
                event: "flow:open",
                label: "Open",
              },
              {
                event: "flow:rename",
                label: "Rename",
              },
              { event: "flow:share", label: "Share" },
              { event: "flow:remove", label: "Remove" },
              { event: "navigate:flows", label: "Close" },
            ],
          },
        });

        flowManager.on("flow:open", (flowId: string) => {
          console.log("Opening flow in designer:", flowId);

          // Close FlowManager first
          flowManager.close();

          // Set the flowId and open Designer
          designer.set("flowId", flowId);
          designer.open();

          // Force a resize/refresh after opening
          setTimeout(() => {
            if (typeof designer.resize === 'function') {
              designer.resize();
            }
          }, 100);
        });

        designer.on("flow:remove", async (event: any) => {
          // SDK passes {data: {flowId, ...}, next: fn}
          const flowId = event?.data?.flowId;
          if (flowId) {
            try {
              await appmixer.api.deleteFlow(flowId);
            } catch (error) {
              console.error("Failed to delete flow:", error);
            }
          }
          designer.close();

          // Return to FlowManager after removal
          setTimeout(() => {
            flowManager.reload();
            flowManager.open();
          }, 100);
        });

        designer.on("navigate:flows", (flowId: string) => {
          console.log("Closing flow in designer:", flowId);
          designer.close();

          // Give time for designer to fully close before opening FlowManager
          setTimeout(() => {
            flowManager.reload();
            flowManager.open();
          }, 100);
        });

        setDesignerWidget(designer);
        setWidgetInitialized(true);

        setFlowManagerWidget(flowManager);
        setWidgetInitialized(true);

        if (!showWorkflowBuilder) {
          flowManager.open();
        } else {
          designer.open();
        }
      } catch (err) {
        console.error("Failed to initialize Appmixer workflow widgets:", err);
      }
    }
  }, [
    isInitialized,
    appmixer,
    widgetInitialized,
    onNewWorkflowClick,
  ]);

  // Handle switching between FlowManager and Designer
  useEffect(() => {
    if (widgetInitialized && flowManagerWidget && designerWidget) {
      if (showWorkflowBuilder) {
        flowManagerWidget.close();
        setTimeout(() => {
          designerWidget.open();
          // Force resize after opening
          if (typeof designerWidget.resize === 'function') {
            designerWidget.resize();
          }
        }, 100);
      } else {
        designerWidget.close();
        setTimeout(() => {
          flowManagerWidget.open();
          flowManagerWidget.reload();
        }, 100);
      }
    }
  }, [showWorkflowBuilder, widgetInitialized, flowManagerWidget, designerWidget]);

  // Cleanup widgets on unmount
  useEffect(() => {
    return () => {
      if (flowManagerWidget) {
        try {
          flowManagerWidget.close?.();
        } catch (err) {
          console.error("Error closing flow manager widget:", err);
        }
      }
      if (designerWidget) {
        try {
          designerWidget.close?.();
        } catch (err) {
          console.error("Error closing designer widget:", err);
        }
      }
    };
  }, [flowManagerWidget, designerWidget]);

  if (error) {
    return (
      <div
        className="space-y-6 relative"
        style={
          isHighlightingAppmixer
            ? {
                opacity: 1,
                margin: "15px 15px 0",
                border: "1px dashed red",
                borderRadius: "8px",
                padding: "15px 15px 45px",
              }
            : {}
        }
      >
        <div className="flex items-center justify-center h-96 text-center">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Appmixer Workflow Error
            </h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
        {isHighlightingAppmixer && (
          <img
            src={`https://cdn.builder.io/api/v1/image/assets%2F${import.meta.env.VITE_BUILDER_IO_PROJECT_ID || '30d17f7f0f65497789306b2ad9a1c9a1'}%2F73ed1410c2c24ed397e35b4c7efa3d04?format=webp&width=800`}
            alt="Logo"
            className="absolute bottom-4 right-4 w-6 h-6 object-contain opacity-50"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`space-y-6 relative ${isHighlightingAppmixer ? "appmixer-highlight-overlay" : ""}`}
      style={{
        padding: "15px 15px 45px",
        opacity: isHighlightingAppmixer ? 1 : undefined,
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {showWorkflowBuilder ? "Custom AI (Workflow Builder)" : "Workflow Automation"}
            </h1>
            <p className="text-muted-foreground">
              {showWorkflowBuilder
                ? "Design and build custom automation workflows"
                : "Build AI-powered automations and connect with 3rd-party apps."
              }
            </p>
          </div>
        </div>

        {isInitialized && (
          <div
            ref={sharedContainerRef}
            className="appmixer-widget-container w-full h-[1000px]"
            style={{
              maxWidth: '100%',
              maxHeight: '1000px',
              position: 'relative',
              contain: 'layout style size',
              backgroundColor: 'transparent'
            }}
          />
        )}
      </div>

      {isHighlightingAppmixer && (
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F30d17f7f0f65497789306b2ad9a1c9a1%2F73ed1410c2c24ed397e35b4c7efa3d04?format=webp&width=800"
          alt="Logo"
          className="absolute bottom-4 right-4 w-6 h-6 object-contain opacity-50"
        />
      )}
    </div>
  );
};

export default WorkflowsSection;
