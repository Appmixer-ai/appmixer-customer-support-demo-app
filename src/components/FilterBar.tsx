import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Search, Grid, List } from "lucide-react";

interface FilterBarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  showOnlyActive: boolean;
  setShowOnlyActive: (show: boolean) => void;
  categories: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  showOnlyActive,
  setShowOnlyActive,
  categories,
}) => {
  return (
    <>
      {/* Filter Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Show only active toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-active"
              checked={showOnlyActive}
              onCheckedChange={(checked) => setShowOnlyActive(checked === true)}
            />
            <label htmlFor="show-active" className="text-sm text-muted-foreground cursor-pointer">
              Show only active
            </label>
          </div>

          {/* Category filters */}
          <div className="flex items-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeFilter === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(category)}
                className="text-sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* View controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
    </>
  );
};