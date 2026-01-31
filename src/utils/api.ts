/**
 * Centralized API Wrapper for PUpapers
 * Handles environment-specific URLs, credentials, and error normalization.
 */

// Use Next.js Rewrites to prevent CORS/Cookie issues
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

interface ApiError extends Error {
    data?: unknown;
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

    // Set default headers
    const headers = new Headers(init.headers);
    if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    init.headers = headers;

    try {
        const response = await fetch(url, init);

        // Handle Unauthorized/Not Found for session-dependent routes
        if (response.status === 401 || response.status === 404) {
            if (typeof window !== 'undefined') {
                const protectedRoutes = ['/dashboard', '/admin', '/profile', '/leaderboard', '/revision', '/pucet-mock', '/mock-tests'];
                if (protectedRoutes.some(route => window.location.pathname.startsWith(route))) {
                    console.warn('Authentication failure detected in API fetch');
                }
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || `API Error: ${response.status}`) as ApiError;
            error.data = errorData;
            throw error;
        }

        return await response.json();
    } catch (err: unknown) {
        const error = err as Error;
        console.error(`API Fetch Error [${endpoint}]:`, error);
        throw error;
    }
}
