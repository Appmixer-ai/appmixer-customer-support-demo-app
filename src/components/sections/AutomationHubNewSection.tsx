import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAppmixer } from "@/contexts/AppmixerContextSimple";
import { useAppmixerApi } from "@/hooks/use-appmixer-api";
import { DesignerView } from "@/components/DesignerView";
import type { Flow } from "@/lib/appmixer-api-types";

interface AutomationHubNewSectionProps {
  isHighlightingAppmixer?: boolean;
  onDesignerOpen?: (flowName: string) => void;
  onDesignerClose?: () => void;
  shouldCloseDesigner?: boolean;
}

const AutomationHubNewSection: React.FC<AutomationHubNewSectionProps> = ({
  isHighlightingAppmixer = false,
  onDesignerOpen = () => {},
  onDesignerClose = () => {},
  shouldCloseDesigner = false,
}) => {
  const { isInitialized, appmixer } = useAppmixer();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetInstanceRef = useRef<any>(null);

  // Designer state
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);

  // Bumping this forces the AutomationHub widget to fully re-init (cleanup +
  // create) instead of calling widget.reload(), which was leaving the widget
  // in a broken state where pre-built templates stopped loading after a user
  // activated an integration through the wizard.
  const [widgetReloadKey, setWidgetReloadKey] = useState(0);

  // Wizard ref
  const wizardInstanceRef = useRef<any>(null);

  const { client, getFlow } = useAppmixerApi({
    config: {
      baseUrl: import.meta.env.VITE_APPMIXER_BASE_URL || 'https://api.pumped-jackass-32081.appmixer.cloud',
    },
  });

  // Set the access token on the API client when appmixer is ready
  useEffect(() => {
    if (isInitialized && appmixer) {
      const accessToken = appmixer.get('accessToken');
      if (accessToken) {
        client.setAccessToken(accessToken);
      }
    }
  }, [isInitialized, appmixer, client]);

  // Watch for external close trigger (breadcrumb navigation)
  useEffect(() => {
    if (shouldCloseDesigner && isDesignerOpen) {
      setIsDesignerOpen(false);
      setSelectedFlow(null);
    }
  }, [shouldCloseDesigner, isDesignerOpen]);

  // Use refs for callbacks so the widget init effect doesn't re-run on prop/state changes
  const getFlowRef = useRef(getFlow);
  getFlowRef.current = getFlow;
  const onDesignerOpenRef = useRef(onDesignerOpen);
  onDesignerOpenRef.current = onDesignerOpen;
  const onDesignerCloseRef = useRef(onDesignerClose);
  onDesignerCloseRef.current = onDesignerClose;

  const reloadWidget = useCallback(() => {
    setWidgetReloadKey((k) => k + 1);
  }, []);

  const previousBodyOverflowRef = useRef<string | null>(null);

  const lockBodyScroll = useCallback(() => {
    if (previousBodyOverflowRef.current === null) {
      previousBodyOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
  }, []);

  const unlockBodyScroll = useCallback(() => {
    if (previousBodyOverflowRef.current !== null) {
      document.body.style.overflow = previousBodyOverflowRef.current;
      previousBodyOverflowRef.current = null;
    }
  }, []);

  const closeWizard = useCallback(() => {
    if (wizardInstanceRef.current) {
      try {
        wizardInstanceRef.current.close?.();
      } catch (error) {
        console.error("Error closing wizard:", error);
      }
      wizardInstanceRef.current = null;
    }
    unlockBodyScroll();
  }, [unlockBodyScroll]);

  const dismissWidgetPopups = useCallback(() => {
    // The Appmixer widget's context menu is portaled into <body> and doesn't
    // always close when its trigger card unmounts. Simulate a click outside and
    // an Escape key press — both are common dismissal triggers for popovers.
    try {
      document.body.dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true, cancelable: true })
      );
      document.body.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          code: "Escape",
          bubbles: true,
        })
      );
    } catch (error) {
      console.warn("Failed to dismiss widget popups:", error);
    }
  }, []);

  const handleOpenWizard = useCallback((flowId: string) => {
    if (!appmixer) return;

    dismissWidgetPopups();

    // Close any existing wizard
    closeWizard();

    let handled = false;

    try {
      lockBodyScroll();

      const wizard = appmixer.ui.Wizard({
        options: {
          flowId,
          showHeader: false,
        },
      });

      wizard.on("flow:start", async (event: any) => {
        if (handled) return;
        handled = true;
        console.log("Wizard flow:start — starting flow");
        // The Appmixer widget only auto-runs the default `startInstance`
        // dispatch when no listener is bound. Since we're listening, we must
        // call `next()` ourselves. It returns a promise that resolves after
        // the instance has actually started, so await it before reloading
        // the hub — otherwise the reload races the start and the flow
        // shows up as not-yet-running.
        try {
          await event?.next?.();
        } catch (error) {
          console.error("Failed to start flow from wizard:", error);
        }
        closeWizard();
        reloadWidget();
      });

      wizard.on("close", () => {
        if (handled) return;
        handled = true;
        console.log("Wizard closed");
        closeWizard();
      });

      wizardInstanceRef.current = wizard;
      wizard.set("flowId", flowId);
      wizard.open();
    } catch (error) {
      unlockBodyScroll();
      console.error("Failed to open wizard:", error);
    }
  }, [appmixer, closeWizard, dismissWidgetPopups, lockBodyScroll, unlockBodyScroll, reloadWidget]);

  const handleOpenDesigner = useCallback(async (flowId: string) => {
    dismissWidgetPopups();
    try {
      const flow = await getFlowRef.current(flowId);
      if (flow) {
        setSelectedFlow(flow);
        setIsDesignerOpen(true);
        onDesignerOpenRef.current(flow.name);
      }
    } catch (error) {
      console.error("Failed to fetch flow for designer:", error);
    }
  }, [dismissWidgetPopups]);

  const handleCloseDesigner = useCallback(() => {
    setIsDesignerOpen(false);
    setSelectedFlow(null);
    onDesignerCloseRef.current();
    reloadWidget();
  }, [reloadWidget]);

  const handleFlowRemovedFromDesigner = useCallback(() => {
    setIsDesignerOpen(false);
    setSelectedFlow(null);
    onDesignerCloseRef.current();
    reloadWidget();
  }, [reloadWidget]);

  useEffect(() => {
    if (!isInitialized || !appmixer) {
      return;
    }

    // Skip if widget is already initialized
    if (widgetInstanceRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      if (!containerRef.current || widgetInstanceRef.current) {
        return;
      }

      try {
        console.log("Initializing AutomationHub widget");

        const hub = appmixer.ui.AutomationHub({
          el: containerRef.current,
          state: {
            flows: {
              layout: "grid",
            },
          },
          options: {
            customization: {
              entryPoints: {
                templates: true,
                scratch: true,
              },
            },
            header: {
              visible: true,
              tabs: {
                hidden: [],
              },
              subheader: {
                visible: true,
              },
            },
            flows: {
              header: {
                layout: { visible: true },
              },
              templates: {
                header: {
                  categories: {
                    visible: true,
                    tabs: [
                      {
                        label: "AI Agent",
                        category: "69cbacd2539433a380972a5b",
                      },
                      {
                        label: "Communications",
                        category: "69cbacec539433a380972aa9",
                      },
                      {
                        label: "CRM",
                        category: "69cbad02f15d93927a19e104",
                      },
                      {
                        label: "Work Management",
                        category: "69cbad23539433a380972abd",
                      },
                      {
                        label: "Customer Succcess",
                        category: "69cbad2af15d93927a19e10f",
                      },
                    ],
                  },
                },
              },
            },
          },
          l10n: {
            ui: {
              automationHub: {
                title: "Automation Hub",
                subtitle: "Manage and create automation workflows",
              },
            },
          },
          theme: {
            mode: "light",
            variables: {
              colors: {
                surface: "#ffffff",
                neutral: "#0f172a",
                primary: "#1c1917",
                onPrimary: "#FFFFFF",
                secondary: "#f8fafc",
                onSecondary: "#FFFFFF",
                tertiary: "#D494D0",
                onTetriary: "#FFFFFF",
                error: "#ef4444",
                warning: "#f59e0b",
                onWarning: "#FFFFFF",
                success: "#22c55e",
                onSuccess: "#FFFFFF",
                modifier: "#C558CF",
                onModifier: "#FFFFFF",
                highlighter: "#FFA500",
                separator: "#e2e8f0",
                charcoalTeal: "#2C3130",
                darkJade: "#2C4B42",
                background: "#fafafa",
              },
              font: {
                family:
                  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                familyMono:
                  "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
                weightRegular: 300,
                weightMedium: 400,
                weightSemibold: 500,
                weightBold: 600,
                size: 12,
              },
              shadows: {
                level0: "none",
                level1:
                  "0 1px 3px 0 rgb(0 0 0 / 0.12), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
                level2:
                  "0 4px 6px -1px rgb(0 0 0 / 0.15), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                level3:
                  "0 10px 15px -3px rgb(0 0 0 / 0.15), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                level4:
                  "0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                level5: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
                backdrop: "rgba(0 0 0 / 92%)",
                popover: "1px 3px 9px rgba(0 0 0 / 32%)",
                icon: "none)",
                blur: "rgba(0 0 0 / 75%)",
                bar: "none",
              },
            },
          },
        });

        // Wire up events
        hub.on("flow:open-designer", (data: any) => {
          const flowId = data?.data?.flow?.flowId;
          if (flowId) {
            handleOpenDesigner(flowId);
          } else {
            console.error("AutomationHub flow:open-designer: missing flowId", data);
          }
        });

        hub.on("flow:open-wizard", (data: any) => {
          console.log("AutomationHub flow:open-wizard event data:", JSON.stringify(data));
          const flowId = data?.data?.flow?.flowId;
          if (flowId) {
            handleOpenWizard(flowId);
          } else {
            console.error("AutomationHub flow:open-wizard: missing flowId", data);
          }
        });

        // Store the instance for cleanup
        widgetInstanceRef.current = hub;

        hub.open();

        console.log("AutomationHub widget created successfully");
      } catch (error) {
        console.error("Error initializing AutomationHub widget:", error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (widgetInstanceRef.current) {
        try {
          widgetInstanceRef.current.close?.();
        } catch (error) {
          console.error("Error closing AutomationHub widget during cleanup:", error);
        }
        widgetInstanceRef.current = null;
      }
      closeWizard();
    };
  }, [isInitialized, appmixer, handleOpenDesigner, closeWizard, widgetReloadKey]);

  const showDesigner = isDesignerOpen && selectedFlow;

  return (
    <>
      {showDesigner && (
        <div
          className={`relative ${isHighlightingAppmixer ? "appmixer-highlight-overlay appmixer-highlight-overlay-no-padding" : ""}`}
          style={{
            padding: "0",
            // DesignerView measures the remaining viewport height itself; a
            // fixed height here made it overflow the viewport.
            opacity: isHighlightingAppmixer ? 1 : undefined,
          }}
        >
          <DesignerView
            flow={selectedFlow}
            onClose={handleCloseDesigner}
            onFlowRemove={handleFlowRemovedFromDesigner}
          />
        </div>
      )}
      <div
        className="flex flex-col h-full"
        style={{
          minHeight: "calc(100vh - 8rem)",
          display: showDesigner ? "none" : undefined,
        }}
      >
        <div className="flex-1 overflow-hidden">
          {!isInitialized ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Initializing Automation Hub...</p>
              </div>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="bg-gray-50"
              style={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                position: "relative",
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default AutomationHubNewSection;
