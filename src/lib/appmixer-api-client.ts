import {
  AppmixerApiConfig,
  AuthRequest,
  AuthResponse,
  User,
  Flow,
  FlowsQuery,
  CreateFlowRequest,
  UpdateFlowRequest,
  FlowCommand,
  Account,
  CreateAccountRequest,
  AuthTicketRequest,
  AuthTicket,
  App,
  Component,
  PublishComponentRequest,
  ComponentInteractionRequest,
  ComponentInteractionResponse,
  PaginatedResponse,
  ApiError,
  InsightsQuery,
  InsightsResponse,
  FlowInsights,
  ComponentInsights,
  PeopleTask,
  CreatePeopleTaskRequest,
  UpdatePeopleTaskRequest,
  PeopleTaskQuery,
  AddPeopleTaskCommentRequest,
  TelemetryQuery,
  TelemetryResponse,
} from './appmixer-api-types';

export class AppmixerApiClient {
  private config: AppmixerApiConfig;
  private baseApiUrl: string;

  constructor(config: AppmixerApiConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      ...config,
    };
    this.baseApiUrl = `${config.baseUrl}`;
  }

  // Private helper methods
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseApiUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.config.accessToken) {
      headers.Authorization = `Bearer ${this.config.accessToken}`;
    } else if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          `HTTP ${response.status}`,
          errorData.message || response.statusText,
          errorData
        );
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('NETWORK_ERROR', 'Network request failed', error);
    }
  }

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          searchParams.append(key, JSON.stringify(value));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    return searchParams.toString();
  }

  // Authentication methods
  async signIn(credentials: AuthRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/user/auth', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store the token for future requests
    this.setAccessToken(response.token);

    return response;
  }

  async createUser(userDetails: AuthRequest & { username?: string }): Promise<User> {
    return this.request<User>('/user', {
      method: 'POST',
      body: JSON.stringify(userDetails),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/user');
  }

  setAccessToken(token: string): void {
    this.config.accessToken = token;
  }

  clearAccessToken(): void {
    this.config.accessToken = undefined;
  }

  // Flow methods
  async getFlows(query?: FlowsQuery): Promise<Flow[]> {
    const queryString = query ? `?${this.buildQueryString(query)}` : '';
    return this.request<Flow[]>(`/flows${queryString}`);
  }

  async getFlow(flowId: string): Promise<Flow> {
    return this.request<Flow>(`/flows/${flowId}`);
  }

  async getFlowsCount(query?: FlowsQuery): Promise<{ count: number }> {
    const queryString = query ? `?${this.buildQueryString(query)}` : '';
    return this.request<{ count: number }>(`/flows/count${queryString}`);
  }

  async createFlow(flowData: CreateFlowRequest): Promise<Flow> {
    return this.request<Flow>('/flows', {
      method: 'POST',
      body: JSON.stringify(flowData),
    });
  }

  async updateFlow(flowId: string, flowData: UpdateFlowRequest): Promise<Flow> {
    const queryString = flowData.forceUpdate ? '?forceUpdate=true' : '';
    return this.request<Flow>(`/flows/${flowId}${queryString}`, {
      method: 'PUT',
      body: JSON.stringify(flowData),
    });
  }

  async deleteFlow(flowId: string): Promise<void> {
    await this.request<void>(`/flows/${flowId}`, {
      method: 'DELETE',
    });
  }

  async cloneFlow(flowId: string, options?: { prefix?: string }): Promise<{ cloneId: string }> {
    return this.request<{ cloneId: string }>(`/flows/${flowId}/clone`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  }

  async customizeFlow(flowId: string, options?: { prefix?: string }): Promise<{ cloneId: string }> {
    const cloneOptions = {
      ...options,
      additional: {
        type: 'automation',
        sharedWith: []  // Make the customized flow private to the user who cloned it
      }
    };
    return this.request<{ cloneId: string }>(`/flows/${flowId}/clone`, {
      method: 'POST',
      body: JSON.stringify(cloneOptions),
    });
  }

  async controlFlow(flowId: string, command: FlowCommand): Promise<void> {
    await this.request<void>(`/flows/${flowId}/coordinator`, {
      method: 'POST',
      body: JSON.stringify(command),
    });
  }

  async startFlow(flowId: string): Promise<void> {
    return this.controlFlow(flowId, { command: 'start' });
  }

  async stopFlow(flowId: string): Promise<void> {
    return this.controlFlow(flowId, { command: 'stop' });
  }

  // Tag management helper methods
  async addFlowTags(flowId: string, tags: string[]): Promise<Flow> {
    // Get current flow
    const flow = await this.getFlow(flowId);
    const currentTags = flow.customFields?.tags || [];

    // Merge tags and remove duplicates
    const updatedTags = Array.from(new Set([...currentTags, ...tags]));

    // Update flow with new tags
    return this.updateFlow(flowId, {
      customFields: {
        ...flow.customFields,
        tags: updatedTags,
      },
    });
  }

  async removeFlowTags(flowId: string, tags: string[]): Promise<Flow> {
    // Get current flow
    const flow = await this.getFlow(flowId);
    const currentTags = flow.customFields?.tags || [];

    // Remove specified tags
    const updatedTags = currentTags.filter(tag => !tags.includes(tag));

    // Update flow with filtered tags
    return this.updateFlow(flowId, {
      customFields: {
        ...flow.customFields,
        tags: updatedTags,
      },
    });
  }

  async setFlowTags(flowId: string, tags: string[]): Promise<Flow> {
    // Get current flow to preserve other customFields
    const flow = await this.getFlow(flowId);

    // Remove duplicates and set tags
    const updatedTags = Array.from(new Set(tags));

    // Update flow with new tags
    return this.updateFlow(flowId, {
      customFields: {
        ...flow.customFields,
        tags: updatedTags,
      },
    });
  }

  // Component interaction methods
  async interactWithComponent(request: ComponentInteractionRequest): Promise<ComponentInteractionResponse> {
    const { flowId, componentId, data, method = 'POST' } = request;

    return this.request<ComponentInteractionResponse>(
      `/flows/${flowId}/components/${componentId}`,
      {
        method,
        body: data ? JSON.stringify(data) : undefined,
      }
    );
  }

  // Account methods
  async getAccounts(service?: string): Promise<Account[]> {
    const queryString = service ? `?service=${service}` : '';
    return this.request<Account[]>(`/accounts${queryString}`);
  }

  async createAccount(accountData: CreateAccountRequest): Promise<Account> {
    return this.request<Account>('/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  }

  async testAccount(accountId: string): Promise<{ valid: boolean; error?: string }> {
    return this.request<{ valid: boolean; error?: string }>(`/accounts/${accountId}/test`, {
      method: 'POST',
    });
  }

  async deleteAccount(accountId: string): Promise<void> {
    await this.request<void>(`/accounts/${accountId}`, {
      method: 'DELETE',
    });
  }

  async createAuthTicket(ticketData: AuthTicketRequest): Promise<AuthTicket> {
    return this.request<AuthTicket>('/auth/ticket', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  // Apps and Components methods
  async getApps(): Promise<Record<string, App>> {
    return this.request<Record<string, App>>('/apps');
  }

  async getAppComponents(appId: string): Promise<Component[]> {
    return this.request<Component[]>(`/apps/components?app=${appId}`);
  }

  async getAllComponents(includeManifest?: boolean): Promise<Component[]> {
    const queryString = includeManifest ? '?manifest=true' : '';
    return this.request<Component[]>(`/components${queryString}`);
  }

  async publishComponent(componentData: PublishComponentRequest): Promise<{ ticket: string }> {
    const formData = new FormData();
    formData.append('file', componentData.file);

    return this.request<{ ticket: string }>('/components', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it with boundary for FormData
      body: formData,
    });
  }

  async deleteComponent(selector: string): Promise<void> {
    await this.request<void>(`/components/${selector}`, {
      method: 'DELETE',
    });
  }

  // Insights methods
  async getInsights(query?: InsightsQuery): Promise<InsightsResponse> {
    const queryString = query ? `?${this.buildQueryString(query)}` : '';
    return this.request<InsightsResponse>(`/insights${queryString}`);
  }

  async getFlowInsights(flowId: string, query?: Omit<InsightsQuery, 'flowId'>): Promise<InsightsResponse> {
    const queryString = query ? `?${this.buildQueryString(query)}` : '';
    return this.request<InsightsResponse>(`/insights/flows/${flowId}${queryString}`);
  }

  async getComponentInsights(componentId: string, query?: Omit<InsightsQuery, 'componentId'>): Promise<InsightsResponse> {
    const queryString = query ? `?${this.buildQueryString(query)}` : '';
    return this.request<InsightsResponse>(`/insights/components/${componentId}${queryString}`);
  }

  async getFlowsSummary(query?: InsightsQuery): Promise<FlowInsights[]> {
    const queryString = query ? `?${this.buildQueryString(query)}` : '';
    return this.request<FlowInsights[]>(`/insights/flows${queryString}`);
  }

  async getComponentsSummary(query?: InsightsQuery): Promise<ComponentInsights[]> {
    const queryString = query ? `?${this.buildQueryString(query)}` : '';
    return this.request<ComponentInsights[]>(`/insights/components${queryString}`);
  }

  async getAccountInsights(accountId: string, query?: Omit<InsightsQuery, 'accountId'>): Promise<InsightsResponse> {
    const queryString = query ? `?${this.buildQueryString(query)}` : '';
    return this.request<InsightsResponse>(`/insights/accounts/${accountId}${queryString}`);
  }

  async getServiceInsights(service: string, query?: Omit<InsightsQuery, 'service'>): Promise<InsightsResponse> {
    const queryString = query ? `?${this.buildQueryString(query)}` : '';
    return this.request<InsightsResponse>(`/insights/services/${service}${queryString}`);
  }

  // Telemetry methods
  async getTelemetry(query?: TelemetryQuery): Promise<TelemetryResponse> {
    const queryString = query ? `?${this.buildQueryString(query)}` : '';
    return this.request<TelemetryResponse>(`/telemetry${queryString}`);
  }

  // People Task methods
  async getPeopleTasks(query?: PeopleTaskQuery): Promise<PeopleTask[]> {
    const queryString = query ? `?${this.buildQueryString(query)}` : '';
    return this.request<PeopleTask[]>(`/people-tasks${queryString}`);
  }

  async getPeopleTask(taskId: string): Promise<PeopleTask> {
    return this.request<PeopleTask>(`/people-tasks/${taskId}`);
  }

  async createPeopleTask(taskData: CreatePeopleTaskRequest): Promise<PeopleTask> {
    return this.request<PeopleTask>('/people-tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updatePeopleTask(taskId: string, taskData: UpdatePeopleTaskRequest): Promise<PeopleTask> {
    return this.request<PeopleTask>(`/people-tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deletePeopleTask(taskId: string): Promise<void> {
    await this.request<void>(`/people-tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async assignPeopleTask(taskId: string, assignedTo: string): Promise<PeopleTask> {
    return this.request<PeopleTask>(`/people-tasks/${taskId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignedTo }),
    });
  }

  async completePeopleTask(taskId: string, data?: any): Promise<PeopleTask> {
    return this.request<PeopleTask>(`/people-tasks/${taskId}/complete`, {
      method: 'POST',
      body: data ? JSON.stringify({ data }) : undefined,
    });
  }

  async cancelPeopleTask(taskId: string): Promise<PeopleTask> {
    return this.request<PeopleTask>(`/people-tasks/${taskId}/cancel`, {
      method: 'POST',
    });
  }

  async addPeopleTaskComment(taskId: string, comment: AddPeopleTaskCommentRequest): Promise<PeopleTask> {
    return this.request<PeopleTask>(`/people-tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  }

  async deletePeopleTaskComment(taskId: string, commentId: string): Promise<PeopleTask> {
    return this.request<PeopleTask>(`/people-tasks/${taskId}/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  async uploadPeopleTaskAttachment(taskId: string, file: File | Buffer, filename?: string): Promise<PeopleTask> {
    const formData = new FormData();
    formData.append('file', file);
    if (filename) {
      formData.append('filename', filename);
    }

    return this.request<PeopleTask>(`/people-tasks/${taskId}/attachments`, {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it with boundary for FormData
      body: formData,
    });
  }

  async deletePeopleTaskAttachment(taskId: string, attachmentId: string): Promise<PeopleTask> {
    return this.request<PeopleTask>(`/people-tasks/${taskId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.config.accessToken;
  }

  getConfig(): AppmixerApiConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<AppmixerApiConfig>): void {
    this.config = { ...this.config, ...config };
    this.baseApiUrl = this.config.baseUrl;
  }
}

// Custom error class for API errors
class ApiError extends Error {
  public code: string;
  public details?: any;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

// Factory function for creating configured client instances
export function createAppmixerClient(config: AppmixerApiConfig): AppmixerApiClient {
  return new AppmixerApiClient(config);
}

// Default export
export default AppmixerApiClient;