// Appmixer API Client Usage Examples
// This file demonstrates how to use the AppmixerApiClient

import { createAppmixerClient } from './appmixer-api-client';
import { AppmixerApiConfig } from './appmixer-api-types';

// Example 1: Basic Configuration and Authentication
export async function basicAuthExample() {
  const config: AppmixerApiConfig = {
    baseUrl: 'https://api.YOUR_TENANT.appmixer.cloud',
    timeout: 30000,
  };

  const client = createAppmixerClient(config);

  try {
    // Sign in with username and password
    const authResponse = await client.signIn({
      username: 'your-username',
      password: 'your-password'
    });

    console.log('Authenticated user:', authResponse.user);
    console.log('Access token:', authResponse.token);

    // Or sign in with email
    const emailAuthResponse = await client.signIn({
      email: 'user@example.com',
      password: 'your-password'
    });

    // Get current user information
    const currentUser = await client.getCurrentUser();
    console.log('Current user:', currentUser);

  } catch (error) {
    console.error('Authentication failed:', error);
  }
}

// Example 2: Working with Flows
export async function flowsExample() {
  const config: AppmixerApiConfig = {
    baseUrl: 'https://api.YOUR_TENANT.appmixer.cloud',
    accessToken: 'your-jwt-token-here',
  };

  const client = createAppmixerClient(config);

  try {
    // Get all flows
    const flows = await client.getFlows();
    console.log('All flows:', flows);

    // Get flows with filters
    const filteredFlows = await client.getFlows({
      pattern: 'automation',
      limit: 10,
      offset: 0,
      sort: { created: -1 }
    });
    console.log('Filtered flows:', filteredFlows);

    // Create a new flow
    const newFlow = await client.createFlow({
      name: 'My Automation Flow',
      description: 'An example automation flow',
      flow: {
        components: [
          {
            id: 'trigger1',
            component: 'appmixer.utils.TriggerPlugin',
            label: 'Trigger',
            position: { x: 100, y: 100 }
          },
          {
            id: 'action1',
            component: 'appmixer.http.Request',
            label: 'HTTP Request',
            position: { x: 300, y: 100 }
          }
        ],
        connections: [
          {
            source: { component: 'trigger1', port: 'out' },
            target: { component: 'action1', port: 'in' }
          }
        ]
      }
    });
    console.log('Created flow:', newFlow);

    // Start the flow
    await client.startFlow(newFlow.id);
    console.log('Flow started');

    // Get flow details
    const flowDetails = await client.getFlow(newFlow.id);
    console.log('Flow details:', flowDetails);

    // Update the flow
    const updatedFlow = await client.updateFlow(newFlow.id, {
      name: 'Updated Flow Name',
      description: 'Updated description'
    });
    console.log('Updated flow:', updatedFlow);

    // Clone the flow
    const clonedFlow = await client.cloneFlow(newFlow.id, {
      prefix: 'Copy of '
    });
    console.log('Cloned flow:', clonedFlow);

    // Stop the flow
    await client.stopFlow(newFlow.id);
    console.log('Flow stopped');

  } catch (error) {
    console.error('Flow operations failed:', error);
  }
}

// Example 3: Managing Accounts
export async function accountsExample() {
  const config: AppmixerApiConfig = {
    baseUrl: 'https://api.YOUR_TENANT.appmixer.cloud',
    accessToken: 'your-jwt-token-here',
  };

  const client = createAppmixerClient(config);

  try {
    // Get all accounts
    const accounts = await client.getAccounts();
    console.log('All accounts:', accounts);

    // Get accounts for a specific service
    const gmailAccounts = await client.getAccounts('gmail');
    console.log('Gmail accounts:', gmailAccounts);

    // Create an auth ticket for OAuth flow
    const authTicket = await client.createAuthTicket({
      service: 'gmail',
      redirectUri: 'https://your-app.com/auth/callback'
    });
    console.log('Auth ticket:', authTicket);
    console.log('Redirect user to:', authTicket.authUrl);

    // Create an account with API key
    const account = await client.createAccount({
      service: 'custom-api',
      name: 'My Custom API',
      authType: 'apikey',
      credentials: {
        apiKey: 'your-api-key-here'
      }
    });
    console.log('Created account:', account);

    // Test account credentials
    const testResult = await client.testAccount(account.id);
    console.log('Account test result:', testResult);

    // Delete account
    await client.deleteAccount(account.id);
    console.log('Account deleted');

  } catch (error) {
    console.error('Account operations failed:', error);
  }
}

// Example 4: Working with Apps and Components
export async function appsAndComponentsExample() {
  const config: AppmixerApiConfig = {
    baseUrl: 'https://api.YOUR_TENANT.appmixer.cloud',
    accessToken: 'your-jwt-token-here',
  };

  const client = createAppmixerClient(config);

  try {
    // Get all available apps
    const apps = await client.getApps();
    console.log('Available apps:', apps);

    // Get components for a specific app
    const gmailComponents = await client.getAppComponents('gmail');
    console.log('Gmail components:', gmailComponents);

    // Get all components with manifest details
    const allComponents = await client.getAllComponents(true);
    console.log('All components with manifests:', allComponents);

    // Publish a custom component (requires a zipped component file)
    // const componentFile = new File([zipBuffer], 'my-component.zip');
    // const publishResult = await client.publishComponent({ file: componentFile });
    // console.log('Publish ticket:', publishResult.ticket);

    // Delete a component
    // await client.deleteComponent('my-service.my-module.MyComponent');

  } catch (error) {
    console.error('Apps and components operations failed:', error);
  }
}

// Example 5: Component Interactions
export async function componentInteractionExample() {
  const config: AppmixerApiConfig = {
    baseUrl: 'https://api.YOUR_TENANT.appmixer.cloud',
    accessToken: 'your-jwt-token-here',
  };

  const client = createAppmixerClient(config);

  try {
    // Interact with a component in a flow
    const response = await client.interactWithComponent({
      flowId: 'your-flow-id',
      componentId: 'your-component-id',
      method: 'POST',
      data: {
        message: 'Hello from API client!'
      }
    });

    console.log('Component interaction response:', response);

  } catch (error) {
    console.error('Component interaction failed:', error);
  }
}

// Example 6: React Hook Usage
export function ReactHookExample() {
  /*
  import { useAppmixerApi } from '@/hooks/use-appmixer-api';

  function MyComponent() {
    const {
      signIn,
      signOut,
      isAuthenticated,
      getFlows,
      createFlow,
      flows,
      auth,
      isLoading
    } = useAppmixerApi({
      config: {
        baseUrl: 'https://api.YOUR_TENANT.appmixer.cloud',
      }
    });

    const handleSignIn = async () => {
      try {
        await signIn('username', 'password');
        console.log('Signed in successfully');
      } catch (error) {
        console.error('Sign in failed:', error);
      }
    };

    const handleGetFlows = async () => {
      try {
        await getFlows();
        console.log('Flows loaded:', flows.data);
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
            <button onClick={handleGetFlows}>Load Flows</button>
            <button onClick={signOut}>Sign Out</button>
            <div>Welcome, {auth.data?.username}!</div>
          </>
        )}
        {flows.data && (
          <div>
            <h3>Flows:</h3>
            {flows.data.map(flow => (
              <div key={flow.id}>{flow.name} - {flow.status}</div>
            ))}
          </div>
        )}
      </div>
    );
  }
  */
  console.log('See the commented code above for React hook usage example');
}

// Example 7: Error Handling
export async function errorHandlingExample() {
  const config: AppmixerApiConfig = {
    baseUrl: 'https://api.YOUR_TENANT.appmixer.cloud',
  };

  const client = createAppmixerClient(config);

  try {
    // This will fail because we don't have an access token
    await client.getFlows();
  } catch (error: any) {
    if (error.code === 'HTTP 401') {
      console.error('Unauthorized - please sign in first');
    } else if (error.code === 'NETWORK_ERROR') {
      console.error('Network error - check your connection');
    } else {
      console.error('API error:', error.message);
      console.error('Error details:', error.details);
    }
  }
}

// Example 8: Configuration Updates
export function configurationExample() {
  const config: AppmixerApiConfig = {
    baseUrl: 'https://api.YOUR_TENANT.appmixer.cloud',
  };

  const client = createAppmixerClient(config);

  // Update configuration
  client.updateConfig({
    timeout: 60000, // Increase timeout to 60 seconds
    retries: 5,     // Increase retry attempts
  });

  // Set access token
  client.setAccessToken('new-jwt-token');

  // Check if authenticated
  console.log('Is authenticated:', client.isAuthenticated());

  // Get current configuration
  const currentConfig = client.getConfig();
  console.log('Current config:', currentConfig);

  // Clear access token
  client.clearAccessToken();
}