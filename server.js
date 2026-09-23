import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_AUCTION_PLAYERS,
  DEFAULT_DICE_RULES,
  DEFAULT_DRAFT_STATE,
  DEFAULT_FINANCES,
  DEFAULT_LEAGUE_INFO,
  DEFAULT_MARKET_STATE,
  DEFAULT_MATCHES,
  DEFAULT_PLAYERS,
  DEFAULT_RULES_CARDS,
  DEFAULT_TEAMS,
  DEFAULT_USERS,
} from "./js/data/defaultData.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 8081);
const statePath = join(root, "data", "state.json");
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const useSupabase = Boolean(supabaseUrl && supabaseServiceKey);
const sessions = new Map();
const loginAttempts = new Map();
const initialPasswords = Object.fromEntries(DEFAULT_USERS.map((user) => [
  user.username,
  process.env[`IMEX_PASSWORD_${user.username.toUpperCase()}`] || randomBytes(12).toString("base64url"),
]));
mkdirSync(join(root, "data"), { recursive: true });

const clone = (value) => JSON.parse(JSON.stringify(value));
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const hashPassword = (password, salt) => createHash("sha256").update(`${salt}:${password}`).digest("hex");
const makeUser = (user) => {
  const salt = randomBytes(16).toString("hex");
  return { ...user, passwordHash: hashPassword(initialPasswords[user.username] || "", salt), passwordSalt: salt };
};

function defaultState() {
  return {
    league: clone(DEFAULT_LEAGUE_INFO), teams: clone(DEFAULT_TEAMS), players: clone(DEFAULT_PLAYERS),
    matches: clone(DEFAULT_MATCHES), market: clone(DEFAULT_MARKET_STATE), finances: clone(DEFAULT_FINANCES),
    rulesCards: clone(DEFAULT_RULES_CARDS), diceRules: clone(DEFAULT_DICE_RULES), announcements: clone(DEFAULT_ANNOUNCEMENTS),
    auctionPlayers: clone(DEFAULT_AUCTION_PLAYERS), draft: clone(DEFAULT_DRAFT_STATE), users: DEFAULT_USERS.map(makeUser),
    notifications: [],
  };
}

function readState() {
  if (!existsSync(statePath)) return defaultState();
  try { return JSON.parse(readFileSync(statePath, "utf8")); } catch { return defaultState(); }
}

let state = readState();
async function readSupabaseState() {
  const response = await fetch(`${supabaseUrl}/rest/v1/app_state?id=eq.main&select=payload`, {
    headers: { apikey: supabaseServiceKey, Authorization: `Bearer ${supabaseServiceKey}` },
  });
  if (!response.ok) throw new Error(`Supabase GET ${response.status}`);
  const rows = await response.json();
  return rows[0]?.payload || null;
}

async function persist() {
  state.users = state.users.map(({ password, ...user }) => user);
  writeFileSync(statePath, JSON.stringify(state, null, 2), "utf8");
  if (!useSupabase) return;
  const response = await fetch(`${supabaseUrl}/rest/v1/app_state`, {
    method: "POST",
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify([{ id: "main", payload: state }]),
  });
  if (!response.ok) throw new Error(`Supabase UPSERT ${response.status}`);
}

if (useSupabase) {
  try {
    const remoteState = await readSupabaseState();
    if (remoteState) state = remoteState;
    else await persist();
  } catch (error) {
    console.error("No se pudo cargar Supabase; se usará el estado local:", error.message);
  }
}

if (!existsSync(statePath)) {
  await persist();
  console.log("Usuarios iniciales generados. Guarda estas credenciales en un lugar seguro:");
  DEFAULT_USERS.forEach((user) => console.log(`${user.role} ${user.username}: ${initialPasswords[user.username]}`));
}

function json(response, status, payload) {
  response.writeHead(status, securityHeaders({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }));
  response.end(JSON.stringify(payload));
}

function securityHeaders(headers = {}) {
  return {
    ...headers,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };
}

function publicState() {
  return { ...state, users: state.users.map(({ password, passwordHash, passwordSalt, ...user }) => user) };
}

function presidentStateIsAllowed(next, session) {
  const ownTeamId = session.teamId;
  const unchanged = ["league", "matches", "rulesCards", "diceRules", "announcements", "users"];
  if (unchanged.some((key) => key in next && !same(next[key], state[key]))) return false;

  const oldTeams = new Map(state.teams.map((team) => [team.id, team]));
  const newTeams = new Map(next.teams.map((team) => [team.id, team]));
  if (newTeams.size !== oldTeams.size || [...oldTeams].some(([id, team]) => id !== ownTeamId && !same(team, newTeams.get(id)))) return false;

  const oldPlayers = new Map(state.players.map((player) => [player.id, player]));
  const newPlayers = new Map(next.players.map((player) => [player.id, player]));
  if (newPlayers.size !== oldPlayers.size || [...oldPlayers].some(([id, player]) => player.teamId !== ownTeamId && newPlayers.get(id)?.teamId !== ownTeamId && !same(player, newPlayers.get(id)))) return false;

  const oldFinances = state.finances.filter((finance) => finance.teamId !== ownTeamId);
  const newFinances = next.finances.filter((finance) => finance.teamId !== ownTeamId);
  if (!same(oldFinances, newFinances)) return false;

  const oldTransfers = state.market.transfers.filter((transfer) => transfer.buyerTeamId !== ownTeamId && transfer.sellerTeamId !== ownTeamId);
  const newTransfers = next.market.transfers.filter((transfer) => transfer.buyerTeamId !== ownTeamId && transfer.sellerTeamId !== ownTeamId);
  if (!same(oldTransfers, newTransfers)) return false;
  const oldPicks = state.draft?.picks || [];
  const newPicks = next.draft?.picks || [];
  if (newPicks.length < oldPicks.length || newPicks.length > oldPicks.length + 1) return false;
  if (newPicks.length === oldPicks.length + 1 && newPicks.at(-1)?.teamId !== ownTeamId) return false;
  return true;
}

function authenticated(request) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  return token ? sessions.get(token) : null;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => { body += chunk; if (body.length > 2_000_000) request.destroy(); });
    request.on("end", () => { try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error("JSON inválido")); } });
    request.on("error", reject);
  });
}

function serveStatic(request, response) {
  const requested = decodeURIComponent(request.url === "/" ? "/index.html" : request.url.split("?")[0]);
  if (["/server.js", "/package.json", "/data/state.json"].includes(requested)) return json(response, 404, { error: "Not found" });
  const filePath = normalize(join(root, requested));
  if (!filePath.startsWith(root) || !existsSync(filePath)) return json(response, 404, { error: "Not found" });
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
    response.writeHead(200, securityHeaders({ "Content-Type": `${types[extname(filePath)] || "application/octet-stream"}; charset=utf-8` }));
  response.end(readFileSync(filePath));
}

const server = createServer(async (request, response) => {
  try {
    if (request.url === "/api/health") return json(response, 200, { ok: true, time: new Date().toISOString() });
    if (request.method === "POST" && request.url === "/api/auth/login") {
      const body = await readBody(request);
      const address = request.socket.remoteAddress || "unknown";
      const attempt = loginAttempts.get(address) || { count: 0, startedAt: Date.now() };
      if (Date.now() - attempt.startedAt > 15 * 60 * 1000) { attempt.count = 0; attempt.startedAt = Date.now(); }
      if (attempt.count >= 10) return json(response, 429, { error: "Demasiados intentos. Espera unos minutos." });
      const user = state.users.find((candidate) => candidate.username?.toLowerCase() === String(body.username || "").trim().toLowerCase());
      if (!user || user.role !== body.role || user.passwordHash !== hashPassword(String(body.password || "").trim(), user.passwordSalt) || (body.teamId && user.teamId !== body.teamId)) {
        attempt.count += 1;
        loginAttempts.set(address, attempt);
        return json(response, 401, { error: "Credenciales no válidas" });
      }
      loginAttempts.delete(address);
      const token = randomUUID();
      sessions.set(token, { id: user.id, role: user.role, teamId: user.teamId || null, expiresAt: Date.now() + 8 * 60 * 60 * 1000 });
      return json(response, 200, { token, user: { id: user.id, name: user.name, role: user.role, teamId: user.teamId || null, avatar: user.avatar || "👤" } });
    }
    if (request.method === "GET" && request.url === "/api/state") return json(response, 200, publicState());
    if (request.method === "PUT" && request.url === "/api/state") {
      const session = authenticated(request);
      if (!session || session.expiresAt < Date.now()) return json(response, 403, { error: "Sesión no válida" });
      const body = await readBody(request);
      if (!body || !Array.isArray(body.teams) || !Array.isArray(body.players) || !Array.isArray(body.matches)) return json(response, 400, { error: "Estado incompleto" });
      if (session.role === "PRESIDENT" && !presidentStateIsAllowed(body, session)) return json(response, 403, { error: "El presidente solo puede modificar operaciones de su equipo" });
      state = { ...state, ...body, users: state.users };
      await persist();
      return json(response, 200, publicState());
    }
    serveStatic(request, response);
  } catch (error) { json(response, 500, { error: error.message || "Server error" }); }
});

server.listen(port, "0.0.0.0", () => console.log(`Kings League IMEX: http://localhost:${port}`));
