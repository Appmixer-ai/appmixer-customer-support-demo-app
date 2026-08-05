import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Zap,
  X,
  Check,
} from "lucide-react";

interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  trigger: string;
  action: string;
}

interface NewWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkflow: (name: string, description: string) => void;
}

/* const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "auto-response",
    title: "Auto-Response",
    description: "Automatically respond to common questions",
    icon: <MessageSquare className="w-5 h-5 text-blue-600" />,
    iconBgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    trigger: "New ticket",
    action: "Send response",
  },
  {
    id: "escalation",
    title: "Escalation",
    description: "Escalate high priority tickets",
    icon: <Users className="w-5 h-5 text-green-600" />,
    iconBgColor: "bg-green-100",
    iconColor: "text-green-600",
    trigger: "Priority high",
    action: "Assign to manager",
  },
  {
    id: "follow-up",
    title: "Follow-up",
    description: "Send follow-up after resolution",
    icon: <Bell className="w-5 h-5 text-purple-600" />,
    iconBgColor: "bg-purple-100",
    iconColor: "text-purple-600",
    trigger: "Ticket resolved",
    action: "Send survey",
  },
  {
    id: "ai-classification",
    title: "AI Classification",
    description: "Auto-categorize incoming tickets",
    icon: <Bot className="w-5 h-5 text-orange-600" />,
    iconBgColor: "bg-orange-100",
    iconColor: "text-orange-600",
    trigger: "New ticket",
    action: "Set category",
  },
];
 */
export const NewWorkflowModal: React.FC<NewWorkflowModalProps> = ({
  isOpen,
  onClose,
  onCreateWorkflow,
}) => {
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setWorkflowName("");
      setWorkflowDescription("");
    }
  }, [isOpen]);

  const handleCreateWorkflow = () => {
    if (!workflowName.trim()) {
      alert("Please enter a workflow name");
      return;
    }
    onCreateWorkflow(workflowName, workflowDescription);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Create New Workflow
          </DialogTitle>
          <DialogDescription>
            Build an automated workflow to streamline your support processes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Workflow Basic Info */}
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Workflow Name
              </label>
              <Input
                placeholder="Enter workflow name..."
                className="w-full"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Description
              </label>
              <Input
                placeholder="Describe what this workflow does..."
                className="w-full"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Workflow Templates */}
          {/* <div>
            <h3 className="text-lg font-semibold mb-4">Choose a Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workflowTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 ${template.iconBgColor} rounded-lg flex items-center justify-center`}
                      >
                        {template.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold">{template.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <div className="px-6 pb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Trigger: {template.trigger}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>Action: {template.action}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div> */}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleCreateWorkflow} disabled={!workflowName.trim()}>
              <Check className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
