import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { CornerLeftDown, RotateCcw, ChevronUp, ChevronDown } from "lucide-react";
import { useDemoMode } from "@/contexts/DemoModeContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { resetToDefaultDemoData } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";

interface DemoTopBannerProps {
  isHighlightingAppmixer: boolean;
  onNewTicketSimulation: () => void;
  onToggleHighlight: () => void;
  onDataReset?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function DemoTopBanner({
  isHighlightingAppmixer,
  onNewTicketSimulation,
  onToggleHighlight,
  onDataReset,
  isCollapsed = false,
  onToggleCollapse,
}: DemoTopBannerProps) {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { toast } = useToast();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await resetToDefaultDemoData();

      toast({
        title: "Data Reset Complete",
        description: "All ticket data has been reset to the default demo state with 40 realistic tickets.",
      });

      // Close dialog
      setShowResetDialog(false);

      // Call the callback to refresh the UI
      if (onDataReset) {
        onDataReset();
      }

      // Reload the page to refresh all data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Failed to reset data:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset data. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "w-full bg-red-600 text-white fixed top-0 left-0 z-20 transition-all duration-300 overflow-hidden",
          isCollapsed ? "h-0" : "h-auto px-4 py-3"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="items-center gap-2 hidden sm:flex">
            <CornerLeftDown className="w-4 h-4" />
            <span className="font-medium text-sm">
              Imagine this is your SaaS app
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-red-100 font-medium hidden xl:block">
              Use this app to test key Appmixer features: the Automation hub and
              AI-powered chat.
            </span>
            <span className="text-xs text-red-100 font-medium hidden md:block xl:hidden">
              Test Appmixer features
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onNewTicketSimulation}
                className="px-3 py-1.5 bg-white text-gray-900 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
              >
                New ticket simulation
              </button>
              <button
                onClick={() => setShowResetDialog(true)}
                className="px-3 py-1.5 bg-white text-gray-900 rounded text-xs font-medium hover:bg-gray-100 transition-colors flex items-center gap-1.5"
                title="Reset all ticket data to default demo state"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Data
              </button>
              <button
                onClick={toggleDemoMode}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium transition-colors",
                  isDemoMode
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-white text-gray-900 hover:bg-gray-100",
                )}
              >
                {isDemoMode ? "Demo Mode ON" : "Demo Mode OFF"}
              </button>
              <button
                onClick={onToggleHighlight}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium border-2 border-dashed transition-colors",
                  isHighlightingAppmixer
                    ? "bg-red-700 text-white border-white hover:bg-red-800"
                    : "bg-white text-red-600 border-red-300 hover:bg-red-50",
                )}
              >
                {isHighlightingAppmixer ? "Unhighlight" : "Highlight"} appmixer
                features
              </button>
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="px-1.5 py-1.5 bg-red-700 rounded text-white hover:bg-red-800 transition-colors"
                  title="Collapse banner"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Expand tab shown when collapsed */}
      {isCollapsed && onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="fixed top-0 left-1/2 -translate-x-1/2 z-20 bg-red-600 text-white px-4 py-1 rounded-b-md hover:bg-red-700 transition-colors flex items-center gap-1 text-xs font-medium"
          title="Expand banner"
        >
          <ChevronDown className="w-3 h-3" />
          Demo
        </button>
      )}

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Demo Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all current tickets and customers, and restore
              the database to the default demo state with 40 realistic support
              tickets including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  20 diverse customers (enterprise, SMB, individual users)
                </li>
                <li>4 urgent tickets with frustrated customer interactions</li>
                <li>7 high-priority bugs and issues</li>
                <li>19 medium-priority tickets with varied scenarios</li>
                <li>10 low-priority feature requests and feedback</li>
                <li>Rich conversation histories with realistic sentiment</li>
              </ul>
              <p className="mt-2 font-semibold text-red-600">
                Warning: This action cannot be undone. All custom tickets will
                be permanently deleted.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetData}
              disabled={isResetting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isResetting ? "Resetting..." : "Yes, Reset Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}