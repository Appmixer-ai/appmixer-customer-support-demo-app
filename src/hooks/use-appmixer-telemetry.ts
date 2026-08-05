import { useState, useCallback, useEffect } from 'react';
import { useAppmixer } from '@/contexts/AppmixerContextSimple';
import { TelemetryResponse } from '@/lib/appmixer-api-types';

interface UseAppmixerTelemetryOptions {
  from?: string;
  to?: string;
  autoFetch?: boolean;
}

interface TelemetryState {
  data: TelemetryResponse | null;
  loading: boolean;
  error: string | null;
}

function getDefaultDateRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);

  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

export function useAppmixerTelemetry(options: UseAppmixerTelemetryOptions = {}) {
  const { autoFetch = false } = options;
  const { isInitialized, appmixer } = useAppmixer();

  const [state, setState] = useState<TelemetryState>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchTelemetry = useCallback(async (customOptions?: { from?: string; to?: string }) => {
    if (!isInitialized || !appmixer) {
      setState(prev => ({ ...prev, error: 'Appmixer not initialized' }));
      return null;
    }

    const accessToken = appmixer.get('accessToken');
    if (!accessToken) {
      setState(prev => ({ ...prev, error: 'No access token available' }));
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const baseUrl = import.meta.env.VITE_APPMIXER_BASE_URL;
      if (!baseUrl) {
        throw new Error('VITE_APPMIXER_BASE_URL environment variable is not configured');
      }
      const dateRange = {
        from: customOptions?.from || options.from,
        to: customOptions?.to || options.to,
      };

      // Use default date range if not provided
      const { from, to } = dateRange.from && dateRange.to
        ? dateRange
        : getDefaultDateRange();

      const queryParams = new URLSearchParams({ from, to });
      const response = await fetch(`${baseUrl}/telemetry?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: TelemetryResponse = await response.json();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch telemetry';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return null;
    }
  }, [isInitialized, appmixer, options.from, options.to]);

  const refetch = useCallback(() => {
    return fetchTelemetry();
  }, [fetchTelemetry]);

  useEffect(() => {
    if (autoFetch && isInitialized && appmixer) {
      fetchTelemetry();
    }
  }, [autoFetch, isInitialized, appmixer, fetchTelemetry]);

  return {
    stats: state.data,
    loading: state.loading,
    error: state.error,
    fetch: fetchTelemetry,
    refetch,
    isReady: isInitialized && !!appmixer,
  };
}

export default useAppmixerTelemetry;
