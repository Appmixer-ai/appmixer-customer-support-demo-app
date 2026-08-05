import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Ticket,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  MessageSquare,
  Calendar,
  Bell,
  Search,
  Zap,
  Puzzle,
  Bot,
  Edit,
  Building,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { UserProfileSheet } from "@/components/UserProfileSheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoMode } from "@/contexts/DemoModeContext";
import packageJson from "../../package.json";

interface AppSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  isEndUserView?: boolean;
  isTransitioning?: boolean;
  isHighlightingAppmixer?: boolean;
  onLogout?: () => void;
  ticketCount?: number;
  isBannerCollapsed?: boolean;
}

export function AppSidebar({
  activeTab = "tickets",
  onTabChange,
  isEndUserView = false,
  isTransitioning = false,
  isHighlightingAppmixer = false,
  onLogout,
  ticketCount = 0,
  isBannerCollapsed = false,
}: AppSidebarProps) {
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  console.log("AppSidebar isHighlightingAppmixer:", isHighlightingAppmixer);

  // Helper functions to get user display information
  const getUserDisplayName = () => {
    if (!user) return isEndUserView ? "Customer John" : "John Doe";
    
    // Try to get name from user metadata or email
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
    if (fullName) return fullName;
    
    // Fallback to email username
    if (user.email) {
      const emailUsername = user.email.split('@')[0];
      return emailUsername.split('.').map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join(' ');
    }
    
    return isEndUserView ? "Customer" : "User";
  };

  const getUserEmail = () => {
    if (!user) return "john.doe@company.com";
    return user.email || "user@company.com";
  };

  const getUserInitials = () => {
    if (!user) return "JD";
    
    const displayName = getUserDisplayName();
    return displayName.split(' ').map(name => name.charAt(0).toUpperCase()).join('').slice(0, 2);
  };

  const aiAssistantsItems = [
    {
      id: "automation-hub-new",
      title: "Automation Hub",
      icon: Zap,
      isActive: activeTab === "automation-hub-new",
      disabled: false,
    },
    {
      id: "automation-hub",
      title: "Automation Hub Custom",
      icon: Bot,
      isActive: activeTab === "automation-hub",
      disabled: false,
    },
  ];

  const helpdeskItems = isDemoMode ? [
    {
      id: "tickets",
      title: "All Tickets",
      icon: Ticket,
      badge: ticketCount.toString(),
      isActive: activeTab === "tickets",
      disabled: false,
    },
    {
      id: "customers",
      title: "Customers",
      icon: Users,
      isActive: activeTab === "customers",
      disabled: true,
    },
    {
      id: "analytics",
      title: "Analytics",
      icon: BarChart3,
      isActive: activeTab === "analytics",
      disabled: true,
    },
  ] : [
    {
      id: "tickets",
      title: "All Tickets",
      icon: Ticket,
      badge: ticketCount.toString(),
      isActive: activeTab === "tickets",
      disabled: false,
    },
    {
      id: "customers",
      title: "Customers",
      icon: Users,
      isActive: activeTab === "customers",
      disabled: true,
    },
    {
      id: "conversations",
      title: "Conversations",
      icon: MessageSquare,
      isActive: activeTab === "conversations",
      disabled: true,
    },
    {
      id: "calendar",
      title: "Calendar",
      icon: Calendar,
      isActive: activeTab === "calendar",
      disabled: true,
    },
    {
      id: "analytics",
      title: "Analytics",
      icon: BarChart3,
      isActive: activeTab === "analytics",
      disabled: true,
    },
  ];

  const supportItems = [
    {
      id: "help",
      title: "Help Center",
      icon: HelpCircle,
      badge: undefined,
      isActive: activeTab === "help",
      disabled: true,
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: Bell,
      badge: undefined,
      isActive: activeTab === "notifications",
      disabled: true,
    },
    {
      id: "settings",
      title: "Settings",
      icon: Settings,
      badge: undefined,
      isActive: activeTab === "settings",
      disabled: true,
    },
  ];

  // End user simplified navigation


  const endUserSupportItems = [
    {
      id: "help",
      title: "Help Center",
      icon: HelpCircle,
      isActive: activeTab === "help",
      disabled: false,
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: Bell,
      badge: "5",
      isActive: activeTab === "notifications",
      disabled: false,
    },
    {
      id: "settings",
      title: "Settings",
      icon: Settings,
      isActive: activeTab === "settings",
      disabled: false,
    },
  ];

  const handleItemClick = (itemId: string, disabled: boolean) => {
    if (!disabled) {
      onTabChange?.(itemId);
    }
  };

  return (
    <Sidebar collapsible="icon" className={isBannerCollapsed ? "pt-0" : "pt-[60px]"} style={{ transition: "padding-top 300ms" }}>
      <SidebarHeader
        className={`border-b border-sidebar-border h-16 flex justify-center ${isHighlightingAppmixer ? "highlight-dimmed" : "highlight-normal"}`}
      >
        <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            {!isDemoMode && (
              <>
                <div className="flex gap-2 items-baseline">
                  <h2 className="text-sm font-semibold">Your SaaS</h2>
                  <span className="text-[10px] text-muted-foreground/60 font-normal">
                    v{packageJson.version}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Customer Support
                </p>
              </>
            )}
            {isDemoMode && (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">Your SaaS</h2>
                  
                </div>
              </>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {isTransitioning ? (
          // Skeleton loading during transition
          <>
            <SidebarGroup>
              <div className="p-2">
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="space-y-1">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-md"
                    >
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 flex-1" />
                      {i === 1 && <Skeleton className="h-4 w-6 rounded-full" />}
                    </div>
                  ))}
                </div>
              </div>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup>
              <div className="p-2">
                <Skeleton className="h-4 w-20 mb-3" />
                <div className="space-y-1">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-md"
                    >
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup>
              <div className="p-2">
                <Skeleton className="h-4 w-16 mb-3" />
                <div className="space-y-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-md"
                    >
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 flex-1" />
                      {i === 0 && <Skeleton className="h-4 w-6 rounded-full" />}
                      {i === 1 && <Skeleton className="h-4 w-4 rounded-full" />}
                    </div>
                  ))}
                </div>
              </div>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup>
              <div className="p-2">
                <Skeleton className="h-4 w-14 mb-3" />
                <div className="space-y-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-md"
                    >
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 flex-1" />
                      {i === 1 && (
                        <Skeleton className="h-4 w-4 rounded-full bg-red-200" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </SidebarGroup>
          </>
        ) : isEndUserView ? (
          // End User View - Simplified Navigation
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Support</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {endUserSupportItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={item.isActive}
                        onClick={() => handleItemClick(item.id, item.disabled)}
                        tooltip={item.title}
                        className={item.disabled ? "cursor-not-allowed" : ""}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant="destructive"
                            className="ml-auto text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : (
          // Admin View - Full Navigation
          <>
            <SidebarGroup
              className={
                isHighlightingAppmixer ? "highlight-dimmed" : "highlight-normal"
              }
            >
              <SidebarGroupLabel>Helpdesk</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {helpdeskItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={item.isActive}
                        onClick={() => handleItemClick(item.id, item.disabled)}
                        tooltip={item.title}
                        className={item.disabled ? "cursor-not-allowed" : ""}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="ml-auto text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup className="highlight-normal">
              <SidebarGroupLabel>Automation Hub</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu
                  style={
                    isHighlightingAppmixer
                      ? {
                          border: "1px dashed red",
                          borderRadius: "8px",
                        }
                      : {}
                  }
                >
                  {aiAssistantsItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={item.isActive}
                        onClick={() => handleItemClick(item.id, item.disabled)}
                        tooltip={item.title}
                        className={item.disabled ? "cursor-not-allowed" : ""}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {!isDemoMode && (
              <>
                <SidebarSeparator />

                <SidebarGroup
                  className={`transition-opacity ${isHighlightingAppmixer ? "opacity-50" : ""}`}
                >
                  <SidebarGroupLabel>Support</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {supportItems.map((item) => (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            isActive={item.isActive}
                            onClick={() =>
                              handleItemClick(item.id, item.disabled)
                            }
                            tooltip={item.title}
                            className={
                              item.disabled ? "cursor-not-allowed" : ""
                            }
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                            {item.badge && (
                              <Badge
                                variant="destructive"
                                className="ml-auto text-xs"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </>
            )}
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {getUserDisplayName()}
                </span>
                {!isDemoMode && (
                  <span className="truncate text-xs">
                    {isEndUserView ? "end-user" : "Support agent"}
                  </span>
                )}
              </div>
              <ChevronRight className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 max-w-80 rounded-lg"
            align="start"
            side="top"
          >
            {isDemoMode ? (
              /* Simplified demo mode dropdown - only logout */
              <div className="p-1">
                <DropdownMenuItem
                  className="flex items-center gap-2 px-2 py-2 h-8 cursor-pointer"
                  onClick={() => onLogout?.()}
                >
                  <LogOut className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Logout</span>
                </DropdownMenuItem>
              </div>
            ) : (
              <>
                {/* User Profile Header */}
                <div className="flex items-center gap-3 p-4 border-b">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gray-200 text-gray-700 text-lg">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base truncate">
                        {getUserDisplayName()}
                      </h3>
                    </div>
                    <p
                      className="text-xs text-muted-foreground truncate"
                      title={getUserEmail()}
                    >
                      {getUserEmail()}
                    </p>
                  </div>
                </div>

                {/* Organization Section */}
                <div className="px-4 py-3 border-b">
                  <DropdownMenuLabel className="text-sm font-medium text-muted-foreground mb-2">
                    Organization
                  </DropdownMenuLabel>
                  <div className="flex items-center gap-3 min-w-0">
                    <Building className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium truncate">
                      Your SaaS
                    </span>
                  </div>
                </div>

                {/* View Profile & Logout */}
                <div className="p-1">
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-2 py-2 h-8 cursor-pointer"
                    onClick={() => setProfileSheetOpen(true)}
                  >
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">View Profile</span>
                  </DropdownMenuItem>
                </div>

                {/* Logout */}
                <div className="p-1 border-t">
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-2 py-2 h-8 cursor-pointer"
                    onClick={() => onLogout?.()}
                  >
                    <LogOut className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Logout</span>
                  </DropdownMenuItem>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      {/* User Profile Sheet */}
      <UserProfileSheet
        open={profileSheetOpen}
        onOpenChange={setProfileSheetOpen}
        user={user}
      />
    </Sidebar>
  );
}
