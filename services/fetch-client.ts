// Base URL for API - use environment variable if available
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://services.stage.zeropaper.online/api/zpu';

// Helper function to handle fetch errors
export const handleFetchError = (error: any) => {
  const errorMessage = error.message || 'An unexpected error occurred';
  return { success: false, message: errorMessage };
};

// Helper function to make fetch requests
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle token refresh
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${refreshToken}` },
            });

            if (refreshResponse.ok) {
              const { token: newToken } = await refreshResponse.json();
              if (localStorage.getItem('authToken')) {
                localStorage.setItem('authToken', newToken);
              } else {
                sessionStorage.setItem('authToken', newToken);
              }

              // Retry the original request with new token
              return fetchWithAuth(endpoint, options);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            throw refreshError;
          }
        }
      }
      throw new Error(await response.text());
    }

    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export { fetchWithAuth };