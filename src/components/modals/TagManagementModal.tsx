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
import { Badge } from "@/components/ui/badge";
import { X, Plus, Tag } from "lucide-react";

interface TagManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowId: string;
  flowName: string;
  currentTags: string[];
  allAvailableTags: string[]; // All tags used across all flows for suggestions
  onSaveTags: (flowId: string, tags: string[]) => Promise<void>;
}

export const TagManagementModal: React.FC<TagManagementModalProps> = ({
  isOpen,
  onClose,
  flowId,
  flowName,
  currentTags,
  allAvailableTags,
  onSaveTags,
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  // Initialize tags when modal opens
  useEffect(() => {
    if (isOpen) {
      setTags([...currentTags]);
      setNewTag("");
      setFilteredSuggestions([]);
    }
  }, [isOpen, currentTags]);

  // Filter suggestions based on input
  useEffect(() => {
    if (newTag.trim()) {
      const suggestions = allAvailableTags.filter(
        tag =>
          tag.toLowerCase().includes(newTag.toLowerCase()) &&
          !tags.includes(tag)
      );
      setFilteredSuggestions(suggestions);
    } else {
      setFilteredSuggestions([]);
    }
  }, [newTag, tags, allAvailableTags]);

  const handleAddTag = (tag?: string) => {
    const tagToAdd = (tag || newTag).trim();
    if (tagToAdd && !tags.includes(tagToAdd)) {
      setTags([...tags, tagToAdd]);
      setNewTag("");
      setFilteredSuggestions([]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveTags(flowId, tags);
      onClose();
    } catch (error) {
      console.error("Failed to save tags:", error);
      alert("Failed to save tags. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Tag className="w-6 h-6" />
            Manage Tags
          </DialogTitle>
          <DialogDescription>
            Organize "{flowName}" with tags for easier filtering and categorization
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Current Tags */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Current Tags
            </label>
            <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border rounded-md bg-muted/30">
              {tags.length === 0 ? (
                <span className="text-sm text-muted-foreground italic">
                  No tags added yet
                </span>
              ) : (
                tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-sm px-3 py-1 flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Add New Tag */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Add New Tag
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter tag name..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={() => handleAddTag()}
                disabled={!newTag.trim() || tags.includes(newTag.trim())}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {/* Tag Suggestions */}
            {filteredSuggestions.length > 0 && (
              <div className="mt-2 p-2 border rounded-md bg-background">
                <p className="text-xs text-muted-foreground mb-2">
                  Suggestions (click to add):
                </p>
                <div className="flex flex-wrap gap-2">
                  {filteredSuggestions.slice(0, 10).map((suggestion) => (
                    <Badge
                      key={suggestion}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleAddTag(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Tags"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
