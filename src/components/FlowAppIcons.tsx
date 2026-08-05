import React from "react";
import { Zap } from "lucide-react";
import type { App } from "@/lib/appmixer-api-types";

interface FlowAppIconsProps {
  apps: App[];
  flowId: string;
  size?: "sm" | "md";
  maxIcons?: number;
  responsive?: boolean;
}

export const FlowAppIcons: React.FC<FlowAppIconsProps> = ({
  apps,
  flowId,
  size = "md",
  maxIcons = 5,
  responsive = false,
}) => {
  const sizeClasses = {
    sm: "w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8",
    md: "w-6 h-6 sm:w-8 sm:h-8",
  };

  // Inner image size ~70% of container
  const imgSizeClasses = {
    sm: "w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5",
    md: "w-4 h-4 sm:w-5 sm:h-5",
  };

  const iconSize = sizeClasses[size];
  const imgSize = imgSizeClasses[size];
  const textSize = size === "sm" ? "text-[10px] xs:text-xs sm:text-sm" : "text-xs sm:text-sm";

  if (apps.length === 0) {
    return (
      <div className={`${iconSize} rounded-full bg-gray-100 flex items-center justify-center`}>
        <Zap className={size === "sm" ? "w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 text-gray-400" : "w-3 h-3 sm:w-4 sm:h-4 text-gray-400"} />
      </div>
    );
  }

  const displayCount = maxIcons;
  const visibleApps = apps.slice(0, displayCount);
  const remainingCount = apps.length - displayCount;

  const renderIcon = (app: App, index: number, hideClass?: string) => (
    <div
      key={`${flowId}-${app.name}-${index}`}
      className={`relative ${hideClass || ""}`}
      title={app.label || app.name}
      style={{ zIndex: index + 1 }}
    >
      {app.icon ? (
        <div className={`${iconSize} rounded-full bg-white border-2 border-white drop-shadow-md flex items-center justify-center`}>
          <img
            src={app.icon}
            alt={app.label || app.name}
            className={`${imgSize} object-contain`}
          />
        </div>
      ) : (
        <div className={`${iconSize} rounded-full bg-white flex items-center justify-center ${textSize} font-medium text-gray-600 border-2 border-white drop-shadow-md`}>
          {(app.label || app.name).charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );

  const renderOverflow = (count: number, hideClass?: string) => {
    if (count <= 0) return null;
    return (
      <div
        className={`${iconSize} rounded-full bg-white flex items-center justify-center ${textSize} font-medium text-gray-500 border-2 border-white drop-shadow-md ${hideClass || ""}`}
        style={{ zIndex: displayCount + 1 }}
      >
        +{count}
      </div>
    );
  };

  if (!responsive) {
    return (
      <div className="flex items-center -space-x-1.5 sm:-space-x-2 relative z-0">
        {visibleApps.map((app, index) => renderIcon(app, index))}
        {renderOverflow(remainingCount)}
      </div>
    );
  }

  // Responsive mode: show fewer icons based on container size using @container queries
  // The outer div is the container, inner div holds the icons
  // Breakpoints: <80px: 2 icons, 80px+: 3 icons, 120px+: 4 icons, 160px+: all icons
  return (
    <div className="@container w-full">
      <div className="flex items-center -space-x-1.5 sm:-space-x-2 relative z-0">
        {/* Always visible: first 2 icons */}
        {visibleApps.slice(0, 2).map((app, index) => renderIcon(app, index))}

        {/* Show 3rd icon at 80px+ */}
        {visibleApps[2] && renderIcon(visibleApps[2], 2, "hidden @[80px]:block")}

        {/* Show 4th icon at 120px+ */}
        {visibleApps[3] && renderIcon(visibleApps[3], 3, "hidden @[120px]:block")}

        {/* Show 5th+ icons at 160px+ */}
        {visibleApps.slice(4).map((app, index) =>
          renderIcon(app, index + 4, "hidden @[160px]:block")
        )}

        {/* Overflow indicators for different breakpoints */}
        {apps.length > 2 && (
          <>
            {/* Smallest: show +N for everything after 2 */}
            {renderOverflow(apps.length - 2, "@[80px]:hidden")}

            {/* 80px+: show +N for everything after 3 */}
            {apps.length > 3 && renderOverflow(apps.length - 3, "hidden @[80px]:flex @[120px]:hidden")}

            {/* 120px+: show +N for everything after 4 */}
            {apps.length > 4 && renderOverflow(apps.length - 4, "hidden @[120px]:flex @[160px]:hidden")}

            {/* 160px+: show +N for everything after maxIcons */}
            {remainingCount > 0 && renderOverflow(remainingCount, "hidden @[160px]:flex")}
          </>
        )}
      </div>
    </div>
  );
};
