import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { NewTicketForm } from "./components/NewTicketForm";
import { DemoTopBanner } from "./components/DemoTopBanner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppmixerProvider } from "./contexts/AppmixerContextSimple";
import { DemoModeProvider } from "./contexts/DemoModeContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

function AppContent() {
  const location = useLocation();
  const { user, loading: authLoading, signOut } = useAuth();
  const [isHighlightingAppmixer, setIsHighlightingAppmixer] = useState(false);
  const [isBannerCollapsed, setIsBannerCollapsed] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [newTicketData, setNewTicketData] = useState<{
    name: string;
    email: string;
    issueSummary: string;
    issueDescription: string;
    priority: string;
  } | null>(null);

  const isAuthenticated = !!user;
  const isLoginPage = location.pathname === '/login';

  const handleToggleHighlight = () => {
    setIsHighlightingAppmixer((prev) => {
      const newState = !prev;
      return newState;
    });
  };

  const handleLogin = (email: string, password: string) => {
    // For demo purposes, accept any email/password (legacy support)
    // Actual Google authentication is handled by the GoogleSignIn button
    console.log("Demo login with:", email, password);
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle new ticket submission
  const handleTicketSubmit = (ticketData: { name: string; email: string; issueSummary: string; issueDescription: string; priority: string }) => {
    setNewTicketData(ticketData);
    setShowTicketForm(false);
  };

  // Clear processed ticket data
  const handleTicketProcessed = () => {
    setNewTicketData(null);
  };

  // Show ticket form if requested
  if (showTicketForm) {
    return (
      <NewTicketForm
        onBack={() => setShowTicketForm(false)}
        onSubmit={handleTicketSubmit}
      />
    );
  }

  // Handle data reset
  const handleDataReset = () => {
    // This will be called after reset, before page reload
    console.log('Data reset initiated');
  };

  return (
    <div className="min-h-screen">
      {isAuthenticated && !isLoginPage && (
        <DemoTopBanner
          isHighlightingAppmixer={isHighlightingAppmixer}
          onNewTicketSimulation={() => setShowTicketForm(true)}
          onToggleHighlight={handleToggleHighlight}
          onDataReset={handleDataReset}
          isCollapsed={isBannerCollapsed}
          onToggleCollapse={() => setIsBannerCollapsed(prev => !prev)}
        />
      )}
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Index
                onLogout={handleLogout}
                isHighlightingAppmixer={isHighlightingAppmixer}
                setIsHighlightingAppmixer={setIsHighlightingAppmixer}
                newTicketData={newTicketData}
                onTicketProcessed={handleTicketProcessed}
                isBannerCollapsed={isBannerCollapsed}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <DemoModeProvider>
              <AppmixerProvider>
                <AppContent />
              </AppmixerProvider>
            </DemoModeProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
