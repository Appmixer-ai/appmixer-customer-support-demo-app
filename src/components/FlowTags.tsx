import React from "react";
import { Badge } from "@/components/ui/badge";

interface FlowTagsProps {
  tags: string[];
  maxTags?: number;
}

export const FlowTags: React.FC<FlowTagsProps> = ({ tags, maxTags = 3 }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, maxTags).map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className="text-xs font-normal rounded-sm"
        >
          {tag}
        </Badge>
      ))}
      {tags.length > maxTags && (
        <Badge
          variant="outline"
          className="text-xs font-normal rounded-sm"
        >
          +{tags.length - maxTags}
        </Badge>
      )}
    </div>
  );
};
