const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper to get auth token
function getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('lingospark_token');
}

// Helper to get stored user
export function getStoredUser() {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('lingospark_user');
    if (!user || user === 'undefined') return null;
    try {
        return JSON.parse(user);
    } catch (e) {
        console.error('Error parsing stored user:', e);
        return null;
    }
}

// Save auth data
export function saveAuth(token, user) {
    if (token) localStorage.setItem('lingospark_token', token);
    if (user) {
        localStorage.setItem('lingospark_user', JSON.stringify(user));
    }
}

// Clear auth data
export function clearAuth() {
    localStorage.removeItem('lingospark_token');
    localStorage.removeItem('lingospark_user');
}

// Check if logged in
export function isLoggedIn() {
    return !!getToken();
}

// Generic API call
async function apiCall(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    const url = new URL(`${API_BASE}${endpoint}`);
    url.searchParams.append('_t', Date.now());

    const response = await fetch(url.toString(), {
        ...options,
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
}

// ─── Auth API ────────────────────────────────
export const authAPI = {
    register: (userData) => apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),

    login: (credentials) => apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),

    getMe: () => apiCall('/auth/me'),

    updateProfile: (data) => apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
    })
};

// ─── Lessons API ─────────────────────────────
export const lessonsAPI = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/lessons?${query}`);
    },

    get: (id) => apiCall(`/lessons/${id}`),

    skillsSummary: (language = 'en') => apiCall(`/lessons/skills/summary?language=${language}`)
};

// ─── Progress API ────────────────────────────
export const progressAPI = {
    save: (data) => apiCall('/progress', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    summary: () => apiCall('/progress/summary'),

    bySkill: (skill, level) => {
        const query = level ? `?level=${level}` : '';
        return apiCall(`/progress/skill/${skill}${query}`);
    }
};

// ─── Assessments API ─────────────────────────
export const assessmentsAPI = {
    check: (data) => apiCall('/assessments/check', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    levelTest: () => apiCall('/assessments/level-test', {
        method: 'POST'
    })
};

// ─── Speech Config API ───────────────────────
export const speechAPI = {
    getConfig: () => apiCall('/speech/config'),

    recognize: (audioBase64, language) => apiCall('/speech/recognize', {
        method: 'POST',
        body: JSON.stringify({ audio: audioBase64, language })
    })
};
