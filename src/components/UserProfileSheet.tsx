import { useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppmixerTelemetry } from '@/hooks/use-appmixer-telemetry';
import { Activity, Play, Plug, Package, AlertCircle, Calendar } from 'lucide-react';

interface UserProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

type TimeframeKey = '7d' | '30d' | '90d' | '6m' | '12m';

interface TimeframeOption {
  key: TimeframeKey;
  label: string;
  getDateRange: () => { from: string; to: string };
}

const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  {
    key: '7d',
    label: 'Last 7 days',
    getDateRange: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 7);
      return {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
      };
    },
  },
  {
    key: '30d',
    label: 'Last 30 days',
    getDateRange: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 30);
      return {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
      };
    },
  },
  {
    key: '90d',
    label: 'Last 90 days',
    getDateRange: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 90);
      return {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
      };
    },
  },
  {
    key: '6m',
    label: 'Last 6 months',
    getDateRange: () => {
      const to = new Date();
      const from = new Date();
      from.setMonth(from.getMonth() - 6);
      return {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
      };
    },
  },
  {
    key: '12m',
    label: 'Last 12 months',
    getDateRange: () => {
      const to = new Date();
      const from = new Date();
      from.setFullYear(from.getFullYear() - 1);
      return {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
      };
    },
  },
];

function formatAppName(appId: string): string {
  // Convert "appmixer.slack" to "Slack"
  const parts = appId.split('.');
  const name = parts[parts.length - 1];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-md">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            {loading ? (
              <Skeleton className="h-6 w-12 mt-1" />
            ) : (
              <p className="text-xl font-semibold">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function UserProfileSheet({ open, onOpenChange, user }: UserProfileSheetProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeKey>('30d');
  const { stats, loading, error, fetch, isReady } = useAppmixerTelemetry();

  const fetchWithTimeframe = useCallback((timeframeKey: TimeframeKey) => {
    const option = TIMEFRAME_OPTIONS.find(opt => opt.key === timeframeKey);
    if (!option) return;

    const dateRange = option.getDateRange();
    fetch({ from: dateRange.from, to: dateRange.to });
  }, [fetch]);

  useEffect(() => {
    if (open && isReady && !loading) {
      fetchWithTimeframe(selectedTimeframe);
    }
  }, [open, isReady]);

  const handleTimeframeChange = (value: TimeframeKey) => {
    setSelectedTimeframe(value);
    if (isReady) {
      fetchWithTimeframe(value);
    }
  };

  const getSelectedLabel = () => {
    return TIMEFRAME_OPTIONS.find(opt => opt.key === selectedTimeframe)?.label || 'Last 30 days';
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    if (user.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user.user_metadata?.name) return user.user_metadata.name;
    if (user.email) {
      const namePart = user.email.split('@')[0];
      return namePart
        .split(/[._-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }
    return 'User';
  };

  const getUserEmail = () => {
    return user?.email || 'user@company.com';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>Profile</SheetTitle>
          <SheetDescription>Your account information and usage statistics</SheetDescription>
        </SheetHeader>

        {/* User Info Header */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg mb-6">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{getUserDisplayName()}</h3>
            <p className="text-sm text-muted-foreground truncate" title={getUserEmail()}>
              {getUserEmail()}
            </p>
          </div>
        </div>

        {/* Appmixer Stats Section */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Appmixer Usage
              </h4>
              <Select value={selectedTimeframe} onValueChange={handleTimeframeChange}>
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <Calendar className="h-3 w-3 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  {TIMEFRAME_OPTIONS.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error ? (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm">Failed to load stats: {error}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={Activity}
                  label="Messages"
                  value={stats?.messageCounts?.count ?? 0}
                  loading={loading}
                />
                <StatCard
                  icon={Play}
                  label="Running Flows"
                  value={stats?.runningFlows?.count ?? 0}
                  loading={loading}
                />
                <StatCard
                  icon={Plug}
                  label="Components in use"
                  value={stats?.activeConnectors?.count ?? 0}
                  loading={loading}
                />
                <StatCard
                  icon={Package}
                  label="Apps Used"
                  value={stats?.usedApps?.length ?? 0}
                  loading={loading}
                />
              </div>
            )}
          </div>

          {/* Used Apps List */}
          {stats?.usedApps && stats.usedApps.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Active Apps</h4>
              <Card>
                <CardContent className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {stats.usedApps.map((app) => (
                      <span
                        key={app}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground"
                      >
                        {formatAppName(app)}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Loading skeleton for apps list */}
          {loading && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Active Apps</h4>
              <Card>
                <CardContent className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-14" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default UserProfileSheet;
