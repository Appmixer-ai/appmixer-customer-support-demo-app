import { useState, useCallback, useMemo, useRef } from 'react';
import { AppmixerApiClient, createAppmixerClient } from '@/lib/appmixer-api-client';
import {
  AppmixerApiConfig,
  Flow,
  FlowsQuery,
  CreateFlowRequest,
  UpdateFlowRequest,
  Account,
  CreateAccountRequest,
  App,
  Component,
  User,
} from '@/lib/appmixer-api-types';

interface UseAppmixerApiOptions {
  config: AppmixerApiConfig;
  autoRefreshToken?: boolean;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAppmixerApi({ config, autoRefreshToken = true }: UseAppmixerApiOptions) {
  const [client] = useState(() => createAppmixerClient(config));

  // Apps cache - 5 minutes cache duration
  const appsCache = useRef<{
    data: Record<string, App>;
    timestamp: number;
  } | null>(null);
  const APPS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Auth state
  const [authState, setAuthState] = useState<ApiState<User>>({
    data: null,
    loading: false,
    error: null,
  });

  // Flows state
  const [flowsState, setFlowsState] = useState<ApiState<Flow[]>>({
    data: null,
    loading: false,
    error: null,
  });

  // Accounts state
  const [accountsState, setAccountsState] = useState<ApiState<Account[]>>({
    data: null,
    loading: false,
    error: null,
  });

  // Apps state
  const [appsState, setAppsState] = useState<ApiState<Record<string, App>>>({
    data: null,
    loading: false,
    error: null,
  });

  // Generic API call wrapper with error handling
  const apiCall = useCallback(async <T>(
    apiFunction: () => Promise<T>,
    setState: React.Dispatch<React.SetStateAction<ApiState<T>>>,
    options?: { skipLoading?: boolean }
  ): Promise<T | null> => {
    if (!options?.skipLoading) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      const result = await apiFunction();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  // Authentication methods
  const signIn = useCallback(async (username: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const authResponse = await client.signIn({ username, password });
      setAuthState({ data: authResponse.user, loading: false, error: null });
      return authResponse;
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, [client]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const authResponse = await client.signIn({ email, password });
      setAuthState({ data: authResponse.user, loading: false, error: null });
      return authResponse;
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, [client]);

  const getCurrentUser = useCallback(async () => {
    return apiCall(
      () => client.getCurrentUser(),
      setAuthState
    );
  }, [client, apiCall]);

  const signOut = useCallback(() => {
    client.clearAccessToken();
    setAuthState({ data: null, loading: false, error: null });
    setFlowsState({ data: null, loading: false, error: null });
    setAccountsState({ data: null, loading: false, error: null });
    setAppsState({ data: null, loading: false, error: null });
    // Clear apps cache
    appsCache.current = null;
  }, [client]);

  // Flow methods
  const getFlows = useCallback(async (query?: FlowsQuery) => {
    return apiCall(
      () => client.getFlows(query),
      setFlowsState
    );
  }, [client, apiCall]);

  const getFlow = useCallback(async (flowId: string) => {
    try {
      return await client.getFlow(flowId);
    } catch (error: any) {
      throw error;
    }
  }, [client]);

  const createFlow = useCallback(async (flowData: CreateFlowRequest) => {
    const newFlow = await client.createFlow(flowData);

    // Update flows list if it exists
    if (flowsState.data) {
      setFlowsState(prev => ({
        ...prev,
        data: prev.data ? [newFlow, ...prev.data] : [newFlow]
      }));
    }

    return newFlow;
  }, [client, flowsState.data]);

  const updateFlow = useCallback(async (flowId: string, flowData: UpdateFlowRequest) => {
    const updatedFlow = await client.updateFlow(flowId, flowData);

    // Update flows list if it exists
    if (flowsState.data) {
      setFlowsState(prev => ({
        ...prev,
        data: prev.data?.map(flow =>
          flow.flowId === flowId ? updatedFlow : flow
        ) || null
      }));
    }

    return updatedFlow;
  }, [client, flowsState.data]);

  const deleteFlow = useCallback(async (flowId: string) => {
    await client.deleteFlow(flowId);

    // Update flows list if it exists
    if (flowsState.data) {
      setFlowsState(prev => ({
        ...prev,
        data: prev.data?.filter(flow => flow.flowId !== flowId) || null
      }));
    }
  }, [client, flowsState.data]);

  const cloneFlow = useCallback(async (flowId: string, options?: { prefix?: string }) => {
    const cloneResponse = await client.cloneFlow(flowId, options);

    // The API returns {cloneId: '...'}, so we need to fetch the full flow
    if (!cloneResponse.cloneId) {
      throw new Error('Clone operation did not return a cloneId');
    }

    // Fetch the complete flow object
    const clonedFlow = await client.getFlow(cloneResponse.cloneId);

    // Update flows list if it exists
    if (flowsState.data) {
      setFlowsState(prev => ({
        ...prev,
        data: prev.data ? [clonedFlow, ...prev.data] : [clonedFlow]
      }));
    }

    // Refresh flows to ensure we have the latest data from server
    setTimeout(() => {
      getFlows();
    }, 500);

    return clonedFlow;
  }, [client, flowsState.data, getFlows]);

  const customizeFlow = useCallback(async (flowId: string, options?: { prefix?: string }) => {
    const cloneResponse = await client.customizeFlow(flowId, options);

    // The API returns {cloneId: '...'}, so we need to fetch the full flow
    if (!cloneResponse.cloneId) {
      throw new Error('Clone operation did not return a cloneId');
    }

    // Fetch the complete flow object
    const customizedFlow = await client.getFlow(cloneResponse.cloneId);

    // Update flows list if it exists
    if (flowsState.data) {
      setFlowsState(prev => ({
        ...prev,
        data: prev.data ? [customizedFlow, ...prev.data] : [customizedFlow]
      }));
    }

    // Refresh flows to ensure we have the latest data from server
    setTimeout(() => {
      getFlows();
    }, 500);

    return customizedFlow;
  }, [client, flowsState.data, getFlows]);

  const startFlow = useCallback(async (flowId: string) => {
    await client.startFlow(flowId);

    // Update flow status in flows list if it exists
    if (flowsState.data) {
      setFlowsState(prev => ({
        ...prev,
        data: prev.data?.map(flow =>
          flow.flowId === flowId ? { ...flow, stage: 'starting' } : flow
        ) || null
      }));
    }

    // Refresh flows after a short delay to get the updated status
    setTimeout(() => {
      getFlows();
    }, 1000);
  }, [client, flowsState.data, getFlows]);

  const stopFlow = useCallback(async (flowId: string) => {
    await client.stopFlow(flowId);

    // Update flow status in flows list if it exists
    if (flowsState.data) {
      setFlowsState(prev => ({
        ...prev,
        data: prev.data?.map(flow =>
          flow.flowId === flowId ? { ...flow, stage: 'stopping' } : flow
        ) || null
      }));
    }

    // Refresh flows after a short delay to get the updated status
    setTimeout(() => {
      getFlows();
    }, 1000);
  }, [client, flowsState.data, getFlows]);

  // Tag management methods
  const addFlowTags = useCallback(async (flowId: string, tags: string[]) => {
    const updatedFlow = await client.addFlowTags(flowId, tags);

    // Update flows list if it exists
    if (flowsState.data) {
      setFlowsState(prev => ({
        ...prev,
        data: prev.data?.map(flow =>
          flow.flowId === flowId ? updatedFlow : flow
        ) || null
      }));
    }

    return updatedFlow;
  }, [client, flowsState.data]);

  const removeFlowTags = useCallback(async (flowId: string, tags: string[]) => {
    const updatedFlow = await client.removeFlowTags(flowId, tags);

    // Update flows list if it exists
    if (flowsState.data) {
      setFlowsState(prev => ({
        ...prev,
        data: prev.data?.map(flow =>
          flow.flowId === flowId ? updatedFlow : flow
        ) || null
      }));
    }

    return updatedFlow;
  }, [client, flowsState.data]);

  const setFlowTags = useCallback(async (flowId: string, tags: string[]) => {
    const updatedFlow = await client.setFlowTags(flowId, tags);

    // Update flows list if it exists
    if (flowsState.data) {
      setFlowsState(prev => ({
        ...prev,
        data: prev.data?.map(flow =>
          flow.flowId === flowId ? updatedFlow : flow
        ) || null
      }));
    }

    return updatedFlow;
  }, [client, flowsState.data]);

  // Account methods
  const getAccounts = useCallback(async (service?: string) => {
    return apiCall(
      () => client.getAccounts(service),
      setAccountsState
    );
  }, [client, apiCall]);

  const createAccount = useCallback(async (accountData: CreateAccountRequest) => {
    const newAccount = await client.createAccount(accountData);

    // Update accounts list if it exists
    if (accountsState.data) {
      setAccountsState(prev => ({
        ...prev,
        data: prev.data ? [newAccount, ...prev.data] : [newAccount]
      }));
    }

    return newAccount;
  }, [client, accountsState.data]);

  const deleteAccount = useCallback(async (accountId: string) => {
    await client.deleteAccount(accountId);

    // Update accounts list if it exists
    if (accountsState.data) {
      setAccountsState(prev => ({
        ...prev,
        data: prev.data?.filter(account => account.id !== accountId) || null
      }));
    }
  }, [client, accountsState.data]);

  const testAccount = useCallback(async (accountId: string) => {
    return await client.testAccount(accountId);
  }, [client]);

  // Apps methods
  const getApps = useCallback(async () => {
    const now = Date.now();

    // Check if we have valid cached data
    if (appsCache.current && (now - appsCache.current.timestamp) < APPS_CACHE_DURATION) {
      // Return cached data without making API call
      setAppsState({
        data: appsCache.current.data,
        loading: false,
        error: null
      });
      return appsCache.current.data;
    }

    // Cache miss or expired - make API call
    return apiCall(
      async () => {
        const result = await client.getApps();
        // Update cache with fresh data
        appsCache.current = {
          data: result,
          timestamp: now
        };
        return result;
      },
      setAppsState
    );
  }, [client, apiCall, APPS_CACHE_DURATION]);

  const getAppComponents = useCallback(async (appId: string) => {
    return await client.getAppComponents(appId);
  }, [client]);

  const getAllComponents = useCallback(async (includeManifest?: boolean) => {
    return await client.getAllComponents(includeManifest);
  }, [client]);

  // Cache management
  const clearAppsCache = useCallback(() => {
    appsCache.current = null;
  }, []);

  const refreshApps = useCallback(async () => {
    clearAppsCache();
    return getApps();
  }, [getApps]);

  // Memoized values
  const isAuthenticated = useMemo(() => client.isAuthenticated(), [client]);

  const isLoading = useMemo(() =>
    authState.loading || flowsState.loading || accountsState.loading || appsState.loading,
    [authState.loading, flowsState.loading, accountsState.loading, appsState.loading]
  );

  return {
    client,

    // Authentication
    signIn,
    signInWithEmail,
    getCurrentUser,
    signOut,
    isAuthenticated,

    // State
    auth: authState,
    flows: flowsState,
    accounts: accountsState,
    apps: appsState,
    isLoading,

    // Flow operations
    getFlows,
    getFlow,
    createFlow,
    updateFlow,
    deleteFlow,
    cloneFlow,
    customizeFlow,
    startFlow,
    stopFlow,

    // Tag management
    addFlowTags,
    removeFlowTags,
    setFlowTags,

    // Account operations
    getAccounts,
    createAccount,
    deleteAccount,
    testAccount,

    // App operations
    getApps,
    getAppComponents,
    getAllComponents,
    clearAppsCache,
    refreshApps,
  };
}

export default useAppmixerApi;