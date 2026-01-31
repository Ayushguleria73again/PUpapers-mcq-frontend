/**
 * Centralized API Wrapper for PUpapers
 * Handles environment-specific URLs, credentials, and error normalization.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options;

    // Construct URL
    let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    if (params) {
        const query = new URLSearchParams(params).toString();
        url += `?${query}`;
    }

    // Set default credentials
    if (init.credentials === undefined) {
        init.credentials = 'include';
    }

    try {
        const response = await fetch(url, init);

        // Handle Unauthorized/Not Found for session-dependent routes
        if (response.status === 401 || response.status === 404) {
            if (typeof window !== 'undefined') {
                const protectedRoutes = ['/dashboard', '/profile'];
                if (protectedRoutes.some(route => window.location.pathname.startsWith(route))) {
                    // We let AuthContext handle the redirect if it's monitoring state,
                    // but we can also trigger a formal redirect here if needed.
                    console.warn('Authentication failure detected in API fetch');
                }
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Fetch Error [${endpoint}]:`, error);
        throw error;
    }
}
