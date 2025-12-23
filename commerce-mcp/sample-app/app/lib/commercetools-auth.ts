/**
 * commercetools OAuth Authentication
 *
 * This module handles OAuth 2.0 authentication for commercetools API requests.
 * It uses the Client Credentials flow to obtain access tokens.
 */

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

interface CachedToken {
  access_token: string;
  expires_at: number;
}

// In-memory token cache (for production, use Redis or similar)
let tokenCache: CachedToken | null = null;

/**
 * Get a valid OAuth access token for commercetools API
 * Uses cached token if available and not expired
 */
export async function getCommercetoolsToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && tokenCache.expires_at > Date.now()) {
    console.log('Using cached commercetools OAuth token');
    return tokenCache.access_token;
  }

  // Validate required environment variables
  const projectKey = process.env.CTP_PROJECT_KEY;
  const clientId = process.env.CTP_CLIENT_ID;
  const clientSecret = process.env.CTP_CLIENT_SECRET;
  const authUrl = process.env.CTP_AUTH_URL;
  const scopes = process.env.CTP_SCOPES;

  if (!projectKey || !clientId || !clientSecret || !authUrl) {
    throw new Error(
      'Missing required commercetools OAuth configuration. Please set CTP_PROJECT_KEY, CTP_CLIENT_ID, CTP_CLIENT_SECRET, and CTP_AUTH_URL environment variables.'
    );
  }

  console.log('Fetching new commercetools OAuth token...');

  // Prepare OAuth request
  const tokenEndpoint = `${authUrl}/oauth/token`;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: scopes || `manage_project:${projectKey}`,
  });

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OAuth token error:', errorText);
      throw new Error(`Failed to obtain OAuth token: ${response.status} ${response.statusText}`);
    }

    const tokenData: TokenResponse = await response.json();

    // Cache the token with a buffer (expire 60 seconds early)
    const expiresAt = Date.now() + (tokenData.expires_in - 60) * 1000;
    tokenCache = {
      access_token: tokenData.access_token,
      expires_at: expiresAt,
    };

    console.log('Successfully obtained commercetools OAuth token');
    return tokenData.access_token;
  } catch (error) {
    console.error('Error obtaining commercetools OAuth token:', error);
    throw error;
  }
}

/**
 * Get authorization header with Bearer token
 */
export async function getAuthorizationHeader(): Promise<Record<string, string>> {
  const token = await getCommercetoolsToken();
  return {
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Clear the cached token (useful for testing or error recovery)
 */
export function clearTokenCache(): void {
  tokenCache = null;
  console.log('commercetools OAuth token cache cleared');
}
