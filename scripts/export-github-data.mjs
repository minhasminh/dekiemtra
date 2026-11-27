import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const SOURCE_DB = path.join(ROOT_DIR, 'uploads', 'edutest_multitenant_db.json');
const TARGET_DIR = path.join(ROOT_DIR, 'data');
const TARGET_DB = path.join(TARGET_DIR, 'edutest_multitenant_db.json');

const SOURCE_SMART_LINK = path.join(ROOT_DIR, 'uploads', 'smart_question_link_config.json');
const TARGET_SMART_LINK = path.join(TARGET_DIR, 'smart_question_link_config.json');

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

if (!fs.existsSync(SOURCE_DB)) {
  console.error('Khong tim thay tep nguon:', SOURCE_DB);
  process.exit(1);
}

const raw = fs.readFileSync(SOURCE_DB, 'utf8');
const parsed = JSON.parse(raw);

// Loai bo hoan toan cac phien dang nhap cuc bo truoc khi dua len GitHub
delete parsed.persistedAuthSessions;

const coreSerialized = JSON.stringify(parsed);
const contentSha256 = crypto.createHash('sha256').update(coreSerialized, 'utf8').digest('hex');

const snapshot = {
  ...parsed,
  _githubSyncMeta: {
    schemaVersion: 1,
    appName: 'EDU TEST AI',
    syncedAt: new Date().toISOString(),
    syncedBy: 'EDU TEST AI Export Script',
    reason: 'GITHUB_REPO_DATA_SYNC',
    contentSha256,
  },
};

fs.writeFileSync(TARGET_DB, JSON.stringify(snapshot, null, 2), 'utf8');

if (fs.existsSync(SOURCE_SMART_LINK)) {
  const linkRaw = fs.readFileSync(SOURCE_SMART_LINK, 'utf8');
  JSON.parse(linkRaw); // xac thuc JSON hop le
  fs.writeFileSync(TARGET_SMART_LINK, linkRaw, 'utf8');
}

const usersCount = Array.isArray(parsed?.collections?.Users) ? parsed.collections.Users.length : 0;
const schoolsCount = Array.isArray(parsed?.collections?.Schools) ? parsed.collections.Schools.length : 0;
const sizeKb = Math.round(fs.statSync(TARGET_DB).size / 1024);

console.log(
  `Exported GitHub data snapshot -> data/edutest_multitenant_db.json (${sizeKb} KB, ${schoolsCount} schools, ${usersCount} accounts)`
);
