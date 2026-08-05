/**
 * deploy.js — safe full-replace of our modifiers via PUT /modifiers.
 *
 * Flow:  GET /modifiers  ->  back up to backup/<ISO>.json  ->  drop our own
 * prefixed keys  ->  merge freshly built ones (+ categories)  ->  PUT.
 *
 * Built-in and third-party modifiers are preserved, so the deploy is
 * idempotent. The admin token is read from env only — it is never bundled
 * into the browser app (do NOT use a VITE_* variable for it).
 *
 * Env:
 *   APPMIXER_API_URL      API base, e.g. https://api.<tenant>.appmixer.cloud
 *                         (falls back to VITE_APPMIXER_BASE_URL from .env)
 *   APPMIXER_ADMIN_TOKEN  admin Bearer token (required, admin-only endpoint)
 */
const fs = require('fs');
const path = require('path');

const PREFIX = 'yoursaas_';
const ROOT_ENV = path.join(__dirname, '..', '..', '..', '.env');

// Tiny zero-dependency .env loader: fills only vars not already in the
// environment, so real env / CI secrets always win over the repo .env file.
function loadRootEnv() {
    if (!fs.existsSync(ROOT_ENV)) return;
    for (const line of fs.readFileSync(ROOT_ENV, 'utf8').split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        if (!(key in process.env)) process.env[key] = val;
    }
}

async function main() {
    loadRootEnv();

    const BASE_URL = (process.env.APPMIXER_API_URL || process.env.VITE_APPMIXER_BASE_URL || '').replace(/\/$/, '');
    const TOKEN = process.env.APPMIXER_ADMIN_TOKEN;

    if (!BASE_URL) throw new Error('Missing APPMIXER_API_URL (or VITE_APPMIXER_BASE_URL).');
    if (!TOKEN) throw new Error('Missing APPMIXER_ADMIN_TOKEN (admin-only endpoint).');

    const buildPath = path.join(__dirname, 'build', 'modifiers.json');
    if (!fs.existsSync(buildPath)) {
        throw new Error('build/modifiers.json not found — run `npm run build` first.');
    }
    const mine = JSON.parse(fs.readFileSync(buildPath, 'utf8'));

    // 1) Current definition.
    const getRes = await fetch(`${BASE_URL}/modifiers`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
    });
    if (!getRes.ok) {
        throw new Error(`GET /modifiers failed: ${getRes.status} ${await getRes.text()}`);
    }
    const current = await getRes.json();
    current.categories = current.categories || {};
    current.modifiers = current.modifiers || {};

    // 2) Rollback safety: snapshot before we touch anything.
    const backupDir = path.join(__dirname, 'backup');
    fs.mkdirSync(backupDir, { recursive: true });
    const backupFile = path.join(backupDir, `${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(current, null, 2));
    console.log(`Backed up current definition -> ${path.relative(process.cwd(), backupFile)}`);

    // 3) Drop previous versions of OUR modifiers, then add the fresh build.
    for (const key of Object.keys(current.modifiers)) {
        if (key.startsWith(PREFIX)) delete current.modifiers[key];
    }
    Object.assign(current.modifiers, mine);

    // 4) Merge our custom categories.
    const catPath = path.join(__dirname, 'categories.json');
    if (fs.existsSync(catPath)) {
        Object.assign(current.categories, JSON.parse(fs.readFileSync(catPath, 'utf8')));
    }

    // 5) Full-replace PUT.
    const putRes = await fetch(`${BASE_URL}/modifiers`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(current)
    });
    if (!putRes.ok) {
        throw new Error(`PUT /modifiers failed: ${putRes.status} ${await putRes.text()}`);
    }

    const mineKeys = Object.keys(mine);
    console.log(`Deployed ${mineKeys.length} modifiers (${PREFIX}*): ${mineKeys.join(', ')}`);
}

main().catch(err => {
    console.error(err.message || err);
    process.exit(1);
});
