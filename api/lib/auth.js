const { createClient } = require('@supabase/supabase-js');

// Create Supabase client with service role for server-side operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Get user by their API key from the user_api_keys table
 * Also fetches user metadata (name, email) from Supabase auth
 * @param {string} apiKey - The API key to look up
 * @returns {Promise<{userId: string, userName: string} | null>} - The user info or null if not found
 */
async function getUserByApiKey(apiKey) {
  const { data, error } = await supabase
    .from('user_api_keys')
    .select('user_id')
    .eq('api_key', apiKey)
    .single();

  if (error || !data) {
    return null;
  }

  // Fetch user metadata for display name
  let userName = `User-${data.user_id.substring(0, 8)}`;
  try {
    const { data: userData } = await supabase.auth.admin.getUserById(data.user_id);
    if (userData?.user) {
      userName = userData.user.user_metadata?.full_name
        || userData.user.user_metadata?.name
        || userData.user.email
        || userName;
    }
  } catch (err) {
    // If we can't fetch user metadata, use the fallback name
    console.warn('Could not fetch user metadata:', err.message);
  }

  return { userId: data.user_id, userName };
}

/**
 * Authenticate API request using API key
 * Supports both per-user API keys (from database) and legacy demo keys (from env)
 *
 * @param {object} req - The request object
 * @returns {Promise<{userId: string, userName: string}>} - The authenticated user info
 * @throws {Error} - If authentication fails
 */
async function authenticateApiKey(req) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    const error = new Error('Missing API key');
    error.statusCode = 401;
    throw error;
  }

  // First, try to authenticate using per-user API keys from database
  const userFromDb = await getUserByApiKey(apiKey);
  if (userFromDb) {
    return userFromDb;
  }

  // Fallback to legacy demo API keys for backward compatibility
  // Configure DEMO_API_KEYS environment variable to enable demo mode
  const validDemoKeys = process.env.DEMO_API_KEYS
    ? process.env.DEMO_API_KEYS.split(',')
    : [];

  if (validDemoKeys.includes(apiKey)) {
    // For demo keys, use the X-User-Id header or default to 'demo-user'
    const userId = req.headers['x-user-id'] || 'demo-user';
    const userName = req.headers['x-user-name'] || 'Demo User';
    return { userId, userName };
  }

  const error = new Error('Invalid API key');
  error.statusCode = 401;
  throw error;
}

/**
 * Set CORS headers on the response
 * @param {object} res - The response object
 */
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Api-Key, X-User-Id, X-User-Name, Content-Type');
}

/**
 * Handle OPTIONS preflight requests
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @returns {boolean} - True if this was an OPTIONS request (handled), false otherwise
 */
function handlePreflight(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Standard error handler for API endpoints
 * @param {Error} error - The error object
 * @param {object} res - The response object
 */
function handleError(error, res) {
  console.error('API Error:', error);
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    error: error.message || 'Internal server error'
  });
}

module.exports = {
  supabase,
  authenticateApiKey,
  getUserByApiKey,
  setCorsHeaders,
  handlePreflight,
  handleError
};
