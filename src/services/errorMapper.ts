/**
 * Error mapping utility that translates raw HTTP, network, and validation errors
 * into actionable, user-friendly instructions. Avoids generic "An error occurred".
 */

export interface ActionableError {
  title: string;
  message: string;
  actionHint?: string;
  code?: string | number;
}

export function mapHttpOrNetworkError(error: unknown, context: 'search' | 'weather'): ActionableError {
  if (!navigator.onLine) {
    return {
      title: 'Offline Mode Active',
      message: 'You are currently disconnected from the internet. Displaying previously cached meteorological data.',
      actionHint: 'Reconnect to Wi-Fi or mobile data to receive live satellite feeds.',
      code: 'OFFLINE',
    };
  }

  // Handle Response / HTTP status if attached
  if (typeof error === 'object' && error !== null) {
    const err = error as { status?: number; message?: string; name?: string; code?: string };

    if (err.status === 429) {
      return {
        title: 'Rate Limit Reached',
        message: context === 'search'
          ? 'The city search service has received too many requests in a short window.'
          : 'Weather API query quota temporarily exceeded. Switching to Open-Meteo fallback.',
        actionHint: 'Wait 5–10 seconds before typing or requesting again.',
        code: 429,
      };
    }

    if (err.status === 401 || err.status === 403) {
      return {
        title: 'API Authentication Notice',
        message: context === 'search'
          ? 'GeoDB RapidAPI key is missing or invalid. Utilizing high-resolution Open-Meteo geocoding.'
          : 'OpenWeatherMap key invalid or not yet activated (new keys require up to 2 hours). Open-Meteo fallback is handling forecasts.',
        actionHint: 'You can input custom API keys in Settings or rely on our built-in fallback.',
        code: err.status,
      };
    }

    if (err.status === 404) {
      return {
        title: 'Location Not Found',
        message: 'No meteorological station or coordinate record matches this city.',
        actionHint: 'Verify the spelling, check country code, or search for a nearby major city.',
        code: 404,
      };
    }

    if (err.name === 'AbortError' || err.message?.includes('timeout')) {
      return {
        title: 'Request Timed Out',
        message: 'The meteorological server took too long to respond.',
        actionHint: 'Check your connection latency or retry in a few seconds.',
        code: 'TIMEOUT',
      };
    }

    if (err.message && err.message.length > 0) {
      // Return specific message if provided
      return {
        title: context === 'search' ? 'Search Service Notice' : 'Weather Feed Notice',
        message: err.message,
        actionHint: 'Try refreshing or re-selecting your preferred city.',
        code: 'CUSTOM',
      };
    }
  }

  return {
    title: 'Network Communication Notice',
    message: 'Unable to synchronize with remote meteorological servers.',
    actionHint: 'Please check your connection or try again shortly.',
    code: 'UNKNOWN',
  };
}

export function validateCityInput(query: string): string | null {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return 'City name cannot be empty—enter at least 2 characters to search.';
  }
  if (trimmed.length < 2) {
    return 'Please enter at least 2 characters to begin autocomplete.';
  }
  if (trimmed.length > 100) {
    return 'Search query exceeds maximum length of 100 characters.';
  }
  // Check for invalid control characters
  for (let i = 0; i < trimmed.length; i++) {
    const code = trimmed.charCodeAt(i);
    if ((code >= 0 && code <= 31) || code === 127) {
      return 'Search query contains invalid characters.';
    }
  }
  return null;
}
