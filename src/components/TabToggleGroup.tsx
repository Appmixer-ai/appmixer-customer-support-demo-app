import React from "react";
import { Button } from "@/components/ui/button";

interface TabToggleGroupProps {
  activeTab: "workflows" | "logs" | "accounts" | "tasks" | "storage";
  onTabChange: (tab: "workflows" | "logs" | "accounts" | "tasks" | "storage") => void;
}

export const TabToggleGroup: React.FC<TabToggleGroupProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex items-center border rounded-lg p-1 bg-muted">
      <Button
        variant={activeTab === "workflows" ? "default" : "ghost"}
        size="sm"
        onClick={() => onTabChange("workflows")}
        className="text-sm"
      >
        Workflows
      </Button>
      <Button
        variant={activeTab === "logs" ? "default" : "ghost"}
        size="sm"
        onClick={() => onTabChange("logs")}
        className="text-sm"
      >
        Logs
      </Button>
      <Button
        variant={activeTab === "accounts" ? "default" : "ghost"}
        size="sm"
        onClick={() => onTabChange("accounts")}
        className="text-sm"
      >
        Accounts
      </Button>
      <Button
        variant={activeTab === "tasks" ? "default" : "ghost"}
        size="sm"
        onClick={() => onTabChange("tasks")}
        className="text-sm"
      >
        Tasks
      </Button>
      <Button
        variant={activeTab === "storage" ? "default" : "ghost"}
        size="sm"
        onClick={() => onTabChange("storage")}
        className="text-sm"
      >
        Storage
      </Button>
    </div>
  );
};