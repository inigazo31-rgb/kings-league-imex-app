// ============================================================================
// KINGS LEAGUE IMEX - CENTRAL STATE MANAGER (STORE)
// ============================================================================

import {
  DEFAULT_LEAGUE_INFO,
  DEFAULT_TEAMS,
  DEFAULT_PLAYERS,
  DEFAULT_MATCHES,
  DEFAULT_MARKET_STATE,
  DEFAULT_FINANCES,
  DEFAULT_RULES_CARDS,
  DEFAULT_DICE_RULES,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_AUCTION_PLAYERS,
  DEFAULT_DRAFT_STATE,
  DEFAULT_USERS,
} from "../data/defaultData.js";

import { supabase } from "../supabase.js";
import { safeInteger, sanitizeColor, sanitizePosition, sanitizeText, sanitizeUrl } from "../utils/sanitize.js";

const STORAGE_KEY = "KINGS_LEAGUE_IMEX_STATE_V1";

class Store {
  constructor() {
    this.subscribers = [];
    this.apiToken = sessionStorage.getItem("KINGS_LEAGUE_IMEX_TOKEN") || "";
    this.apiEnabled = typeof window !== "undefined" && /^https?:$/.test(window.location.protocol);
    this.loadState();
    if (this.apiEnabled) this.hydrateFromServer();
  }

  safeReadStorage() {
    try {
      if (typeof localStorage === "undefined") return null;
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.warn("No se pudo leer localStorage; se usará estado base:", error);
      return null;
    }
  }

  safeWriteStorage(value) {
    try {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      console.warn("No se pudo guardar en localStorage:", error);
    }
  }

async hydrateFromServer() {
  try {
    const { data, error } = await supabase
      .from("app_state")
      .select("payload")
      .eq("id", "main")
      .maybeSingle();

    if (error) {
      console.warn("Supabase no disponible:", error);
      return;
    }

    if (!data?.payload) {
      console.log("No existe estado remoto todavía.");
      return;
    }

    const remote = data.payload;

    this.league = remote.league || this.league;
    this.teams = Array.isArray(remote.teams) ? remote.teams : this.teams;
    this.players = Array.isArray(remote.players) ? remote.players : this.players;
    this.matches = Array.isArray(remote.matches) ? remote.matches : this.matches;
    this.market = remote.market || this.market;
    this.finances = Array.isArray(remote.finances)
      ? remote.finances
      : this.finances;

    this.rulesCards = Array.isArray(remote.rulesCards)
      ? remote.rulesCards
      : this.rulesCards;

    this.diceRules = Array.isArray(remote.diceRules)
      ? remote.diceRules
      : this.diceRules;

    this.announcements = Array.isArray(remote.announcements)
      ? remote.announcements
      : this.announcements;

    this.auctionPlayers = Array.isArray(remote.auctionPlayers)
      ? remote.auctionPlayers
      : this.auctionPlayers;

    this.draft = remote.draft || this.draft;

    this.notifications = Array.isArray(remote.notifications)
      ? remote.notifications
      : this.notifications;

    this.users = this.mergeDefaultUsers(remote.users);

    this.recalculateAllSquadValues();
    this.normalizeCompetitionState();

    this.notify();

    console.log("Estado cargado desde Supabase.");
  } catch (error) {
    console.warn("Error cargando Supabase:", error);
  }
}

 async syncToServer() {
  try {
    const payload = {
      league: this.league,
      teams: this.teams,
      players: this.players,
      matches: this.matches,
      market: this.market,
      finances: this.finances,
      rulesCards: this.rulesCards,
      diceRules: this.diceRules,
      announcements: this.announcements,
      auctionPlayers: this.auctionPlayers,
      draft: this.draft,
      users: this.users,
      notifications: this.notifications,
    };

    const { error } = await supabase
      .from("app_state")
      .upsert(
        {
          id: "main",
          payload,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

    if (error) {
      console.error("Error sincronizando con Supabase:", error);
      return;
    }

    console.log("Estado sincronizado con Supabase.");
  } catch (error) {
    console.error("No se pudo sincronizar con Supabase:", error);
  }
}

  refreshSharedState() {
    const saved = this.safeReadStorage();
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      const currentUser = this.currentUser;
      this.league = parsed.league || this.league;
      this.teams = Array.isArray(parsed.teams) ? parsed.teams : this.teams;
      this.players = Array.isArray(parsed.players) ? parsed.players : this.players;
      this.matches = Array.isArray(parsed.matches) ? parsed.matches : this.matches;
      this.market = parsed.market || this.market;
      this.finances = Array.isArray(parsed.finances) ? parsed.finances : this.finances;
      this.draft = parsed.draft || this.draft;
      this.notifications = Array.isArray(parsed.notifications) ? parsed.notifications : this.notifications;
      this.currentUser = currentUser;
      this.recalculateAllSquadValues();
      this.normalizeCompetitionState();
      this.notify();
    } catch (error) {
      console.warn("No se pudo sincronizar el estado compartido:", error);
    }
  }

  loadState() {
    try {
      const saved = this.safeReadStorage();
      if (saved) {
        const parsed = JSON.parse(saved);
        this.league = parsed.league || DEFAULT_LEAGUE_INFO;
        this.teams = Array.isArray(parsed.teams) ? parsed.teams : DEFAULT_TEAMS;
        this.players = Array.isArray(parsed.players) ? parsed.players : DEFAULT_PLAYERS;
        this.matches = Array.isArray(parsed.matches) ? parsed.matches : DEFAULT_MATCHES;
        this.market = parsed.market || DEFAULT_MARKET_STATE;
        if (!this.market.mode) this.market.mode = "auto";
        this.finances = Array.isArray(parsed.finances) ? parsed.finances : DEFAULT_FINANCES;
        this.rulesCards = Array.isArray(parsed.rulesCards) ? parsed.rulesCards : DEFAULT_RULES_CARDS;
        this.diceRules = Array.isArray(parsed.diceRules) ? parsed.diceRules : DEFAULT_DICE_RULES;
        this.announcements = Array.isArray(parsed.announcements) ? parsed.announcements : DEFAULT_ANNOUNCEMENTS;
        this.auctionPlayers = Array.isArray(parsed.auctionPlayers) ? parsed.auctionPlayers : DEFAULT_AUCTION_PLAYERS;
        this.draft = parsed.draft || JSON.parse(JSON.stringify(DEFAULT_DRAFT_STATE));
        this.users = this.mergeDefaultUsers(parsed.users);
        this.notifications = Array.isArray(parsed.notifications) ? parsed.notifications : this.generateDefaultNotifications();
        this.currentUser = JSON.parse(sessionStorage.getItem("KINGS_LEAGUE_IMEX_USER") || "null") || {
          id: "u-guest",
          name: "Visitante",
          role: "GUEST",
          teamId: null,
          playerId: null,
          avatar: "👤",
        };
        this.recalculateAllSquadValues();
        this.normalizeCompetitionState();
        return;
      }
    } catch (e) {
      console.warn("Error cargando estado desde localStorage, usando datos base:", e);
    }

    this.resetToDefaults(false);
  }

  generateDefaultNotifications() {
    return [
      { id: "n-1", title: "¡Mercado de Fichajes Abierto!", message: "La ventana semanal de transferencias está activa. Cada equipo cuenta con 1 Clausulazo.", time: "Hace 10 min", read: false, type: "market" },
      { id: "n-2", title: "Premio Victoria (+50M)", message: "Los Cuervos FC han recibido +50M por su victoria en la Jornada 01.", time: "Hace 1 hora", read: false, type: "finance" },
      { id: "n-3", title: "Clausulazo Registrado", message: "Furia Azteca activó su clausulazo por Andrés Figueroa (15M).", time: "Hace 2 horas", read: true, type: "transfer" },
      { id: "n-4", title: "Próxima Jornada IMEX", message: "Consulta el calendario para ver los próximos partidos.", time: "Hace 5 horas", read: true, type: "match" }
    ];
  }

  mergeDefaultUsers(savedUsers) {
    const usersById = new Map((Array.isArray(savedUsers) ? savedUsers : []).map((user) => [user.id, user]));
    DEFAULT_USERS.forEach((defaultUser) => {
      if (!usersById.has(defaultUser.id)) usersById.set(defaultUser.id, JSON.parse(JSON.stringify(defaultUser)));
    });
    return [...usersById.values()];
  }

  saveState() {
    try {
      const stateToSave = {
        league: this.league,
        teams: this.teams,
        players: this.players,
        matches: this.matches,
        market: this.market,
        finances: this.finances,
        rulesCards: this.rulesCards,
        diceRules: this.diceRules,
        announcements: this.announcements,
        auctionPlayers: this.auctionPlayers,
        draft: this.draft,
        users: this.users,
        notifications: this.notifications,
        currentUser: this.currentUser,
      };
      this.safeWriteStorage(JSON.stringify(stateToSave));
      this.syncToServer();
    } catch (e) {
      console.error("Error guardando en localStorage:", e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.subscribers.push(listener);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== listener);
    };
  }

  notify() {
    this.subscribers.forEach((listener) => {
      try {
        listener(this);
      } catch (err) {
        console.error("Error en subscriber de Store:", err);
      }
    });
  }

  resetToDefaults(shouldNotify = true) {
    if (shouldNotify) this.requireRole("ADMIN");
    this.league = JSON.parse(JSON.stringify(DEFAULT_LEAGUE_INFO));
    this.teams = JSON.parse(JSON.stringify(DEFAULT_TEAMS));
    this.players = JSON.parse(JSON.stringify(DEFAULT_PLAYERS));
    this.matches = JSON.parse(JSON.stringify(DEFAULT_MATCHES));
    this.market = JSON.parse(JSON.stringify(DEFAULT_MARKET_STATE));
    this.finances = JSON.parse(JSON.stringify(DEFAULT_FINANCES));
    this.rulesCards = JSON.parse(JSON.stringify(DEFAULT_RULES_CARDS));
    this.diceRules = JSON.parse(JSON.stringify(DEFAULT_DICE_RULES));
    this.announcements = JSON.parse(JSON.stringify(DEFAULT_ANNOUNCEMENTS));
    this.auctionPlayers = JSON.parse(JSON.stringify(DEFAULT_AUCTION_PLAYERS));
    this.draft = JSON.parse(JSON.stringify(DEFAULT_DRAFT_STATE));
    this.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
    this.notifications = this.generateDefaultNotifications();
    this.currentUser = {
      id: "u-guest",
      name: "Visitante",
      role: "GUEST",
      teamId: null,
      playerId: null,
      avatar: "👤",
    };
    this.recalculateAllSquadValues();
    if (shouldNotify) {
      this.saveState();
    }
  }

  // --- RECALCULAR VALORES DE PLANTILLA ---
  recalculateAllSquadValues() {
    this.teams.forEach((team) => {
      const teamPlayers = this.players.filter((p) => p.teamId === team.id);
      team.squadValue = teamPlayers.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
    });
  }

  // --- GESTIÓN DE ROLES Y USUARIOS ---
  setCurrentUser(user) {
    this.currentUser = user;
    this.saveState();
  }

  requireRole(...roles) {
    if (!roles.includes(this.currentUser?.role)) {
      throw new Error("No tienes permisos para realizar esta operación.");
    }
  }

  requireTeamAccess(teamId) {
    if (this.currentUser?.role === "ADMIN") return;
    this.requireRole("PRESIDENT");
    if (this.currentUser.teamId !== teamId) {
      throw new Error("No tienes permisos sobre este equipo.");
    }
  }

 async authenticateUser({ username, password, role, teamId = null }) {
  console.log("=== INTENTO DE LOGIN ===");
  console.log("Usuario escrito:", username);
  console.log("Rol solicitado:", role);
  console.log("Usuarios disponibles:", this.users);

  if (!username || !password) {
    console.log("Falta usuario o contraseña.");
    return null;
  }

  const normalizedUsername = username.trim().toLowerCase();
  const normalizedPassword = String(password).trim();

  const match = this.users.find((u) => {
    console.log("Revisando usuario:", u.username, "rol:", u.role);

    const usernameOk =
      u.username?.trim().toLowerCase() === normalizedUsername;

    const passwordOk =
      String(u.password ?? "").trim() === normalizedPassword;

    const roleOk =
      !role || u.role === role;

    const teamOk =
      !teamId || !u.teamId || u.teamId === teamId;

    console.log({
      usernameOk,
      passwordOk,
      roleOk,
      teamOk
    });

    return usernameOk && passwordOk && roleOk && teamOk;
  });

  console.log("RESULTADO LOGIN:", match);

  return match || null;
}

  switchRole(roleType, targetId = null, userData = null) {
    if (roleType === "ADMIN") {
      if (!userData || userData.role !== "ADMIN") throw new Error("Autenticación de organizador requerida.");
      const authenticatedAdmin = userData;
      this.currentUser = {
        id: authenticatedAdmin?.id || "u-admin",
        name: authenticatedAdmin?.name || "Prof. Alejandro Valdés",
        role: "ADMIN",
        teamId: null,
        playerId: null,
        avatar: authenticatedAdmin?.avatar || "👑",
      };
    } else if (roleType === "PRESIDENT") {
      const team = this.teams.find((t) => t.id === targetId) || this.teams[0];
      if (!userData || userData.role !== "PRESIDENT" || userData.teamId !== team.id) throw new Error("Autenticación de presidente requerida.");
      const authenticatedPresi = userData;
      this.currentUser = {
        id: authenticatedPresi?.id || `u-presi-${team.id}`,
        name: authenticatedPresi?.name || `${team.president} (Pres. ${team.name})`,
        role: "PRESIDENT",
        teamId: team.id,
        playerId: null,
        avatar: authenticatedPresi?.avatar || team.logoText || "🦅",
      };
    } else if (roleType === "PLAYER") {
      const player = this.players.find((p) => p.id === targetId) || this.players[0];
      const team = this.teams.find((t) => t.id === player.teamId);
      this.currentUser = {
        id: `u-player-${player.id}`,
        name: player.name,
        role: "PLAYER",
        teamId: player.teamId,
        playerId: player.id,
        avatar: player.isInsignia ? "⭐" : "⚽",
      };
    } else {
      this.currentUser = {
        id: "u-guest",
        name: "Visitante",
        role: "GUEST",
        teamId: null,
        playerId: null,
        avatar: "👤",
      };
    }
    this.addNotification({
      title: "Sesión Cambiada",
      message: `Has cambiado tu rol a: ${this.currentUser.role} (${this.currentUser.name})`,
      type: "info"
    });
    this.saveState();
  }

  // --- NOTIFICACIONES ---
  addNotification({ title, message, type = "info" }) {
    const newNotif = {
      id: "notif-" + Date.now(),
      title,
      message,
      time: "Justo ahora",
      read: false,
      type,
    };
    this.notifications.unshift(newNotif);
    if (this.notifications.length > 25) {
      this.notifications.pop();
    }
  }

  markAllNotificationsRead() {
    this.notifications.forEach((n) => (n.read = true));
    this.saveState();
  }

  // --- CONSULTAS Y GETTERS ---
  getTeamById(teamId) {
    return this.teams.find((t) => t.id === teamId) || null;
  }

  getPlayerById(playerId) {
    return this.players.find((p) => p.id === playerId) || null;
  }

  getTeamPlayers(teamId) {
    return this.players.filter((p) => p.teamId === teamId);
  }

  getInsigniaPlayer(teamId) {
    return this.players.find((p) => p.teamId === teamId && p.isInsignia) || null;
  }

  // --- CLASIFICACIÓN DINÁMICA ---
  getStandings(groupFilter = null) {
    // Inicializar tabla para los 8 equipos
    const statsMap = {};
    this.teams.forEach((t) => {
      statsMap[t.id] = {
        team: t,
        teamId: t.id,
        name: t.name,
        shortName: t.shortName,
        group: t.group,
        color: t.color,
        logoText: t.logoText,
        pj: 0,
        pg: 0,
        pe: 0,
        pp: 0,
        gf: 0,
        gc: 0,
        dg: 0,
        pts: 0,
        balance: t.balance,
      };
    });

    // Calcular estadísticas a partir de partidos jugados
    this.matches
      .filter((m) => m.status === "finished" && m.homeScore !== null && m.awayScore !== null)
      .forEach((m) => {
        const home = statsMap[m.homeTeamId];
        const away = statsMap[m.awayTeamId];
        if (!home || !away) return;

        home.pj += 1;
        away.pj += 1;
        home.gf += Number(m.homeScore);
        home.gc += Number(m.awayScore);
        away.gf += Number(m.awayScore);
        away.gc += Number(m.homeScore);

        if (m.homeScore > m.awayScore) {
          home.pg += 1;
          home.pts += 3;
          away.pp += 1;
        } else if (m.homeScore < m.awayScore) {
          away.pg += 1;
          away.pts += 3;
          home.pp += 1;
        } else {
          home.pe += 1;
          away.pe += 1;
          home.pts += 1;
          away.pts += 1;
        }
      });

    // Calcular Diferencia de Goles
    Object.values(statsMap).forEach((st) => {
      st.dg = st.gf - st.gc;
    });

    let standings = Object.values(statsMap);
    if (groupFilter) {
      standings = standings.filter((s) => s.group === groupFilter);
    }

    // Ordenar: PTS DESC, DG DESC, GF DESC
    standings.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dg !== a.dg) return b.dg - a.dg;
      return b.gf - a.gf;
    });

    // Asignar posiciones y zonas (Clasificado, Semifinal, Eliminado)
    return standings.map((st, index) => {
      const pos = index + 1;
      let zone = "regular";
      let zoneLabel = "Fase Regular";

      if (pos === 1) {
        zone = "classified";
        zoneLabel = "CLASIFICADO A SEMIFINAL";
      } else if (pos === 2) {
        zone = "semifinal";
        zoneLabel = "EN ZONA DE SEMIFINAL";
      } else if (pos === standings.length) {
        zone = "eliminated";
        zoneLabel = "ELIMINADO DEL TORNEO";
      } else {
        zone = "regular";
        zoneLabel = "FUERA DE SEMIFINALES";
      }

      return {
        ...st,
        pos,
        zone,
        zoneLabel,
      };
    });
  }

  // --- GOLEADORES Y ESTADÍSTICAS ---
  getTopScorers(limit = 20) {
    const list = [...this.players]
      .filter((p) => p.goals > 0)
      .sort((a, b) => {
        if (b.goals !== a.goals) return b.goals - a.goals;
        return (b.assists || 0) - (a.assists || 0);
      });

    return list.slice(0, limit).map((player, index) => {
      const team = this.getTeamById(player.teamId);
      const matches = player.matchesPlayed || 1;
      const average = (player.goals / matches).toFixed(2);
      return {
        pos: index + 1,
        player,
        team,
        goals: player.goals,
        assists: player.assists || 0,
        matches,
        average,
        yellowCards: player.yellowCards || 0,
        redCards: player.redCards || 0,
      };
    });
  }

  // --- PRÓXIMO PARTIDO ---
  getNextMatch() {
    const scheduled = this.matches
      .filter((m) => m.status === "scheduled" && m.homeTeamId && m.awayTeamId)
      .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    return scheduled.length > 0 ? scheduled[0] : null;
  }

  // --- REGISTRO DE RESULTADOS DE PARTIDO ---
  recordMatchResult(matchData) {
    this.requireRole("ADMIN");
    const homeTeam = this.getTeamById(matchData.homeTeamId);
    const awayTeam = this.getTeamById(matchData.awayTeamId);
    if (!matchData.id || !homeTeam || !awayTeam || homeTeam.id === awayTeam.id) {
      throw new Error("El acta debe tener un partido y dos equipos válidos.");
    }
    const homeScore = safeInteger(matchData.homeScore, -1);
    const awayScore = safeInteger(matchData.awayScore, -1);
    if (homeScore < 0 || awayScore < 0) throw new Error("Los goles deben ser enteros no negativos.");
    const matchIndex = this.matches.findIndex((m) => m.id === matchData.id);
    const isNew = matchIndex === -1;

    const oldMatch = !isNew ? this.matches[matchIndex] : null;
    const wasFinished = oldMatch && oldMatch.status === "finished";

    const updatedMatch = {
      ...(oldMatch || {}),
      ...matchData,
      homeScore,
      awayScore,
      title: sanitizeText(matchData.title || oldMatch?.title),
      pitch: sanitizeText(matchData.pitch || oldMatch?.pitch, "Cancha IMEX"),
      diceEvent: sanitizeText(matchData.diceEvent || oldMatch?.diceEvent),
      notes: sanitizeText(matchData.notes || oldMatch?.notes),
      status: "finished",
    };

    if (isNew) {
      this.matches.push(updatedMatch);
    } else {
      this.matches[matchIndex] = updatedMatch;
    }

    // Regla económica oficial KINGS LEAGUE IMEX:
    // Victoria = +50M, Empate = +10M, Derrota = +0M
    if (homeTeam && awayTeam && !wasFinished) {
      let homeGain = 0;
      let awayGain = 0;
      let homeOutcome = "Derrota";
      let awayOutcome = "Derrota";

      if (homeScore > awayScore) {
        homeGain = this.league.winReward || 50;
        awayGain = this.league.lossReward || 0;
        homeOutcome = "Victoria";
        awayOutcome = "Derrota";
      } else if (homeScore < awayScore) {
        homeGain = this.league.lossReward || 0;
        awayGain = this.league.winReward || 50;
        homeOutcome = "Derrota";
        awayOutcome = "Victoria";
      } else {
        homeGain = this.league.drawReward || 10;
        awayGain = this.league.drawReward || 10;
        homeOutcome = "Empate";
        awayOutcome = "Empate";
      }

      homeTeam.balance += homeGain;
      awayTeam.balance += awayGain;

      // Registrar transacciones financieras
      this.finances.unshift({
        id: "fin-" + Date.now() + "-h",
        teamId: homeTeam.id,
        type: homeGain > 0 ? "income" : "expense",
        concept: `${homeOutcome} en Jornada ${matchData.matchday || "Playoff"} vs ${awayTeam.name}`,
        amount: homeGain,
        date: new Date().toISOString().split("T")[0],
      });

      this.finances.unshift({
        id: "fin-" + Date.now() + "-a",
        teamId: awayTeam.id,
        type: awayGain > 0 ? "income" : "expense",
        concept: `${awayOutcome} en Jornada ${matchData.matchday || "Playoff"} vs ${homeTeam.name}`,
        amount: awayGain,
        date: new Date().toISOString().split("T")[0],
      });

      this.addNotification({
        title: "¡Resultado y Premios Económicos!",
        message: `${homeTeam.name} ${homeScore} - ${awayScore} ${awayTeam.name}. Premios acreditados (+${homeGain}M / +${awayGain}M).`,
        type: "match"
      });
    }

    // Actualizar goleadores individuales
    if (matchData.scorers && Array.isArray(matchData.scorers)) {
      matchData.scorers.forEach((sc) => {
        const player = this.getPlayerById(sc.playerId);
        if (player) {
          const count = sc.type === "doble" ? 2 : 1;
          player.goals = (player.goals || 0) + count;
        }
      });
    }

    // Actualizar tarjetas individuales
    if (matchData.bookings && Array.isArray(matchData.bookings)) {
      matchData.bookings.forEach((bk) => {
        const player = this.getPlayerById(bk.playerId);
        if (player) {
          if (bk.card === "yellow") player.yellowCards = (player.yellowCards || 0) + 1;
          if (bk.card === "red") player.redCards = (player.redCards || 0) + 1;
        }
      });
    }

    this.settleGroupStageIfComplete();

    this.saveState();
    return updatedMatch;
  }

  settleGroupStageIfComplete() {
    if (this.league.groupStageSettled) return false;

    const groupMatches = this.matches.filter((m) => m.phase === "groups");
    if (!groupMatches.length || groupMatches.some((m) => m.status !== "finished")) return false;

    ["A", "B"].forEach((group) => {
      const standings = this.getStandings(group);
      standings.slice(0, 2).forEach((standing) => {
        const team = this.getTeamById(standing.teamId);
        const reward = Number(this.league.qualificationReward) || 50;
        if (!team) return;
        team.balance += reward;
        this.finances.unshift({
          id: `fin-${Date.now()}-${team.id}-qual`,
          teamId: team.id,
          type: "income",
          concept: `Premio por clasificación a semifinales (${group})`,
          amount: reward,
          date: new Date().toISOString().split("T")[0],
        });
      });

      const eliminated = standings[standings.length - 1];
      const eliminatedTeam = eliminated && this.getTeamById(eliminated.teamId);
      if (eliminatedTeam) eliminatedTeam.status = "eliminated";
    });

    const standingsA = this.getStandings("A");
    const standingsB = this.getStandings("B");
    const semi1 = this.matches.find((m) => m.id === "match-semi-1");
    const semi2 = this.matches.find((m) => m.id === "match-semi-2");
    if (semi1) {
      semi1.homeTeamId = standingsA[0]?.teamId || null;
      semi1.awayTeamId = standingsB[1]?.teamId || null;
    }
    if (semi2) {
      semi2.homeTeamId = standingsB[0]?.teamId || null;
      semi2.awayTeamId = standingsA[1]?.teamId || null;
    }

    this.league.groupStageSettled = true;
    this.addNotification({
      title: "Semifinalistas definidos",
      message: "Los cuatro equipos clasificados reciben 50M y los últimos de cada grupo quedan eliminados.",
      type: "match",
    });
    return true;
  }

  // --- DRAFT EN VIVO ---
  prepareDraft() {
    this.requireRole("ADMIN");
    const order = this.teams.filter((team) => team.status !== "eliminated").map((team) => team.id);
    if (order.length < 2 || !this.players.length) throw new Error("Registra al menos dos equipos y un jugador antes de iniciar el draft.");

    this.players.forEach((player) => {
      player.teamId = null;
      player.isInsignia = false;
      player.status = "available";
    });
    this.teams.forEach((team) => {
      team.balance = Number(this.league.budgetPerTeam) || 200;
      team.squadValue = 0;
      team.clausulazoUsed = false;
      team.status = "active";
    });
    this.draft = {
      ...JSON.parse(JSON.stringify(DEFAULT_DRAFT_STATE)),
      status: "live",
      order,
      currentTeamId: order[0],
      turnStartedAt: Date.now(),
      poolPlayerIds: this.players.map((player) => player.id),
    };
    this.saveState();
  }

  getDraftSecondsRemaining() {
    if (this.draft.status !== "live" || !this.draft.turnStartedAt) return 0;
    return Math.max(0, (Number(this.draft.secondsPerPick) || 45) - Math.floor((Date.now() - this.draft.turnStartedAt) / 1000));
  }

  advanceDraftTurn(reason = "pick") {
    const draft = this.draft;
    if (draft.status !== "live") return;
    const nextPickIndex = draft.pickIndex + 1;
    if (nextPickIndex >= draft.order.length) {
      draft.round += 1;
      draft.pickIndex = 0;
      draft.order.reverse();
    } else {
      draft.pickIndex = nextPickIndex;
    }

    if (!draft.poolPlayerIds.length) {
      draft.status = "completed";
      draft.currentTeamId = null;
      draft.turnStartedAt = null;
    } else {
      draft.currentTeamId = draft.order[draft.pickIndex];
      draft.turnStartedAt = Date.now();
    }
    this.saveState();
  }

  expireDraftTurn() {
    if (this.draft.status !== "live" || this.getDraftSecondsRemaining() > 0) return false;
    this.draft.skippedTurns.push({ teamId: this.draft.currentTeamId, round: this.draft.round, at: Date.now() });
    this.advanceDraftTurn("timeout");
    return true;
  }

  pickDraftPlayer(teamId, playerId) {
    if (this.draft.status !== "live") throw new Error("El draft todavía no está activo.");
    this.requireTeamAccess(teamId);
    if (this.draft.currentTeamId !== teamId) throw new Error("No es el turno de este equipo.");
    if (!this.draft.poolPlayerIds.includes(playerId)) throw new Error("Ese jugador ya fue elegido.");

    const player = this.getPlayerById(playerId);
    const team = this.getTeamById(teamId);
    if (!player || !team) throw new Error("Jugador o equipo no encontrado.");

    player.teamId = team.id;
    player.status = "available";
    this.draft.poolPlayerIds = this.draft.poolPlayerIds.filter((id) => id !== playerId);
    this.draft.picks.push({ playerId, teamId, round: this.draft.round, pickedAt: Date.now() });
    this.advanceDraftTurn("pick");
  }

  // --- MERCADO: EJECUCIÓN DE CLAUSULAZO ---
  // --- MERCADO: ¿ESTÁ ABIERTO AHORA MISMO? ---
  // mode: "auto" (solo miércoles, calculado con la fecha real del dispositivo),
  // "open" (forzado abierto por el organizador) o "closed" (forzado cerrado).
  isMarketOpenNow() {
    const mode = this.market.mode || "auto";
    const open = mode === "open" ? true : mode === "closed" ? false : new Date().getDay() === 3; // 3 = miércoles
    if (open) this.ensureMarketWeekReset();
    return open;
  }

  // Identificador de semana ISO (año-Wsemana) para saber si ya cambiamos de mercado
  getWeekKey(d) {
    d = new Date(d);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const w1 = new Date(d.getFullYear(), 0, 4);
    const week = 1 + Math.round(((d - w1) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7);
    return d.getFullYear() + "-W" + week;
  }

  // Al entrar una nueva semana con el mercado abierto, todos recuperan su clausulazo
  ensureMarketWeekReset() {
    const wk = this.getWeekKey(new Date());
    if (this.market.currentOpenWeek !== wk) {
      this.market.currentOpenWeek = wk;
      this.teams.forEach((t) => (t.clausulazoUsed = false));
      this.saveState();
    }
  }

  // Fecha objetivo para el cronómetro visual (próxima apertura/cierre real)
  getMarketBoundaryDate() {
    const mode = this.market.mode || "auto";
    if (mode !== "auto") return null; // forzado: sin cuenta regresiva con sentido
    const now = new Date();
    const day = now.getDay();
    if (day === 3) {
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return end;
    }
    const daysUntil = (3 - day + 7) % 7 || 7;
    const next = new Date(now);
    next.setDate(now.getDate() + daysUntil);
    next.setHours(9, 0, 0, 0);
    return next;
  }

  executeClausulazo({ buyerTeamId, targetPlayerId }) {
    this.requireTeamAccess(buyerTeamId);
    const buyerTeam = this.getTeamById(buyerTeamId);
    const player = this.getPlayerById(targetPlayerId);

    if (!this.isMarketOpenNow()) {
      throw new Error("El mercado de fichajes está cerrado.");
    }
    if (!buyerTeam) {
      throw new Error("Equipo comprador no encontrado.");
    }
    if (!player) {
      throw new Error("Jugador no encontrado.");
    }
    if (buyerTeam.id === player.teamId) {
      throw new Error("No puedes aplicar clausulazo a un jugador de tu propio equipo.");
    }
    if (player.isInsignia) {
      throw new Error("¡OPERACIÓN BLOQUEADA! Los Jugadores Insignia están blindados y protegidos ante cualquier clausulazo.");
    }
    if (buyerTeam.clausulazoUsed) {
      throw new Error("Tu equipo ya utilizó su único clausulazo disponible para este mercado.");
    }
    if (buyerTeam.balance < player.value) {
      throw new Error(`Saldo insuficiente. Tienes ${buyerTeam.balance}M y la cláusula es de ${player.value}M.`);
    }

    const sellerTeam = this.getTeamById(player.teamId);

    // 1. Deducir fondos al comprador
    buyerTeam.balance -= player.value;
    buyerTeam.clausulazoUsed = true;

    // 2. Abonar fondos al vendedor si existe
    if (sellerTeam) {
      sellerTeam.balance += player.value;
    }

    // 3. Cambiar de equipo al jugador
    const previousTeamId = player.teamId;
    player.teamId = buyerTeam.id;
    player.status = "available";

    // 4. Registro financiero
    this.finances.unshift({
      id: "fin-" + Date.now() + "-claus-buy",
      teamId: buyerTeam.id,
      type: "expense",
      concept: `Pago de CLAUSULAZO por ${player.name}`,
      amount: player.value,
      date: new Date().toISOString().split("T")[0],
    });

    if (sellerTeam) {
      this.finances.unshift({
        id: "fin-" + Date.now() + "-claus-sell",
        teamId: sellerTeam.id,
        type: "income",
        concept: `Ingreso por CLAUSULAZO de ${player.name} (${buyerTeam.name})`,
        amount: player.value,
        date: new Date().toISOString().split("T")[0],
      });
    }

    // 5. Registrar transferencia
    const transferRecord = {
      id: "tr-" + Date.now(),
      buyerTeamId: buyerTeam.id,
      sellerTeamId: previousTeamId,
      playerId: player.id,
      offeredPlayerIds: [],
      price: player.value,
      type: "clausulazo",
      status: "completed",
      date: new Date().toLocaleString(),
      notes: `¡BOMBAZO! Clausulazo ejecutado por ${buyerTeam.name}. ${player.name} cambia de club de inmediato por ${player.value}M.`,
    };
    this.market.transfers.unshift(transferRecord);

    // 6. Recalcular valor de plantillas
    this.recalculateAllSquadValues();

    // 7. Notificación general
    this.addNotification({
      title: "🚨 ¡CLAUSULAZO EJECUTADO!",
      message: `${buyerTeam.name} ejecutó su cláusula de ${player.value}M por ${player.name} de ${sellerTeam ? sellerTeam.name : 'Agente Libre'}.`,
      type: "clausulazo"
    });

    this.saveState();
    return transferRecord;
  }

  // --- MERCADO: PROPUESTA DE TRANSFERENCIA ORDINARIA ---
  proposeTransfer({ buyerTeamId, sellerTeamId, playerId, offeredPlayerIds = [], price = 0, notes = "" }) {
    this.requireTeamAccess(buyerTeamId);
    if (!this.isMarketOpenNow()) {
      throw new Error("El mercado de fichajes está cerrado actualmente.");
    }
    const player = this.getPlayerById(playerId);
    if (!player) throw new Error("Jugador objetivo inválido.");
    if (buyerTeamId === sellerTeamId) throw new Error("El comprador y el vendedor deben ser equipos distintos.");
    if (player.teamId !== sellerTeamId) throw new Error("El jugador objetivo no pertenece al equipo vendedor.");
    if (player.isInsignia) {
      throw new Error("El jugador insignia está blindado y no puede ser transferido.");
    }

    const offeredPlayers = offeredPlayerIds.map((id) => this.getPlayerById(id)).filter(Boolean);
    if (offeredPlayers.length !== offeredPlayerIds.length || offeredPlayers.some((offered) => offered.teamId !== buyerTeamId || offered.isInsignia)) {
      throw new Error("Solo puedes ofrecer jugadores de tu equipo que no sean insignia.");
    }
    if ((Number(price) || 0) <= 0 && offeredPlayers.length === 0) {
      throw new Error("La propuesta debe incluir dinero, jugadores o ambas cosas.");
    }

    const newTransfer = {
      id: "tr-" + Date.now(),
      buyerTeamId,
      sellerTeamId,
      playerId,
      offeredPlayerIds,
      price: Number(price) || 0,
      type: offeredPlayerIds.length > 0 ? "swap_and_cash" : "cash",
      status: "pending",
      date: new Date().toLocaleString(),
      notes: sanitizeText(notes, "Propuesta formal de transferencia."),
    };

    this.market.transfers.unshift(newTransfer);

    const buyerTeam = this.getTeamById(buyerTeamId);
    const sellerTeam = this.getTeamById(sellerTeamId);

    this.addNotification({
      title: "Nueva Oferta de Traspaso",
      message: `${buyerTeam?.name} ha enviado una propuesta formal a ${sellerTeam?.name} por ${player.name}.`,
      type: "transfer"
    });

    this.saveState();
    return newTransfer;
  }

  // --- RESPONDER A TRANSFERENCIA (ACEPTAR / RECHAZAR) ---
  respondTransfer(transferId, action) {
    const tr = this.market.transfers.find((t) => t.id === transferId);
    if (!tr) throw new Error("Transferencia no encontrada.");
    if (this.currentUser?.role !== "ADMIN" && this.currentUser?.teamId !== tr.sellerTeamId) {
      throw new Error("Solo el equipo vendedor puede responder a esta oferta.");
    }
    if (!["accept", "reject"].includes(action)) throw new Error("Acción de transferencia no válida.");
    if (!this.isMarketOpenNow()) throw new Error("El mercado de fichajes está cerrado actualmente.");

    if (action === "reject") {
      tr.status = "rejected";
      this.addNotification({
        title: "Transferencia Rechazada",
        message: `La propuesta por el traspaso de ${this.getPlayerById(tr.playerId)?.name || 'un jugador'} fue rechazada.`,
        type: "transfer"
      });
      this.saveState();
      return tr;
    }

    if (action === "accept") {
      const buyer = this.getTeamById(tr.buyerTeamId);
      const seller = this.getTeamById(tr.sellerTeamId);
      const player = this.getPlayerById(tr.playerId);

      if (!buyer || !seller || !player || player.teamId !== seller.id || player.isInsignia) {
        throw new Error("La propuesta ya no es válida: el jugador cambió de equipo o está protegido.");
      }
      const offeredPlayers = (tr.offeredPlayerIds || []).map((id) => this.getPlayerById(id)).filter(Boolean);
      if (offeredPlayers.length !== (tr.offeredPlayerIds || []).length || offeredPlayers.some((offered) => offered.teamId !== buyer.id || offered.isInsignia)) {
        throw new Error("La parte ofrecida del trueque ya no está disponible.");
      }

      if (buyer.balance < tr.price) {
        throw new Error(`El comprador (${buyer.name}) no tiene saldo suficiente (${buyer.balance}M vs ${tr.price}M requeridos).`);
      }

      // Descontar y transferir dinero
      if (tr.price > 0) {
        buyer.balance -= tr.price;
        seller.balance += tr.price;

        this.finances.unshift({
          id: "fin-" + Date.now() + "-tb",
          teamId: buyer.id,
          type: "expense",
          concept: `Fichaje de ${player.name} (${seller.name})`,
          amount: tr.price,
          date: new Date().toISOString().split("T")[0],
        });

        this.finances.unshift({
          id: "fin-" + Date.now() + "-ts",
          teamId: seller.id,
          type: "income",
          concept: `Venta de ${player.name} a ${buyer.name}`,
          amount: tr.price,
          date: new Date().toISOString().split("T")[0],
        });
      }

      // Transferir jugador principal
      player.teamId = buyer.id;

      // Transferir jugadores incluidos en el intercambio
      if (tr.offeredPlayerIds && tr.offeredPlayerIds.length > 0) {
        tr.offeredPlayerIds.forEach((offId) => {
          const offP = this.getPlayerById(offId);
          if (offP) offP.teamId = seller.id;
        });
      }

      tr.status = "completed";
      this.recalculateAllSquadValues();

      this.addNotification({
        title: "🤝 ¡Transferencia Oficial!",
        message: `${player.name} es nuevo jugador de ${buyer.name}. ¡Acuerdo sellado!`,
        type: "transfer"
      });

      this.saveState();
      return tr;
    }
  }

  // --- ADMINISTRADOR: CONTROL DE MERCADO ---
  // mode: "auto" (solo miércoles, por calendario real), "open" (forzar abierto) o "closed" (forzar cerrado)
  setMarketStatus(mode) {
    this.requireRole("ADMIN");
    this.market.mode = mode === "open" || mode === "closed" ? mode : "auto";
    const nowOpen = this.isMarketOpenNow();

    if (nowOpen) {
      this.teams.forEach((t) => (t.clausulazoUsed = false));
      this.addNotification({
        title: "🔔 ¡MERCADO DE FICHAJES ABIERTO!",
        message: this.market.mode === "open"
          ? "El Organizador forzó la apertura del mercado. Todos los clubes recuperan su Clausulazo."
          : "Es miércoles: el mercado está abierto. Todos los clubes recuperan su Clausulazo.",
        type: "market"
      });
    } else {
      this.addNotification({
        title: "🔒 Mercado Cerrado",
        message: this.market.mode === "closed"
          ? "El Organizador cerró el mercado manualmente."
          : "El mercado solo abre los miércoles.",
        type: "market"
      });
    }

    this.saveState();
  }

  // --- AJUSTE FINANCIERO MANUAL (ADMIN) ---
  adjustTeamFinance(teamId, amount, concept, isIncome = true) {
    this.requireRole("ADMIN");
    const team = this.getTeamById(teamId);
    if (!team) throw new Error("Equipo no encontrado.");

    const val = safeInteger(Math.abs(Number(amount)), 0);
    if (!val) throw new Error("El importe debe ser un entero mayor que cero.");
    if (isIncome) {
      team.balance += val;
    } else {
      team.balance = Math.max(0, team.balance - val);
    }

    this.finances.unshift({
      id: "fin-" + Date.now(),
      teamId: team.id,
      type: isIncome ? "income" : "expense",
      concept: sanitizeText(concept, isIncome ? "Ajuste manual de fondos" : "Sanción económica de torneo"),
      amount: val,
      date: new Date().toISOString().split("T")[0],
    });

    this.saveState();
  }

  // --- GESTIÓN DE JUGADORES ---
  updatePlayer(playerData) {
    this.requireRole("ADMIN");
    const idx = this.players.findIndex((p) => p.id === playerData.id);
    let playerId = playerData.id || "";
    if (idx === -1) {
      // Nuevo jugador
      const newP = {
        id: "p-" + Date.now(),
        teamId: playerData.teamId || "team-1",
        name: sanitizeText(playerData.name, "Nuevo Jugador"),
        number: Number(playerData.number) || 99,
        position: sanitizePosition(playerData.position),
        value: Number(playerData.value) || 20,
        isInsignia: Boolean(playerData.isInsignia),
        goals: Number(playerData.goals) || 0,
        assists: Number(playerData.assists) || 0,
        yellowCards: Number(playerData.yellowCards) || 0,
        redCards: Number(playerData.redCards) || 0,
        matchesPlayed: Number(playerData.matchesPlayed) || 0,
        status: playerData.isInsignia ? "protected" : "available",
        photoUrl: sanitizeUrl(playerData.photoUrl),
      };
      this.players.push(newP);
      playerId = newP.id;
    } else {
      this.players[idx] = {
        ...this.players[idx],
        ...playerData,
        name: sanitizeText(playerData.name, this.players[idx].name),
        position: sanitizePosition(playerData.position || this.players[idx].position),
        photoUrl: sanitizeUrl(playerData.photoUrl || this.players[idx].photoUrl),
        value: Number(playerData.value) || this.players[idx].value,
        number: Number(playerData.number) || this.players[idx].number,
      };
      playerId = this.players[idx].id;
    }
    this.recalculateAllSquadValues();
    this.saveState();
    return playerId;
  }

  deletePlayer(playerId) {
    this.requireRole("ADMIN");
    this.players = this.players.filter((p) => p.id !== playerId);
    this.recalculateAllSquadValues();
    this.saveState();
  }

  setInsigniaPlayer(teamId, targetPlayerId) {
    this.requireRole("ADMIN");
    this.players.forEach((p) => {
      if (p.teamId === teamId) {
        if (p.id === targetPlayerId) {
          p.isInsignia = true;
          p.status = "protected";
        } else {
          p.isInsignia = false;
          p.status = "available";
        }
      }
    });
    this.saveState();
  }

  // --- GESTIÓN DE EQUIPOS ---
  updateTeam(teamData) {
    this.requireRole("ADMIN");
    const idx = this.teams.findIndex((t) => t.id === teamData.id);
    if (idx === -1) {
      const newT = {
        id: "team-" + Date.now(),
        name: sanitizeText(teamData.name, "Nuevo Equipo"),
        shortName: sanitizeText(teamData.shortName, "NEQ"),
        president: sanitizeText(teamData.president, "Presidente"),
        group: teamData.group || "A",
        color: sanitizeColor(teamData.color, "#00FF66"),
        secondaryColor: sanitizeColor(teamData.secondaryColor, "#111111"),
        logoText: sanitizeText(teamData.logoText, "⚽"),
        logoBg: teamData.logoBg || "linear-gradient(135deg, #1A1A1A, #2A2A2A)",
        balance: Number(teamData.balance) || 100,
        squadValue: 200,
        clausulazoUsed: false,
        status: "active",
        crestUrl: sanitizeUrl(teamData.crestUrl),
      };
      this.teams.push(newT);
    } else {
      this.teams[idx] = {
        ...this.teams[idx],
        ...teamData,
        name: sanitizeText(teamData.name, this.teams[idx].name),
        shortName: sanitizeText(teamData.shortName, this.teams[idx].shortName),
        president: sanitizeText(teamData.president, this.teams[idx].president),
        logoText: sanitizeText(teamData.logoText, this.teams[idx].logoText),
        color: sanitizeColor(teamData.color, this.teams[idx].color),
        secondaryColor: sanitizeColor(teamData.secondaryColor, this.teams[idx].secondaryColor),
        logoBg: teamData.logoBg || this.teams[idx].logoBg || "linear-gradient(135deg, #1A1A1A, #2A2A2A)",
        crestUrl: sanitizeUrl(teamData.crestUrl || this.teams[idx].crestUrl),
      };
    }
    this.recalculateAllSquadValues();
    this.saveState();
  }

  // --- LOGO DE LA GENERACIÓN ---
  setGenerationLogo(logoUrlOrData) {
    this.requireRole("ADMIN");
    this.league.generationLogo = sanitizeUrl(logoUrlOrData);
    this.saveState();
  }

  // --- ANUNCIOS ---
  addAnnouncement(annData) {
    this.requireRole("ADMIN");
    const newAnn = {
      id: "ann-" + Date.now(),
      title: sanitizeText(annData.title),
      category: sanitizeText(annData.category, "GENERAL"),
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      important: Boolean(annData.important),
      content: sanitizeText(annData.content),
      author: sanitizeText(annData.author, "Comité IMEX"),
    };
    this.announcements.unshift(newAnn);
    this.addNotification({
      title: "Nuevo Anuncio Oficial",
      message: newAnn.title,
      type: "info"
    });
    this.saveState();
  }

  deleteAnnouncement(annId) {
    this.requireRole("ADMIN");
    this.announcements = this.announcements.filter((a) => a.id !== annId);
    this.saveState();
  }

  // --- SUBASTA FINAL ---
  recordAuctionBid(auctionId, teamId, amount) {
    this.requireRole("ADMIN");
    const auc = this.auctionPlayers.find((a) => a.id === auctionId);
    if (!auc) return;
    if (teamId === "teamA") auc.bidTeamA = Number(amount);
    if (teamId === "teamB") auc.bidTeamB = Number(amount);
    this.saveState();
  }

  closeAuctionWinner(auctionId, winnerTeamId, finalPrice) {
    this.requireRole("ADMIN");
    const auc = this.auctionPlayers.find((a) => a.id === auctionId);
    if (!auc) return;
    auc.winnerTeamId = winnerTeamId;
    auc.finalPrice = Number(finalPrice);
    auc.status = "closed";

    const winnerTeam = this.getTeamById(winnerTeamId);
    const player = this.getPlayerById(auc.playerId);
    if (winnerTeam && player) {
      winnerTeam.balance = Math.max(0, winnerTeam.balance - auc.finalPrice);
      player.teamId = winnerTeam.id;
      this.finances.unshift({
        id: "fin-" + Date.now() + "-auc",
        teamId: winnerTeam.id,
        type: "expense",
        concept: `Fichaje en Subasta Final: ${player.name}`,
        amount: auc.finalPrice,
        date: new Date().toISOString().split("T")[0],
      });
      this.recalculateAllSquadValues();
    }
    this.saveState();
  }

  // --- EXPORTAR / IMPORTAR RESPALDO ---
  exportBackupJSON() {
    return JSON.stringify({
      league: this.league,
      teams: this.teams,
      players: this.players,
      matches: this.matches,
      market: this.market,
      finances: this.finances,
      rulesCards: this.rulesCards,
      diceRules: this.diceRules,
      announcements: this.announcements,
      auctionPlayers: this.auctionPlayers,
      draft: this.draft,
      timestamp: new Date().toISOString(),
    }, null, 2);
  }

  normalizeCompetitionState() {
    this.league.qualificationReward = Number(this.league.qualificationReward) || 50;
    this.league.groupStageSettled = Boolean(this.league.groupStageSettled);
    ["name", "tagline", "format", "season"].forEach((key) => {
      if (this.league[key] !== undefined) this.league[key] = sanitizeText(this.league[key]);
    });
    this.teams.forEach((team) => {
      team.name = sanitizeText(team.name, "Equipo");
      team.shortName = sanitizeText(team.shortName, "EQ");
      team.president = sanitizeText(team.president, "Presidente");
      team.logoText = sanitizeText(team.logoText, "⚽");
      team.color = sanitizeColor(team.color);
      team.secondaryColor = sanitizeColor(team.secondaryColor);
      team.crestUrl = sanitizeUrl(team.crestUrl);
    });
    this.players.forEach((player) => {
      player.name = sanitizeText(player.name, "Jugador");
      player.position = sanitizePosition(player.position);
      player.photoUrl = sanitizeUrl(player.photoUrl);
    });
    this.matches.forEach((match) => {
      ["title", "pitch", "diceEvent", "notes"].forEach((key) => {
        if (match[key] !== undefined) match[key] = sanitizeText(match[key]);
      });
    });
    this.finances.forEach((finance) => { finance.concept = sanitizeText(finance.concept); });
    this.announcements.forEach((announcement) => {
      announcement.title = sanitizeText(announcement.title);
      announcement.content = sanitizeText(announcement.content);
      announcement.author = sanitizeText(announcement.author);
    });
    if (Array.isArray(this.market?.transfers)) {
      this.market.transfers.forEach((transfer) => { transfer.notes = sanitizeText(transfer.notes); });
    } else {
      this.market.transfers = [];
    }
    if (!this.draft || !Array.isArray(this.draft.picks)) {
      this.draft = JSON.parse(JSON.stringify(DEFAULT_DRAFT_STATE));
    }
  }

  importBackupJSON(jsonStr) {
    this.requireRole("ADMIN");
    try {
      const data = JSON.parse(jsonStr);
      if (/[<>`]/.test(jsonStr)) return false;
      if (Array.isArray(data.teams) && Array.isArray(data.players) && Array.isArray(data.matches)) {
        this.league = data.league || this.league;
        this.teams = data.teams;
        this.players = data.players;
        this.matches = data.matches;
        this.market = data.market || this.market;
        this.finances = data.finances || this.finances;
        this.rulesCards = data.rulesCards || this.rulesCards;
        this.diceRules = data.diceRules || this.diceRules;
        this.announcements = data.announcements || this.announcements;
        this.auctionPlayers = data.auctionPlayers || this.auctionPlayers;
        this.draft = data.draft || this.draft;
        this.normalizeCompetitionState();
        this.recalculateAllSquadValues();
        this.saveState();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error al importar JSON:", e);
      return false;
    }
  }
}

export const store = new Store();
