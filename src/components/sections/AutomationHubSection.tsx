import React, { useEffect, useState, useMemo } from "react";
import { useAppmixerApi } from "@/hooks/use-appmixer-api";
import { useAuth } from "@/contexts/AuthContext";
import { useAppmixer } from "@/contexts/AppmixerContextSimple";
import { TabToggleGroup } from "@/components/TabToggleGroup";
import { WorkflowsTab } from "@/components/WorkflowsTab";
import { DesignerView } from "@/components/DesignerView";
import { LogsView } from "@/components/LogsView";
import { AccountsView } from "@/components/AccountsView";
import { TasksView } from "@/components/TasksView";
import { StorageView } from "@/components/StorageView";
import { NewWorkflowModal } from "@/components/modals/NewWorkflowModal";
import { TagManagementModal } from "@/components/modals/TagManagementModal";
import type { Flow } from "@/lib/appmixer-api-types";

interface AutomationHubSectionProps {
  isHighlightingAppmixer?: boolean;
  onIntegrationClick?: (integration: {
    name: string;
    type: string;
    isActive: boolean;
  }) => void;
  onNewWorkflowClick?: () => void;
  onDesignerOpen?: (flowName: string) => void;
  onDesignerClose?: () => void;
  shouldCloseDesigner?: boolean;
}

const AutomationHubSection: React.FC<AutomationHubSectionProps> = ({
  isHighlightingAppmixer = false,
  onIntegrationClick = () => {},
  onNewWorkflowClick = () => {},
  onDesignerOpen = () => {},
  onDesignerClose = () => {},
  shouldCloseDesigner = false,
}) => {
  // Get user from AuthContext
  const { user } = useAuth();

  // Get Appmixer context (handles authentication with user's API key)
  const { isInitialized: isAppmixerInitialized, appmixer: appmixerSdk, error: appmixerError } = useAppmixer();

  // Initialize Appmixer API client
  const {
    client,
    getFlows,
    flows,
    getApps,
    apps,
    startFlow,
    stopFlow,
    cloneFlow,
    customizeFlow,
    createFlow,
    setFlowTags,
    deleteFlow,
    isLoading,
  } = useAppmixerApi({
    config: {
      baseUrl: import.meta.env.VITE_APPMIXER_BASE_URL || 'https://api.pumped-jackass-32081.appmixer.cloud',
    },
  });
  
  // Filter and search state
  const [activeFilter, setActiveFilter] = useState("All categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [activeTab, setActiveTab] = useState<"workflows" | "logs" | "accounts" | "tasks" | "storage">("workflows");

  // Designer modal state
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);

  // New workflow modal state
  const [isNewWorkflowModalOpen, setIsNewWorkflowModalOpen] = useState(false);

  // Tag management modal state
  const [isTagManagementModalOpen, setIsTagManagementModalOpen] = useState(false);
  const [selectedFlowForTags, setSelectedFlowForTags] = useState<Flow | null>(null);

  // Logs filtering state
  const [selectedFlowForLogs, setSelectedFlowForLogs] = useState<Flow | null>(null);

  // Dynamic categories extracted from flow tags
  const categories = useMemo(() => {
    if (!flows.data) return ["All categories"];

    // Extract all unique tags from flows
    const allTags = new Set<string>();
    flows.data.forEach(flow => {
      flow.customFields?.tags?.forEach(tag => allTags.add(tag));
    });

    // Return "All categories" plus all unique tags
    return ["All categories", ...Array.from(allTags).sort()];
  }, [flows.data]);

  // Watch for external close trigger
  useEffect(() => {
    if (shouldCloseDesigner && isDesignerOpen) {
      setIsDesignerOpen(false);
      setSelectedFlow(null);
      getFlows();
    }
  }, [shouldCloseDesigner]);

  // Load flows when Appmixer SDK is initialized
  useEffect(() => {
    if (!user) {
      console.warn('No user found, skipping Appmixer data loading');
      return;
    }

    if (!isAppmixerInitialized || !appmixerSdk) {
      // Wait for AppmixerContextSimple to complete authentication
      return;
    }

    // Get the access token from the authenticated SDK and set it on the API client
    const accessToken = appmixerSdk.get('accessToken');
    if (accessToken) {
      client.setAccessToken(accessToken);
      getFlows();
      getApps();
    }
  }, [user, isAppmixerInitialized, appmixerSdk, client, getFlows, getApps]);

  // Filter flows by type and search criteria
  const filteredFlows = useMemo(() => {
    if (!flows.data) return { integrationTemplates: [], automations: [], integrationInstances: [] };

    const allFlows = flows.data;

    // Filter by search query and category (tag)
    const searchFiltered = allFlows.filter(flow => {
      const matchesSearch = !searchQuery ||
        flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flow.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesActiveFilter = !showOnlyActive || flow.stage === 'running';

      // Filter by category/tag
      const matchesCategory = activeFilter === "All categories" ||
        flow.customFields?.tags?.includes(activeFilter);

      return matchesSearch && matchesActiveFilter && matchesCategory;
    });

    // Separate into integration templates, automations, and integration instances
    const integrationTemplates = searchFiltered.filter(flow =>
      flow.type === 'integration-template'
    );

    const automations = searchFiltered.filter(flow =>
      flow.type === 'automation'
    );

    const integrationInstances = searchFiltered.filter(flow =>
      flow.type === 'integration-instance'
    );

    return { integrationTemplates, automations, integrationInstances };
  }, [flows.data, searchQuery, showOnlyActive, activeFilter]);

  // Handle flow actions
  const handleStartFlow = async (flowId: string) => {
    try {
      await startFlow(flowId);
    } catch (error) {
      console.error('Failed to start flow:', error);
    }
  };

  const handleStopFlow = async (flowId: string) => {
    try {
      await stopFlow(flowId);
    } catch (error) {
      console.error('Failed to stop flow:', error);
    }
  };

  const handleCloneFlow = async (flowId: string) => {
    try {
      await cloneFlow(flowId, { prefix: 'Copy of ' });
    } catch (error) {
      console.error('Failed to clone flow:', error);
    }
  };

  const handleCustomizeFlow = async (flowId: string) => {
    try {
      const customizedFlow = await customizeFlow(flowId, { prefix: 'Customized ' });

      // Automatically open the customized flow in the designer
      if (customizedFlow) {
        setSelectedFlow(customizedFlow);
        setIsDesignerOpen(true);
        onDesignerOpen(customizedFlow.name);
      }
    } catch (error) {
      console.error('Failed to customize flow:', error);
    }
  };

  const handleDeleteFlow = async (flowId: string) => {
    try {
      await deleteFlow(flowId);
    } catch (error) {
      console.error('Failed to delete flow:', error);
      alert('Failed to delete flow. Please try again.');
    }
  };

  const handleIntegrationClick = (flow: Flow) => {
    onIntegrationClick({
      name: flow.name,
      type: flow.type || 'unknown',
      isActive: flow.stage === 'running'
    });
  };

  const handleOpenEditor = (flow: Flow) => {
    setSelectedFlow(flow);
    setIsDesignerOpen(true);
    onDesignerOpen(flow.name);
  };

  const handleCloseDesigner = () => {
    setIsDesignerOpen(false);
    setSelectedFlow(null);
    onDesignerClose();
  };

  const handleFlowRemovedFromDesigner = async () => {
    setIsDesignerOpen(false);
    setSelectedFlow(null);
    onDesignerClose();
    getFlows();
  };

  const handleNewWorkflowClick = () => {
    setIsNewWorkflowModalOpen(true);
  };

  const handleCloseNewWorkflowModal = () => {
    setIsNewWorkflowModalOpen(false);
  };

  const handleCreateWorkflow = async (name: string, description: string) => {
    try {
      // Create the flow using the Appmixer API
      const newFlow = await createFlow({
        name,
        description,
        flow: {}, // Initialize with empty flow descriptor
      });

      // Close the modal
      setIsNewWorkflowModalOpen(false);

      // Call the parent's onNewWorkflowClick if provided
      onNewWorkflowClick();

      // Open the designer with the newly created flow
      if (newFlow) {
        setSelectedFlow(newFlow);
        setIsDesignerOpen(true);
        onDesignerOpen(newFlow.name);
      }
    } catch (error) {
      console.error('Failed to create flow:', error);
      alert('Failed to create workflow. Please try again.');
    }
  };

  const handleManageTags = (flow: Flow) => {
    setSelectedFlowForTags(flow);
    setIsTagManagementModalOpen(true);
  };

  const handleCloseTagManagement = () => {
    setIsTagManagementModalOpen(false);
    setSelectedFlowForTags(null);
  };

  const handleSaveTags = async (flowId: string, tags: string[]) => {
    try {
      await setFlowTags(flowId, tags);
      // Tags will be automatically updated in the flows state by the hook
    } catch (error) {
      console.error('Failed to save tags:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  const handleViewLogs = (flow: Flow) => {
    setSelectedFlowForLogs(flow);
    setActiveTab("logs");
  };

  const handleClearLogsFilter = () => {
    setSelectedFlowForLogs(null);
  };

  // Extract all available tags for suggestions
  const allAvailableTags = useMemo(() => {
    if (!flows.data) return [];
    const tagsSet = new Set<string>();
    flows.data.forEach(flow => {
      flow.customFields?.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [flows.data]);

  if (flows.error || appmixerError) {
    return (
      <div
        className={`space-y-6 relative ${isHighlightingAppmixer ? "appmixer-highlight-overlay" : ""}`}
        style={{
          padding: "15px 15px 45px",
          opacity: isHighlightingAppmixer ? 1 : undefined,
        }}
      >
        <div className="flex items-center justify-center h-96 text-center">
          <div>
            <h2 className="text-xl font-semibold mb-2">Automation Hub Error</h2>
            <p className="text-muted-foreground">{flows.error || appmixerError}</p>
            {!isAppmixerInitialized && (
              <p className="text-muted-foreground mt-2">
                Please check your Appmixer configuration and API token.
              </p>
            )}
          </div>
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
  }

  // If designer is open, show the designer view instead of the normal content
  if (isDesignerOpen && selectedFlow) {
    return (
      <div
        className={`relative ${isHighlightingAppmixer ? "appmixer-highlight-overlay appmixer-highlight-overlay-no-padding" : ""}`}
        style={{
          padding: "0",
          // DesignerView measures the remaining viewport height itself; a
          // fixed height here made it overflow the viewport.
          opacity: isHighlightingAppmixer ? 1 : undefined,
        }}
      >
        <DesignerView flow={selectedFlow} onClose={handleCloseDesigner} onFlowRemove={handleFlowRemovedFromDesigner} />
        {isHighlightingAppmixer && (
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F30d17f7f0f65497789306b2ad9a1c9a1%2F73ed1410c2c24ed397e35b4c7efa3d04?format=webp&width=800"
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
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Automation hub</h1>
          <TabToggleGroup activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "workflows" && (
        <WorkflowsTab
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showOnlyActive={showOnlyActive}
          setShowOnlyActive={setShowOnlyActive}
          categories={categories}
          filteredFlows={filteredFlows}
          apps={apps.data || {}}
          isLoading={isLoading}
          onIntegrationClick={handleIntegrationClick}
          onStartFlow={handleStartFlow}
          onStopFlow={handleStopFlow}
          onCloneFlow={handleCloneFlow}
          onCustomizeFlow={handleCustomizeFlow}
          onNewWorkflowClick={handleNewWorkflowClick}
          onOpenEditor={handleOpenEditor}
          onManageTags={handleManageTags}
          onDeleteFlow={handleDeleteFlow}
          onViewLogs={handleViewLogs}
        />
      )}

      {/* Logs Tab Content */}
      {activeTab === "logs" && (
        <div className="h-[calc(100vh-250px)]">
          <LogsView
            selectedFlow={selectedFlowForLogs}
            onClearFilter={handleClearLogsFilter}
          />
        </div>
      )}

      {/* Accounts Tab Content */}
      {activeTab === "accounts" && (
        <div className="h-[calc(100vh-250px)]">
          <AccountsView />
        </div>
      )}

      {/* Tasks Tab Content */}
      {activeTab === "tasks" && (
        <div className="h-[calc(100vh-250px)]">
          <TasksView />
        </div>
      )}

      {/* Storage Tab Content */}
      {activeTab === "storage" && (
        <div className="h-[calc(100vh-250px)]">
          <StorageView />
        </div>
      )}

      {isHighlightingAppmixer && (
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F30d17f7f0f65497789306b2ad9a1c9a1%2F73ed1410c2c24ed397e35b4c7efa3d04?format=webp&width=800"
          alt="Logo"
          className="absolute bottom-4 right-4 w-6 h-6 object-contain opacity-50"
        />
      )}

      {/* New Workflow Modal */}
      <NewWorkflowModal
        isOpen={isNewWorkflowModalOpen}
        onClose={handleCloseNewWorkflowModal}
        onCreateWorkflow={handleCreateWorkflow}
      />

      {/* Tag Management Modal */}
      {selectedFlowForTags && (
        <TagManagementModal
          isOpen={isTagManagementModalOpen}
          onClose={handleCloseTagManagement}
          flowId={selectedFlowForTags.flowId}
          flowName={selectedFlowForTags.name}
          currentTags={selectedFlowForTags.customFields?.tags || []}
          allAvailableTags={allAvailableTags}
          onSaveTags={handleSaveTags}
        />
      )}
    </div>
  );
};

export default AutomationHubSection;