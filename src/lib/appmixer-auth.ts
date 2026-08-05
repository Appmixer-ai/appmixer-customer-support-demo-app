import { supabase } from './supabase';

// Domain used for Appmixer virtual users
export const APPMIXER_USER_DOMAIN = 'appmixer-customer-support-demo-app.com';

// Appmixer components bundle name for service account injection
export const APPMIXER_COMPONENTS_BUNDLE = 'appmixer.yoursaas';

/**
 * Generates a random API key
 */
function generateApiKey(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Ensures the user has an API key stored in Supabase.
 * If no API key exists, generates one and stores it.
 *
 * @param userId - The Supabase user ID
 * @returns The user's API key
 */
export async function ensureUserApiKey(userId: string): Promise<string> {
  // Check if user already has an API key
  const { data: existingKey, error: fetchError } = await supabase
    .from('user_api_keys')
    .select('api_key')
    .eq('user_id', userId)
    .single();

  if (existingKey?.api_key) {
    return existingKey.api_key;
  }

  // Generate a new API key if none exists
  const apiKey = generateApiKey();

  const { error: insertError } = await supabase
    .from('user_api_keys')
    .insert({
      user_id: userId,
      api_key: apiKey,
    });

  if (insertError) {
    // Handle race condition - another request may have inserted the key
    if (insertError.code === '23505') { // Unique constraint violation
      const { data: retryKey } = await supabase
        .from('user_api_keys')
        .select('api_key')
        .eq('user_id', userId)
        .single();

      if (retryKey?.api_key) {
        return retryKey.api_key;
      }
    }
    throw new Error(`Failed to create API key: ${insertError.message}`);
  }

  return apiKey;
}

/**
 * Ensures the user has a virtual Appmixer account.
 * Creates the account if it doesn't exist.
 *
 * @param appmixer - The Appmixer SDK instance
 * @param userId - The Supabase user ID
 * @param apiKey - The user's API key (used as password)
 */
export async function ensureAppmixerVirtualUser(
  appmixer: any,
  userId: string,
  apiKey: string
): Promise<void> {
  // Appmixer username is a virtual email using the user ID
  const appmixerUsername = `${userId}@${APPMIXER_USER_DOMAIN}`;
  // Use the API key as the Appmixer virtual user password
  const appmixerToken = apiKey;

  try {
    // Try to authenticate the existing user
    const auth = await appmixer.api.authenticateUser(appmixerUsername, appmixerToken);
    appmixer.set('accessToken', auth.token);
  } catch (err: any) {
    if (err.response && err.response.status === 403) {
      // 403 can mean:
      // 1. User doesn't exist yet - try to create
      // 2. User exists but with different password - signup will also fail
      try {
        const auth = await appmixer.api.signupUser(appmixerUsername, appmixerToken);
        appmixer.set('accessToken', auth.token);
      } catch (signupErr: any) {
        // If signup also fails with 403/400, user exists with different password
        // This requires admin intervention to delete the old user
        console.error('Failed to create Appmixer virtual user:', signupErr);
        console.error('If user exists with different password, delete them from Appmixer admin panel');
        console.error(`Username: ${appmixerUsername}`);
        throw new Error(
          `Failed to authenticate/create Appmixer user. ` +
          `If this user was created with an old password, please delete them from Appmixer admin panel. ` +
          `Username: ${appmixerUsername}`
        );
      }
    } else {
      console.error('Appmixer authentication error:', err);
      throw new Error('Failed to authenticate with Appmixer');
    }
  }
}

/**
 * Ensures the user has a service account for the demo app registered with Appmixer.
 * This allows the user to use the app's connectors in workflows without re-authenticating.
 *
 * See: https://docs.appmixer.com/appmixer/tutorials/integration-templates#injecting-user-accounts
 *
 * @param appmixer - The Appmixer SDK instance
 * @param apiKey - The user's API key
 * @param baseUrl - The base URL of the demo app API
 */
export async function ensureAppmixerServiceAccount(
  appmixer: any,
  apiKey: string,
  baseUrl: string
): Promise<void> {
  // Service name format: 'appmixer:yoursaas' (colon separator, not dot)
  const serviceName = APPMIXER_COMPONENTS_BUNDLE.replace('.', ':');

  try {
    const serviceAuth = await appmixer.api.getAuth(APPMIXER_COMPONENTS_BUNDLE);

    // Check if the user has a valid account
    const hasValidAccount = serviceAuth.accounts &&
      Object.keys(serviceAuth.accounts).length > 0 &&
      serviceAuth.accounts[Object.keys(serviceAuth.accounts)[0]]?.accessTokenValid === true;

    if (!hasValidAccount) {
      // Inject the user's account into Appmixer
      // The token object must match the auth.js definition fields: apiKey and baseUrl
      await appmixer.api.createAccount(
        // Setting requestProfileInfo to false bypasses profile request from API
        // Instead, we provide the profileInfo directly
        { requestProfileInfo: false },
        {
          name: 'YourSaaS Account',
          service: serviceName,
          token: { apiKey, baseUrl },
          profileInfo: { id: 'YourSaaS', name: 'YourSaaS Account' }
        }
      );
    }
  } catch (err: any) {
    // Service account injection is optional - log but don't fail the auth flow
    console.warn('Failed to inject service account:', err.message, err);
  }
}
