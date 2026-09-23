// KINGS LEAGUE IMEX - DRAFT EN VIVO

import { store } from "../state/store.js";
import { toast } from "../components/toast.js";

const getTeamName = (teamId) => store.getTeamById(teamId)?.name || "Equipo";

export function renderAuctionView(container) {
  if (container.__draftTimer) window.clearInterval(container.__draftTimer);
  const draft = store.draft;
  const user = store.currentUser;
  const isAdmin = user.role === "ADMIN";
  const currentTeam = draft.currentTeamId ? store.getTeamById(draft.currentTeamId) : null;
  const canPick = user.role === "PRESIDENT" && user.teamId === draft.currentTeamId && draft.status === "live";
  const remaining = store.getDraftSecondsRemaining();
  const availablePlayers = (draft.poolPlayerIds || []).map((id) => store.getPlayerById(id)).filter(Boolean);
  const picksHtml = draft.picks.length
    ? draft.picks.slice().reverse().map((pick) => `<div class="draft-pick-row"><span>R${pick.round}</span><strong>${store.getPlayerById(pick.playerId)?.name || "Jugador"}</strong><span>${getTeamName(pick.teamId)}</span></div>`).join("")
    : `<div class="draft-empty">Aún no hay elecciones registradas.</div>`;

  container.innerHTML = `
    <div class="view-animate-fade">
      <div class="page-header"><div class="page-title-group"><span class="page-category-tag">EVENTO EN DIRECTO</span><h1 class="page-title">🎯 DRAFT DE JUGADORES</h1><p class="page-subtitle">Los presidentes eligen por turnos. El orden se invierte en cada ronda y cada equipo tiene 45 segundos.</p></div></div>
      ${draft.status === "setup" && isAdmin ? `<div class="draft-control-panel"><div><strong>Preparar nuevo torneo</strong><span>Libera las plantillas y activa el orden de elección.</span></div><button class="btn btn-lime" id="btnStartDraft">Iniciar draft</button></div>` : ""}
      <div class="draft-live-banner"><div><span class="badge ${draft.status === "live" ? "badge-lime" : draft.status === "completed" ? "badge-metallic" : "badge-yellow"}">${draft.status === "live" ? "EN VIVO" : draft.status === "completed" ? "COMPLETADO" : "LISTO PARA INICIAR"}</span><h2>${draft.status === "live" ? `Turno de ${currentTeam?.name || "equipo"}` : "Draft pendiente de apertura"}</h2><p>${draft.status === "live" ? (canPick ? "Es tu turno: elige un jugador disponible." : "Sigue la elección en directo.") : "El organizador debe preparar el nuevo torneo."}</p></div>${draft.status === "live" ? `<div class="draft-clock" id="draftClock">00:${String(remaining).padStart(2, "0")}</div>` : ""}</div>
      <div class="draft-layout"><section class="draft-pool-panel"><div class="draft-panel-heading"><h3>Jugadores disponibles (${availablePlayers.length})</h3><span>Ronda ${draft.round}</span></div><div class="draft-player-grid">${availablePlayers.map((player) => `<button class="draft-player-card ${canPick ? "is-selectable" : ""}" data-player-id="${player.id}" ${canPick ? "" : "disabled"}><span class="player-pos-badge pos-${player.position.toLowerCase()}">${player.position}</span><strong>${player.name}</strong><small>Valor de referencia: ${player.value}M</small></button>`).join("") || `<div class="draft-empty">No quedan jugadores disponibles.</div>`}</div></section><aside class="draft-order-panel"><div class="draft-panel-heading"><h3>Orden de elección</h3><span>Serpiente</span></div>${draft.order.map((teamId, index) => `<div class="draft-order-row ${teamId === draft.currentTeamId ? "is-current" : ""}"><span>#${index + 1}</span><strong>${getTeamName(teamId)}</strong>${teamId === draft.currentTeamId ? `<span class="badge badge-lime">TURNO</span>` : ""}</div>`).join("") || `<div class="draft-empty">El orden aparecerá al iniciar.</div>`}</aside></div>
      <section class="draft-history-panel"><div class="draft-panel-heading"><h3>Elecciones realizadas</h3><span>${draft.picks.length} picks</span></div>${picksHtml}</section>
    </div>`;

  container.querySelector("#btnStartDraft")?.addEventListener("click", () => {
    try { store.prepareDraft(); toast.show("Draft iniciado", "Los presidentes ya pueden elegir.", "lime"); renderAuctionView(container); } catch (error) { toast.show("No se puede iniciar", error.message, "red"); }
  });

  container.querySelectorAll(".draft-player-card.is-selectable").forEach((button) => button.addEventListener("click", () => {
    try { store.pickDraftPlayer(user.teamId, button.dataset.playerId); toast.show("Elección registrada", "El turno ha pasado al siguiente equipo.", "lime"); renderAuctionView(container); } catch (error) { toast.show("Draft", error.message, "red"); }
  }));

  if (draft.status === "live") {
    const timer = window.setInterval(() => {
      if (!document.body.contains(container)) return window.clearInterval(timer);
      if (store.expireDraftTurn()) { renderAuctionView(container); return; }
      const clock = container.querySelector("#draftClock");
      if (clock) clock.textContent = `00:${String(store.getDraftSecondsRemaining()).padStart(2, "0")}`;
    }, 1000);
    container.__draftTimer = timer;
  }
}