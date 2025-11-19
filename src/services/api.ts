
import { Dream } from '../lib/db'; // Re-using the Dream type from our db schema

// The Omit type is useful for the 'add' function where the id is not yet known.
type DreamInput = Omit<Dream, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

/**
 * A helper function to create standardized request headers.
 * @param initData - The Telegram initData string for authentication.
 * @returns A Headers object.
 */
function createAuthHeaders(initData: string): Headers {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    // We'll use this custom header to pass authentication data.
    headers.append('X-Telegram-Auth', initData);
    return headers;
}

/**
 * A generic fetch wrapper to handle API responses and errors.
 * @param path - The API endpoint path.
 * @param options - The fetch options.
 * @returns The JSON response from the API.
 * @throws {Error} If the network response is not ok.
 */
async function apiFetch(path: string, options: RequestInit) {
    const response = await fetch(`/api/${path}`, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    return response.json();
}

// --- CRUD Functions for Dreams ---

export const getAllDreams = async (initData: string, params?: { limit?: number; offset?: number; search?: string; type?: string }): Promise<Dream[]> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.type) queryParams.append('type', params.type);

    const data = await apiFetch(`dreams?${queryParams.toString()}`, {
        method: 'GET',
        headers: createAuthHeaders(initData),
    });
    return data.dreams;
};

export const getDreamById = async (initData: string, id: number): Promise<Dream | undefined> => {
    const data = await apiFetch(`dreams/${id}`, {
        method: 'GET',
        headers: createAuthHeaders(initData),
    });
    return data.dream;
};

export const addDream = async (initData: string, dream: DreamInput): Promise<Dream> => {
    const data = await apiFetch('dreams', {
        method: 'POST',
        headers: createAuthHeaders(initData),
        body: JSON.stringify({ dream }),
    });
    return data.dream;
};

export const updateDream = async (initData: string, id: number, dream: Partial<DreamInput>): Promise<Dream> => {
    const data = await apiFetch(`dreams/${id}`, {
        method: 'PUT',
        headers: createAuthHeaders(initData),
        body: JSON.stringify({ dream }),
    });
    return data.dream;
};

export const deleteDream = async (initData: string, id: number): Promise<void> => {
    await apiFetch(`dreams/${id}`, {
        method: 'DELETE',
        headers: createAuthHeaders(initData),
    });
};

// --- Other Functions ---

export const getAllUniqueTags = async (initData: string): Promise<string[]> => {
    const data = await apiFetch('tags', {
        method: 'GET',
        headers: createAuthHeaders(initData),
    });
    return data.tags;
};
