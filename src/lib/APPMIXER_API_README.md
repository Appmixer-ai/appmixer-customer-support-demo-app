# Appmixer REST API Client

A comprehensive TypeScript REST API client for the Appmixer platform with full type safety and React hooks integration.

## Overview

This API client provides a complete interface to the Appmixer REST APIs, including:

- **Authentication** - User sign-in, registration, and token management
- **Flows** - Create, manage, start/stop automation flows
- **Accounts** - Manage external service integrations
- **Apps & Components** - Browse and manage available components
- **Component Interactions** - Interact with flow components
- **React Integration** - Custom hooks for React applications

## Installation

The API client is already included in your project. Import what you need:

```typescript
import { createAppmixerClient, AppmixerApiClient } from '@/lib/appmixer-api-client';
import { useAppmixerApi } from '@/hooks/use-appmixer-api';
import type { AppmixerApiConfig, Flow, Account } from '@/lib/appmixer-api-types';
```

## Quick Start

### Basic Client Setup

```typescript
import { createAppmixerClient } from '@/lib/appmixer-api-client';

const client = createAppmixerClient({
  baseUrl: 'https://api.YOUR_TENANT.appmixer.cloud',
  timeout: 30000,
});
```

### Authentication

```typescript
// Sign in with username/password
const authResponse = await client.signIn({
  username: 'your-username',
  password: 'your-password'
});

// Or sign in with email
const authResponse = await client.signIn({
  email: 'user@example.com',
  password: 'your-password'
});

// Access token is automatically stored for subsequent requests
console.log('User:', authResponse.user);
console.log('Token:', authResponse.token);
```

## API Methods

### Authentication

```typescript
// Sign in
await client.signIn({ username: 'user', password: 'pass' });

// Create new user
await client.createUser({ username: 'newuser', password: 'pass' });

// Get current user info
const user = await client.getCurrentUser();

// Token management
client.setAccessToken('jwt-token');
client.clearAccessToken();
console.log(client.isAuthenticated());
```

### Flows Management

```typescript
// Get all flows
const flows = await client.getFlows();

// Get flows with filtering
const flows = await client.getFlows({
  pattern: 'automation',
  limit: 10,
  sort: { created: -1 }
});

// Get single flow
const flow = await client.getFlow('flow-id');

// Create new flow
const newFlow = await client.createFlow({
  name: 'My Flow',
  description: 'Automation flow',
  flow: {
    components: [...],
    connections: [...]
  }
});

// Update flow
const updatedFlow = await client.updateFlow('flow-id', {
  name: 'Updated Name'
});

// Control flows
await client.startFlow('flow-id');
await client.stopFlow('flow-id');

// Clone flow
const cloned = await client.cloneFlow('flow-id', { prefix: 'Copy of ' });

// Delete flow
await client.deleteFlow('flow-id');
```

### Account Management

```typescript
// Get all accounts
const accounts = await client.getAccounts();

// Get accounts for specific service
const gmailAccounts = await client.getAccounts('gmail');

// Create auth ticket for OAuth
const ticket = await client.createAuthTicket({
  service: 'gmail',
  redirectUri: 'https://yourapp.com/callback'
});

// Create account with credentials
const account = await client.createAccount({
  service: 'custom-api',
  authType: 'apikey',
  credentials: { apiKey: 'key' }
});

// Test account
const testResult = await client.testAccount('account-id');

// Delete account
await client.deleteAccount('account-id');
```

### Apps and Components

```typescript
// Get available apps
const apps = await client.getApps();

// Get app components
const components = await client.getAppComponents('gmail');

// Get all components
const allComponents = await client.getAllComponents(true); // with manifests

// Publish custom component
const result = await client.publishComponent({ file: zipFile });

// Delete component
await client.deleteComponent('service.module.Component');
```

### Component Interactions

```typescript
// Interact with flow component
const response = await client.interactWithComponent({
  flowId: 'flow-id',
  componentId: 'component-id',
  method: 'POST',
  data: { message: 'Hello!' }
});
```

## React Hook Usage

For React applications, use the `useAppmixerApi` hook:

```typescript
import { useAppmixerApi } from '@/hooks/use-appmixer-api';

function MyComponent() {
  const {
    // Authentication
    signIn,
    signOut,
    isAuthenticated,

    // State
    auth,
    flows,
    accounts,
    isLoading,

    // Operations
    getFlows,
    createFlow,
    startFlow,
    stopFlow,
    getAccounts,
  } = useAppmixerApi({
    config: {
      baseUrl: 'https://api.YOUR_TENANT.appmixer.cloud',
    }
  });

  const handleSignIn = async () => {
    try {
      await signIn('username', 'password');
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleLoadFlows = async () => {
    try {
      await getFlows();
    } catch (error) {
      console.error('Failed to load flows:', error);
    }
  };

  return (
    <div>
      {isLoading && <div>Loading...</div>}

      {!isAuthenticated ? (
        <button onClick={handleSignIn}>Sign In</button>
      ) : (
        <>
          <button onClick={handleLoadFlows}>Load Flows</button>
          <button onClick={signOut}>Sign Out</button>

          {flows.data?.map(flow => (
            <div key={flow.id}>
              <h3>{flow.name}</h3>
              <p>Status: {flow.status}</p>
              <button onClick={() => startFlow(flow.id)}>Start</button>
              <button onClick={() => stopFlow(flow.id)}>Stop</button>
            </div>
          ))}
        </>
      )}

      {flows.error && <div>Error: {flows.error}</div>}
    </div>
  );
}
```

## Configuration Options

```typescript
interface AppmixerApiConfig {
  baseUrl: string;      // API base URL (includes tenant)
  timeout?: number;     // Request timeout (default: 30000ms)
  retries?: number;     // Retry attempts (default: 3)
  apiKey?: string;      // API key authentication
  accessToken?: string; // JWT token authentication
}
```

## Error Handling

The client provides structured error handling:

```typescript
try {
  await client.getFlows();
} catch (error: any) {
  switch (error.code) {
    case 'HTTP 401':
      console.error('Unauthorized - sign in required');
      break;
    case 'HTTP 404':
      console.error('Resource not found');
      break;
    case 'NETWORK_ERROR':
      console.error('Network connectivity issue');
      break;
    default:
      console.error('API error:', error.message);
      console.error('Details:', error.details);
  }
}
```

## TypeScript Support

The client is fully typed with comprehensive TypeScript definitions:

```typescript
import type {
  Flow,
  FlowStatus,
  Account,
  AuthType,
  Component,
  FlowsQuery,
  CreateFlowRequest,
  User,
} from '@/lib/appmixer-api-types';

// All API responses and requests are fully typed
const flow: Flow = await client.getFlow('flow-id');
const query: FlowsQuery = { limit: 10, pattern: 'automation' };
```

## Examples

See `src/lib/appmixer-api-examples.ts` for comprehensive usage examples covering:

- Authentication flows
- Flow management operations
- Account management
- Apps and components
- Component interactions
- React hook integration
- Error handling patterns
- Configuration management

## API Endpoints Covered

### Authentication
- `POST /user/auth` - Sign in user
- `POST /user` - Create user
- `GET /user` - Get user info

### Flows
- `GET /flows` - List flows
- `GET /flows/:id` - Get flow
- `GET /flows/count` - Count flows
- `POST /flows` - Create flow
- `PUT /flows/:id` - Update flow
- `DELETE /flows/:id` - Delete flow
- `POST /flows/:id/clone` - Clone flow
- `POST /flows/:id/coordinator` - Start/stop flow

### Accounts
- `GET /accounts` - List accounts
- `POST /accounts` - Create account
- `POST /accounts/:id/test` - Test account
- `DELETE /accounts/:id` - Delete account
- `POST /auth/ticket` - Create auth ticket

### Apps & Components
- `GET /apps` - List apps
- `GET /apps/components` - Get app components
- `GET /components` - List all components
- `POST /components` - Publish component
- `DELETE /components/:selector` - Delete component

### Component Interactions
- `GET|POST|PUT|DELETE /flows/:flowId/components/:componentId` - Component interactions

## Development

The API client follows these principles:

- **Type Safety** - Full TypeScript coverage
- **Error Handling** - Structured error responses
- **React Integration** - Custom hooks with state management
- **Flexibility** - Support for both direct client and hook usage
- **Performance** - Request optimization and caching
- **Developer Experience** - Comprehensive examples and documentation

## Support

For Appmixer API documentation, visit: https://docs.appmixer.com/api/

For issues with this client implementation, check the project repository or create an issue.