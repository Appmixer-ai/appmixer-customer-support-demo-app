import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, HelpCircle, Eye, Edit } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TicketPriority } from "@/types/support";
import MDEditor from "@uiw/react-md-editor";
import ReactMarkdown from "react-markdown";
import "@uiw/react-md-editor/markdown-editor.css";

interface NewTicketFormProps {
  onBack: () => void;
  onSubmit?: (ticketData: { name: string; email: string; issueSummary: string; issueDescription: string; priority: TicketPriority }) => void;
}

export function NewTicketForm({ onBack, onSubmit }: NewTicketFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    issueSummary: "",
    issueDescription: "",
    priority: "medium" as TicketPriority
  });
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name.trim() || !formData.email.trim() || !formData.issueSummary.trim() || !formData.issueDescription.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // Call onSubmit if provided to create the ticket
    if (onSubmit) {
      onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        issueSummary: formData.issueSummary.trim(),
        issueDescription: formData.issueDescription.trim(),
        priority: formData.priority
      });
    }

    console.log("Ticket submitted:", formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-gray-50 p-6 fixed inset-0 z-[200] overflow-y-auto">
      <div className="max-w-2xl mx-auto pb-8">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            New Ticket Simulation
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                className="w-full"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                className="w-full"
              />
            </div>

            {/* Issue Summary Field */}
            <div className="space-y-2">
              <Label htmlFor="issueSummary">Issue Summary</Label>
              <Input
                id="issueSummary"
                type="text"
                placeholder="Brief summary of your issue"
                value={formData.issueSummary}
                onChange={(e) => handleChange("issueSummary", e.target.value)}
                required
                className="w-full"
              />
            </div>

            {/* Priority Field */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange("priority", value)}
              >
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Low</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span>Medium</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span>High</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span>Urgent</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Issue Description Field with Markdown Support */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="issueDescription">Issue Description</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Markdown Supported
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMarkdownHelp(!showMarkdownHelp)}
                    className="h-6 w-6 p-0"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Markdown Help */}
              <Collapsible open={showMarkdownHelp} onOpenChange={setShowMarkdownHelp}>
                <CollapsibleContent className="space-y-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Markdown Formatting Help</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-blue-800">
                      <div>
                        <p className="font-medium mb-1">Text Formatting:</p>
                        <code className="bg-white px-1 rounded">**Bold**</code> → <strong>Bold</strong><br/>
                        <code className="bg-white px-1 rounded">*Italic*</code> → <em>Italic</em><br/>
                        <code className="bg-white px-1 rounded">`Code`</code> → <code>Code</code>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Lists & Links:</p>
                        <code className="bg-white px-1 rounded">- List item</code><br/>
                        <code className="bg-white px-1 rounded">1. Numbered</code><br/>
                        <code className="bg-white px-1 rounded">[Link](url)</code>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-blue-600">
                      Your description will be beautifully formatted when viewed by support agents.
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Preview/Edit Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={!previewMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode(false)}
                  className="h-7 px-3 text-xs"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant={previewMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode(true)}
                  className="h-7 px-3 text-xs"
                  disabled={!formData.issueDescription.trim()}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
              </div>

              {/* Markdown Editor/Preview */}
              {previewMode ? (
                <div className="border rounded-lg p-4 min-h-[120px] bg-gray-50">
                  {formData.issueDescription.trim() ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{formData.issueDescription}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Preview will appear here as you type...</p>
                  )}
                </div>
              ) : (
                <div data-color-mode="light">
                  <MDEditor
                    value={formData.issueDescription}
                    onChange={(value) => handleChange("issueDescription", value || '')}
                    preview="edit"
                    hideToolbar={false}
                    visibleDragBar={false}
                    height={150}
                    data-testid="issue-description-editor"
                    textareaProps={{
                      placeholder: "Describe your issue in detail using markdown formatting...",
                      required: true
                    }}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Submit Ticket
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
