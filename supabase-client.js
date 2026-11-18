window.__peppamLastApiError = '';

function getAdminToken() {
    return localStorage.getItem('peppam_admin_session') || '';
}

async function apiRequest(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const token = getAdminToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(path, {
        ...options,
        headers
    });

    let payload = null;
    try {
        payload = await response.json();
    } catch (error) {
        payload = null;
    }

    if (!response.ok) {
        throw new Error((payload && payload.error) || 'Request failed');
    }

    return payload;
}

async function fetchAllMovies() {
    try {
        const payload = await apiRequest('/api/movies', { method: 'GET' });
        window.__peppamLastApiError = '';
        return payload.movies || [];
    } catch (error) {
        window.__peppamLastApiError = error.message;
        console.error('Error fetching movies:', error.message);
        return [];
    }
}

async function fetchMovieById(id) {
    try {
        const payload = await apiRequest(`/api/movies/${encodeURIComponent(id)}`, { method: 'GET' });
        window.__peppamLastApiError = '';
        return payload.movie || null;
    } catch (error) {
        window.__peppamLastApiError = error.message;
        console.error('Error fetching movie details:', error.message);
        return null;
    }
}
async function upsertMovie(movieData) {
    try {
        const payload = await apiRequest('/api/movies', {
            method: 'POST',
            body: JSON.stringify(movieData)
        });
        return { success: true, data: payload.movie };
    } catch (error) {
        console.error('Error saving movie:', error.message);
        return { success: false, error: error.message };
    }
}

async function deleteMovie(id) {
    try {
        await apiRequest(`/api/movies/${encodeURIComponent(id)}`, {
            method: 'DELETE'
        });
        return { success: true };
    } catch (error) {
        console.error('Error deleting movie:', error.message);
        return { success: false, error: error.message };
    }
}

async function validateAdmin(username, password) {
    try {
        const payload = await apiRequest('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        return { success: true, token: payload.token || '' };
    } catch (error) {
        console.error('Login error:', error.message);
        return { success: false, error: error.message };
    }
}

async function uploadPoster(file) {
    const token = getAdminToken();
    const response = await fetch(`/api/upload-poster?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: {
            'Content-Type': file.type,
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: file
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
    }
    return data.url;
}
