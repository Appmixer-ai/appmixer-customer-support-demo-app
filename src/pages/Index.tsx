import React, { useState, useEffect } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/AppSidebar";

import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { fetchTickets, createTicketWithCustomer, updateTicket } from "@/lib/database";
import { SupportTicket, TicketStatus } from "@/types/support";
import { useToast } from "@/hooks/use-toast";
import "../components/highlight-overlay.css";
import {
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketDetailsModal } from "@/components/modals/TicketDetailsModal";
import { NewWorkflowModal } from "@/components/modals/NewWorkflowModal";
import WorkflowsSection from "@/components/sections/WorkflowsSection";
import IntegrationsSection from "@/components/sections/IntegrationsSection";
import AutomationHubSection from "@/components/sections/AutomationHubSection";
import AutomationHubNewSection from "@/components/sections/AutomationHubNewSection";
import { supabase } from "@/lib/supabase";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { cn } from "@/lib/utils";

interface IndexProps {
  onLogout?: () => void;
  isHighlightingAppmixer?: boolean;
  setIsHighlightingAppmixer?: (value: boolean | ((prev: boolean) => boolean)) => void;
  newTicketData?: {
    name: string;
    email: string;
    issueSummary: string;
    issueDescription: string;
    priority: string;
  } | null;
  onTicketProcessed?: () => void;
  isBannerCollapsed?: boolean;
}

const Index = ({
  onLogout,
  isHighlightingAppmixer = false,
  setIsHighlightingAppmixer = () => {},
  newTicketData = null,
  onTicketProcessed = () => {},
  isBannerCollapsed = false,
}: IndexProps) => {
  const { isDemoMode } = useDemoMode();

  const [activeTab, setActiveTab] = useState("tickets");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEndUserView, setIsEndUserView] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showNewWorkflowPage, setShowNewWorkflowPage] = useState(false);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );

  // State for dynamic ticket management
  const [adminTickets, setAdminTickets] = useState<SupportTicket[]>([]);
  const [endUserTickets, setEndUserTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<{
    name: string;
    type: string;
    isActive: boolean;
  } | null>(null);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showIntegrationsMenu, setShowIntegrationsMenu] = useState(false);
  const [openDesignerFlow, setOpenDesignerFlow] = useState<{ name: string } | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const logToken = async () => {
      const {data} = await supabase.auth.getSession();
      if (data.session) {
        console.log("Supabase Auth Session:", data.session.access_token);
      }}
    logToken();
    
  }, []);

  // Load tickets from database
  useEffect(() => {
    const loadTickets = async () => {
      try {
        setIsLoading(true);
        const tickets = await fetchTickets();
        
        // Separate admin tickets and end user tickets
        // End user tickets are for customer with email "customer.john@email.com"
        const endUserCustomerId = "77777777-7777-7777-7777-777777777777";
        const endUser = tickets.filter(t => t.customer.id === endUserCustomerId);
        const admin = tickets.filter(t => t.customer.id !== endUserCustomerId);
        
        setAdminTickets(admin);
        setEndUserTickets(endUser);
      } catch (error) {
        console.error('Failed to load tickets:', error);
        toast({
          title: "Error",
          description: "Failed to load tickets from database",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTickets();
  }, [toast]);

  // Debug state changes
  React.useEffect(() => {
    console.log("isHighlightingAppmixer:", isHighlightingAppmixer);
  }, [isHighlightingAppmixer]);

  // Load Appmixer Chat Widget
  React.useEffect(() => {
    const baseUrl = import.meta.env.VITE_APPMIXER_BASE_URL || "https://api.pumped-jackass-32081.appmixer.cloud";
    const flowId = import.meta.env.VITE_APPMIXER_CHAT_FLOW_ID || "beb52c54-01ca-4743-aa36-0821ccda69e2";
    const componentId = import.meta.env.VITE_APPMIXER_CHAT_COMPONENT_ID || "6bac4aab-c983-4ccc-97a0-7fa278d82204";

    // Load the chat bundle script
    const bundleScript = document.createElement("script");
    bundleScript.type = "module";
    bundleScript.src = `${baseUrl}/plugins/appmixer/utils/chat/assets/chat.bundle.js`;

    // Initialize the launcher only after the bundle script has loaded
    bundleScript.onload = () => {
      const initScript = document.createElement("script");
      initScript.type = "module";
      initScript.innerHTML = `
          initLauncher({
              mode: 'dialog',
              theme: 'light',
              endpoint: '${baseUrl}/flows/${flowId}/components/${componentId}',
              baseUrl: '${baseUrl}',
              jwt: '',
              widgetPosition: 'bottom-right'
          });
      `;
      document.body.appendChild(initScript);
    };

    document.body.appendChild(bundleScript);

    // Cleanup function to remove scripts when component unmounts
    return () => {
      if (bundleScript.parentNode) {
        bundleScript.parentNode.removeChild(bundleScript);
      }
      // Note: initScript is created inside onload, so we need to find and remove it
      const existingInitScript = document.querySelector('script[type="module"]:not([src])');
      if (existingInitScript && existingInitScript.innerHTML.includes('initLauncher')) {
        existingInitScript.remove();
      }
    };
  }, []);

  // Process new ticket data when provided
  React.useEffect(() => {
    if (newTicketData) {
      const processNewTicket = async () => {
        try {
          const newTicket = await addNewTicket(newTicketData);
          console.log("New ticket created:", newTicket);

          // Switch to tickets tab and admin view to show the new ticket
          setActiveTab("tickets");
          setIsEndUserView(false);
          onTicketProcessed();
        } catch (error) {
          console.error('Error processing new ticket:', error);
        }
      };
      
      processNewTicket();
    }
  }, [newTicketData, onTicketProcessed]);


  const handleTicketClick = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
  };

  const handleTicketUpdate = (updatedTicket: SupportTicket) => {
    // Update the ticket in the appropriate list
    if (isEndUserView) {
      setEndUserTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    } else {
      setAdminTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    }
    
    // Update the selected ticket if it's the same one
    if (selectedTicket?.id === updatedTicket.id) {
      setSelectedTicket(updatedTicket);
    }
  };

  const handleTicketDelete = (deletedTicketId: string) => {
    // Remove the ticket from the appropriate list
    if (isEndUserView) {
      setEndUserTickets(prev => prev.filter(t => t.id !== deletedTicketId));
    } else {
      setAdminTickets(prev => prev.filter(t => t.id !== deletedTicketId));
    }
    
    // Clear the selected ticket if it's the deleted one
    if (selectedTicket?.id === deletedTicketId) {
      setSelectedTicket(null);
    }
  };

  const handleTicketStatusUpdate = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      const updatedTicket = await updateTicket(ticketId, { status: newStatus });
      handleTicketUpdate(updatedTicket);
      
      // Show success toast
      const statusDisplay = newStatus.replace("-", " ");
      toast({
        title: "Ticket Updated",
        description: `Ticket #${ticketId} was successfully moved to ${statusDisplay} status.`,
      });
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      
      // Show error toast
      toast({
        title: "Update Failed",
        description: `Failed to update ticket #${ticketId} status. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleIntegrationClick = (integration: {
    name: string;
    type: string;
    isActive: boolean;
  }) => {
    setSelectedIntegration(integration);
  };

  // Function to generate unique ticket ID
  const generateTicketId = () => {
    const allTickets = [...adminTickets, ...endUserTickets];
    const existingIds = allTickets.map(t => {
      const match = t.id.match(/\d+$/);
      return match ? parseInt(match[0]) : 0;
    });
    const maxId = Math.max(...existingIds, 0);
    return `TICK-${String(maxId + 1).padStart(3, '0')}`;
  };

  // Function to add new ticket to support section
  const addNewTicket = async (ticketData: { name: string; email: string; issueSummary: string; issueDescription: string; priority: string }) => {
    try {
      const newTicket = await createTicketWithCustomer({
        title: ticketData.issueSummary,
        description: ticketData.issueDescription,
        priority: ticketData.priority as any,
        status: "new",
        customerName: ticketData.name,
        customerEmail: ticketData.email,
        assignee: undefined,
        tags: [],
      });
      
      setAdminTickets(prev => [newTicket, ...prev]);
      
      // Show success toast
      toast({
        title: "Ticket Created",
        description: `New support ticket #${newTicket.id} has been created successfully.`,
      });
      
      return newTicket;
    } catch (error) {
      console.error('Failed to create ticket:', error);
      toast({
        title: "Error",
        description: "Failed to create ticket. Please try again.",
        variant: "destructive",
      });
      
      // Return a mock ticket as fallback
      const fallbackTicket: SupportTicket = {
        id: generateTicketId(),
        title: ticketData.issueSummary,
        description: ticketData.issueDescription,
        priority: "medium",
        status: "new",
        customer: {
          id: `customer-${Date.now()}`,
          name: ticketData.name,
          email: ticketData.email,
        },
        assignee: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
      };
      setAdminTickets(prev => [fallbackTicket, ...prev]);
      return fallbackTicket;
    }
  };

  // Use different ticket data based on view mode
  const currentTickets = isEndUserView ? endUserTickets : adminTickets;


  const filteredTickets = currentTickets.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleViewToggle = (checked: boolean) => {
    setIsTransitioning(true);

    // Simulate transition time with skeleton loading
    setTimeout(() => {
      setIsEndUserView(checked);
      // When switching to end-user view, default to tickets
      if (checked) {
        setActiveTab("tickets");
      }
      setIsTransitioning(false);
    }, 800); // 800ms transition time
  };

  const renderTabContent = () => {
    switch (activeTab) {


      case "tickets":
        return (
          <div style={{ padding: "15px 15px 45px" }}>
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Support tickets
                </h1>
                <p className="text-muted-foreground">
                  Manage and track all customer support tickets
                </p>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search tickets by title, description, or customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="sm" className="hidden">
                  Filter with AI
                </Button>
              </div>

              {/* Kanban Board */}
              <div>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="h-8 w-32" />
                        <div className="space-y-2">
                          {Array.from({ length: 3 }).map((_, j) => (
                            <Skeleton key={j} className="h-32 w-full" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <KanbanBoard
                    tickets={filteredTickets}
                    onTicketClick={handleTicketClick}
                    onTicketStatusUpdate={handleTicketStatusUpdate}
                  />
                )}
              </div>
            </div>
          </div>
        );


      case "automation-hub":
        return (
          <div className="space-y-4">
            <AutomationHubSection
              isHighlightingAppmixer={isHighlightingAppmixer}
              onIntegrationClick={handleIntegrationClick}
              onNewWorkflowClick={() => setShowNewWorkflowPage(true)}
              onDesignerOpen={(flowName) => setOpenDesignerFlow({ name: flowName })}
              onDesignerClose={() => setOpenDesignerFlow(null)}
              shouldCloseDesigner={!openDesignerFlow}
            />
          </div>
        );

      case "automation-hub-new":
        return (
          <div>
            <AutomationHubNewSection
              isHighlightingAppmixer={isHighlightingAppmixer}
              onDesignerOpen={(flowName) => setOpenDesignerFlow({ name: flowName })}
              onDesignerClose={() => setOpenDesignerFlow(null)}
              shouldCloseDesigner={!openDesignerFlow}
            />
          </div>
        );

      case "workflows":
        return (
          <div className="space-y-4">
            <WorkflowsSection
              isHighlightingAppmixer={isHighlightingAppmixer}
              showWorkflowBuilder={showWorkflowBuilder}
              onNewWorkflowClick={() => setShowNewWorkflowPage(true)}
            />
          </div>
        );

      case "integrations":
        return (
          <div className="space-y-4">
            <IntegrationsSection
              isHighlightingAppmixer={isHighlightingAppmixer}
              onIntegrationClick={handleIntegrationClick}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">All Tickets</h1>
              <p className="text-muted-foreground">
                Select a section from the sidebar to get started
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      style={
        {
          "--sidebar-width-icon": "3.375rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          // Always close the designer when navigating via the sidebar —
          // otherwise clicking "Automation Hub" while the designer is open
          // is a no-op (same activeTab) and the user is stuck.
          setOpenDesignerFlow(null);
          setActiveTab(tab);
        }}
        isEndUserView={isEndUserView}
        isTransitioning={isTransitioning}
        isHighlightingAppmixer={isHighlightingAppmixer}
        onLogout={onLogout}
        ticketCount={currentTickets.length}
        isBannerCollapsed={isBannerCollapsed}
      />
      <SidebarInset className={isBannerCollapsed ? "pt-0" : "pt-[60px]"} style={{ transition: "padding-top 300ms" }}>
        {!isDemoMode && (
          <header
            className={`flex h-16 shrink-0 items-center gap-2 border-b px-4 ${isHighlightingAppmixer ? "highlight-dimmed" : "highlight-normal"}`}
          >
            <SidebarTrigger className="-ml-1 h-8" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2 text-gray-400">
              <span
                className="text-sm font-medium cursor-pointer hover:text-gray-950 transition-colors"
                onClick={() => setActiveTab("tickets")}
              >
                Your SaaS
              </span>
              <Separator orientation="vertical" className="h-4" />
              <span
                className={cn(
                  "text-sm font-medium cursor-pointer transition-colors",
                  openDesignerFlow ? "hover:text-gray-950" : "text-gray-950 hover:text-gray-950"
                )}
                onClick={() => {
                  // If designer is open, close it and return to flows
                  if (openDesignerFlow) {
                    setOpenDesignerFlow(null);
                  }
                  // Enable breadcrumb navigation for all sections
                  if (activeTab === "automation-hub") {
                    setActiveTab("automation-hub");
                  } else if (activeTab === "workflows") {
                    setActiveTab("workflows");
                  } else if (activeTab === "integrations") {
                    setActiveTab("integrations");
                  } else if (activeTab === "ai-ticket-assistant") {
                    setActiveTab("ai-ticket-assistant");
                  } else if (activeTab === "tickets") {
                    setActiveTab("tickets");
                  } else if (activeTab === "analytics") {
                    setActiveTab("analytics");
                  } else if (activeTab === "reports") {
                    setActiveTab("reports");
                  } else if (activeTab === "settings") {
                    setActiveTab("settings");
                  } else {
                    setActiveTab(activeTab);
                  }
                }}
              >
                {activeTab === "tickets" ? "Support Tickets" :
               activeTab === "automation-hub" ? "Automation Hub Custom" :
               activeTab === "automation-hub-new" ? "Automation Hub" :
               activeTab.replace("-", " ")}
              </span>
              {openDesignerFlow && activeTab === "automation-hub" && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-sm font-medium text-gray-950">
                    {openDesignerFlow.name}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2 hidden">
                <Switch
                  id="view-toggle"
                  checked={isEndUserView}
                  onCheckedChange={handleViewToggle}
                  disabled={isTransitioning}
                  className="h-auto self-center"
                />
                <label
                  htmlFor="view-toggle"
                  className="text-sm font-medium cursor-pointer"
                >
                  {isEndUserView
                    ? "switch to support agent view"
                    : "switch view to end user"}
                </label>
              </div>


            </div>
          </header>
        )}
        <div
          className={cn(`flex flex-1 flex-col gap-4 bg-gray-50 ${isHighlightingAppmixer && activeTab !== "workflows" && activeTab !== "integrations" && activeTab !== "automation-hub" && activeTab !== "automation-hub-new" ? "highlight-dimmed" : "highlight-normal"}`, isDemoMode || openDesignerFlow || activeTab === "automation-hub-new" ? "p-0" : "p-4")}
        
        >
          {isTransitioning ? (
            // Skeleton loading during transition
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </SidebarInset>

      {/* Ticket Details Modal */}
      <TicketDetailsModal
        ticket={selectedTicket}
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onTicketUpdate={handleTicketUpdate}
        onTicketDelete={handleTicketDelete}
      />

    </SidebarProvider>
  );
};

export default Index;
