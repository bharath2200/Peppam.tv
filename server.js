const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const ROOT = __dirname;
const ENV_PATH = path.join(ROOT, '.env');

if (fs.existsSync(ENV_PATH)) {
    const envLines = fs.readFileSync(ENV_PATH, 'utf8').split(/\r?\n/);
    for (const line of envLines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const separatorIndex = trimmed.indexOf('=');
        if (separatorIndex === -1) continue;

        const key = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed.slice(separatorIndex + 1).trim();

        if (key && process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}

const PORT = Number(process.env.PORT || 3000);
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const APP_SECRET = process.env.APP_SECRET || '';
const MIME_TYPES = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, text) {
    res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(text);
}

function readBody(req, asBuffer = false) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let length = 0;
        req.on('data', (chunk) => {
            chunks.push(chunk);
            length += chunk.length;
            if (length > 10_000_000) {
                reject(new Error('Request body too large'));
                req.destroy();
            }
        });
        req.on('end', () => {
            const buffer = Buffer.concat(chunks);
            resolve(asBuffer ? buffer : buffer.toString('utf8'));
        });
        req.on('error', reject);
    });
}

function base64UrlEncode(value) {
    return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value) {
    return Buffer.from(value, 'base64url').toString('utf8');
}

function signAdminToken(username) {
    const payload = JSON.stringify({
        username,
        exp: Date.now() + (12 * 60 * 60 * 1000)
    });
    const encodedPayload = base64UrlEncode(payload);
    const signature = crypto
        .createHmac('sha256', APP_SECRET)
        .update(encodedPayload)
        .digest('base64url');

    return `${encodedPayload}.${signature}`;
}
function verifyAdminToken(token) {
    if (!token || !APP_SECRET) return false;

    const [encodedPayload, providedSignature] = token.split('.');
    if (!encodedPayload || !providedSignature) return false;

    const expectedSignature = crypto
        .createHmac('sha256', APP_SECRET)
        .update(encodedPayload)
        .digest('base64url');

    const providedBuffer = Buffer.from(providedSignature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (providedBuffer.length !== expectedBuffer.length) {
        return false;
    }

    if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
        return false;
    }

    try {
        const payload = JSON.parse(base64UrlDecode(encodedPayload));
        return payload.exp > Date.now();
    } catch (error) {
        return false;
    }
}
function requireAdmin(req, res) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!verifyAdminToken(token)) {
        sendJson(res, 401, { error: 'Unauthorized' });
        return false;
    }

    return true;
}

function ensureConfig(res) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ADMIN_USERNAME || !ADMIN_PASSWORD || !APP_SECRET) {
        sendJson(res, 500, {
            error: 'Server configuration is incomplete. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_USERNAME, ADMIN_PASSWORD, and APP_SECRET.'
        });
        return false;
    }

    return true;
}

async function supabaseRequest(endpoint, options = {}) {
    const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
        ...options,
        headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            ...(options.headers || {})
        }
    });
    const text = await response.text();
    let payload = null;

    try {
        payload = text ? JSON.parse(text) : null;
    } catch (error) {
        payload = text;
    }

    if (!response.ok) {
        const message = payload && payload.message ? payload.message : 'Supabase request failed';
        throw new Error(message);
    }

    return payload;
}

async function handleApi(req, res, url) {
    if (!ensureConfig(res)) return;

    if (req.method === 'POST' && url.pathname === '/api/admin/login') {
        const bodyText = await readBody(req);
        const body = bodyText ? JSON.parse(bodyText) : {};

        if (body.username === ADMIN_USERNAME && body.password === ADMIN_PASSWORD) {
            sendJson(res, 200, { token: signAdminToken(body.username) });
            return;
        }

        sendJson(res, 401, { error: 'Invalid username or password' });
        return;
    }
    if (req.method === 'GET' && url.pathname === '/api/movies') {
        const movies = await supabaseRequest('/rest/v1/movies?select=*&order=created_at.desc');
        sendJson(res, 200, { movies });
        return;
    }

    if (req.method === 'GET' && url.pathname.startsWith('/api/movies/')) {
        const movieId = decodeURIComponent(url.pathname.replace('/api/movies/', ''));
        const movie = await supabaseRequest(`/rest/v1/movies?select=*&id=eq.${encodeURIComponent(movieId)}`);
        sendJson(res, 200, { movie: movie[0] || null });
        return;
    }

    if (req.method === 'POST' && url.pathname === '/api/movies') {
        if (!requireAdmin(req, res)) return;

        const bodyText = await readBody(req);
        const movieData = bodyText ? JSON.parse(bodyText) : {};
        const movie = await supabaseRequest('/rest/v1/movies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Prefer: 'resolution=merge-duplicates,return=representation'
            },
            body: JSON.stringify([movieData])
        });

        sendJson(res, 200, { movie: movie[0] || null });
        return;
    }
    if (req.method === 'DELETE' && url.pathname.startsWith('/api/movies/')) {
        if (!requireAdmin(req, res)) return;

        const movieId = decodeURIComponent(url.pathname.replace('/api/movies/', ''));
        await supabaseRequest(`/rest/v1/movies?id=eq.${encodeURIComponent(movieId)}`, {
            method: 'DELETE',
            headers: {
                Prefer: 'return=minimal'
            }
        });

        sendJson(res, 200, { success: true });
        return;
    }

    if (req.method === 'POST' && url.pathname === '/api/upload-poster') {
        if (!requireAdmin(req, res)) return;

        const filename = url.searchParams.get('filename') || `poster_${Date.now()}.jpg`;
        const contentType = req.headers['content-type'] || 'application/octet-stream';
        const bodyBuffer = await readBody(req, true);

        const bucketName = 'posters';
        const objectPath = `${bucketName}/${Date.now()}_${encodeURIComponent(filename)}`;

        const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${objectPath}`, {
            method: 'POST',
            headers: {
                apikey: SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': contentType
            },
            body: bodyBuffer
        });
        if (!response.ok) {
            const errorText = await response.text();
            sendJson(res, response.status, { error: 'Upload failed: ' + errorText });
            return;
        }

        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${objectPath}`;
        sendJson(res, 200, { url: publicUrl });
        return;
    }

    sendJson(res, 404, { error: 'Not found' });
}

function resolveFilePath(urlPathname) {
    let requestPath = decodeURIComponent(urlPathname);
    if (requestPath === '/') {
        requestPath = '/index.html';
    }

    let candidate = path.join(ROOT, requestPath);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
    }

    if (!path.extname(requestPath)) {
        candidate = path.join(ROOT, `${requestPath}.html`);
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            return candidate;
        }

        return path.join(ROOT, 'movie-detail.html');
    }

    return null;
}

function serveStatic(req, res, url) {
    const filePath = resolveFilePath(url.pathname);
    if (!filePath || !filePath.startsWith(ROOT)) {
        sendText(res, 404, 'Not found');
        return;
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            sendText(res, 500, 'Failed to load file');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
            'Content-Type': MIME_TYPES[ext] || 'application/octet-stream'
        });
        res.end(data);
    });
}

const server = http.createServer(async (req, res) => {
    try {
        const url = new URL(req.url, `http://${req.headers.host}`);

        if (url.pathname.startsWith('/api/')) {
            await handleApi(req, res, url);
            return;
        }

        serveStatic(req, res, url);
    } catch (error) {
        console.error(error);
        sendJson(res, 500, { error: error.message || 'Internal server error' });
    }
});

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Peppam server running at http://localhost:${PORT}`);
    });
} else {
    module.exports = server;
}