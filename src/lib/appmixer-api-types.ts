// Appmixer API Types

// Authentication Types
export interface AuthRequest {
  username?: string;
  email?: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  created: string;
  modified: string;
  quota: UserQuota;
}

export interface UserQuota {
  maxFlows: number;
  maxFlowOperations: number;
  maxDataRetention: number;
}

// Flow Types
export interface Flow {
  _id: string;
  flowId: string;
  name: string;
  description?: string;
  thumbnail?: string;
  stage: FlowStage;
  type: string;
  btime: string;
  mtime: string;
  userId: string;
  started: boolean;
  stopped: boolean;
  stageChangeInfo?: StageChangeInfo;
  wizard?: FlowWizard;
  flow: FlowDescriptor;
  customFields?: {
    tags?: string[];
    [key: string]: any;
  };
}

export type FlowStage = 'stopped' | 'starting' | 'running' | 'stopping' | 'error';

export interface StageChangeInfo {
  action: string;
  userId: string;
  timestamp: string;
}

export interface FlowWizard {
  fields: FlowWizardField[];
}

export interface FlowWizardField {
  label: string;
  type: string;
  tooltip?: string;
  attrs?: Record<string, any>;
}

export interface FlowDescriptor {
  [componentId: string]: FlowComponent;
}

export interface FlowComponent {
  type: string;
  x: number;
  y: number;
  source?: FlowComponentSource;
  version?: string;
  config?: FlowComponentConfig;
}

export interface FlowComponentSource {
  in?: Record<string, string[]>;
  message?: Record<string, string[]>;
}

export interface FlowComponentConfig {
  properties?: Record<string, any>;
  transform?: Record<string, any>;
}

export interface CreateFlowRequest {
  name: string;
  description?: string;
  thumbnail?: string;
  customFields?: Record<string, any>;
  flow?: FlowDescriptor;
}

export interface UpdateFlowRequest extends Partial<CreateFlowRequest> {
  forceUpdate?: boolean;
}

export interface FlowsQuery {
  filter?: Record<string, any>;
  sharedWithPermissions?: string[];
  projection?: string[];
  sort?: Record<string, 1 | -1>;
  pattern?: string;
  offset?: number;
  limit?: number;
}

export interface FlowCommand {
  command: 'start' | 'stop';
}

// Account Types
export interface Account {
  id: string;
  service: string;
  name: string;
  status: AccountStatus;
  created: string;
  modified: string;
  userId: string;
  authType: AuthType;
}

export type AccountStatus = 'valid' | 'invalid' | 'refreshing';
export type AuthType = 'oauth1' | 'oauth2' | 'apikey' | 'basic';

export interface CreateAccountRequest {
  service: string;
  name?: string;
  authType: AuthType;
  credentials: Record<string, any>;
}

export interface AuthTicketRequest {
  service: string;
  redirectUri?: string;
}

export interface AuthTicket {
  ticket: string;
  authUrl?: string;
}

// App Types
export interface App {
  name: string;
  label: string;
  category: string;
  description?: string;
  icon?: string;
  version?: string;
  private?: boolean;
}

export interface Component {
  id: string;
  service: string;
  module: string;
  name: string;
  label: string;
  description?: string;
  icon?: string;
  properties?: ComponentProperty[];
  inPorts?: ComponentPort[];
  outPorts?: ComponentPort[];
  manifest?: ComponentManifest;
}

export interface ComponentProperty {
  name: string;
  type: string;
  label?: string;
  description?: string;
  required?: boolean;
  default?: any;
  options?: any[];
}

export interface ComponentPort {
  name: string;
  type: string;
  label?: string;
  description?: string;
  schema?: Record<string, any>;
}

export interface ComponentManifest {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  properties?: ComponentProperty[];
  inPorts?: ComponentPort[];
  outPorts?: ComponentPort[];
}

export interface PublishComponentRequest {
  file: File | Buffer;
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}

// API Client Configuration
export interface AppmixerApiConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  apiKey?: string;
  accessToken?: string;
}

// Component Interaction Types
export interface ComponentInteractionRequest {
  flowId: string;
  componentId: string;
  data?: any;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export interface ComponentInteractionResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Insights Types
export interface InsightsQuery {
  from?: string; // ISO date string
  to?: string;   // ISO date string
  groupBy?: 'day' | 'hour' | 'minute';
  flowId?: string;
  componentId?: string;
  service?: string;
  accountId?: string;
}

export interface InsightsMetrics {
  timestamp: string;
  executions: number;
  errors: number;
  duration: number;
  memory: number;
  cpu: number;
}

export interface InsightsResponse {
  data: InsightsMetrics[];
  total: {
    executions: number;
    errors: number;
    duration: number;
  };
}

export interface FlowInsights {
  flowId: string;
  flowName: string;
  executions: number;
  errors: number;
  averageDuration: number;
  lastExecution?: string;
}

export interface ComponentInsights {
  componentId: string;
  componentType: string;
  executions: number;
  errors: number;
  averageDuration: number;
}

// People Task Types
export interface PeopleTask {
  _id: string;
  taskId: string;
  flowId: string;
  componentId: string;
  state: PeopleTaskState;
  title: string;
  description?: string;
  data?: any;
  assignedTo?: string;
  assignedBy?: string;
  assignedAt?: string;
  completedAt?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  attachments?: PeopleTaskAttachment[];
  comments?: PeopleTaskComment[];
  created: string;
  modified: string;
}

export type PeopleTaskState = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface PeopleTaskAttachment {
  id: string;
  filename: string;
  size: number;
  contentType: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface PeopleTaskComment {
  id: string;
  text: string;
  author: string;
  created: string;
  modified?: string;
}

export interface CreatePeopleTaskRequest {
  flowId: string;
  componentId: string;
  title: string;
  description?: string;
  data?: any;
  assignedTo?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
}

export interface UpdatePeopleTaskRequest {
  title?: string;
  description?: string;
  data?: any;
  assignedTo?: string;
  state?: PeopleTaskState;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
}

export interface PeopleTaskQuery {
  flowId?: string;
  componentId?: string;
  assignedTo?: string;
  assignedBy?: string;
  state?: PeopleTaskState;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tag?: string;
  from?: string; // ISO date string
  to?: string;   // ISO date string
  limit?: number;
  offset?: number;
  sort?: string;
}

export interface AddPeopleTaskCommentRequest {
  text: string;
}

// Telemetry Types
export interface TelemetryQuery {
  from?: string;
  to?: string;
}

export interface TelemetryResponse {
  messageCounts: {
    from: string;
    to: string;
    count: number;
    userId: string;
  };
  runningFlows: {
    userId: string;
    count: number;
  };
  activeConnectors: {
    userId: string;
    count: number;
  };
  usedApps: string[];
}