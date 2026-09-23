// ============================================================================
// KINGS LEAGUE IMEX - PRESIDENT VIEW ("MI EQUIPO" - MANAGER DASHBOARD)
// ============================================================================

import { store } from "../state/store.js";
import { toast } from "../components/toast.js";
import { openPlayerDetailModal } from "./playersView.js";

export function renderPresidentView(container) {
  const user = store.currentUser;
  const teamId = user.teamId || store.teams[0]?.id;
  const team = store.getTeamById(teamId);

  if (!team) {
    container.innerHTML = `
      <div class="view-animate-fade">
        <div class="page-header">
          <div class="page-title-group">
            <span class="page-category-tag">CLUB INEXISTENTE</span>
            <h1 class="page-title">⚠️ MI EQUIPO</h1>
            <p class="page-subtitle">No se pudo identificar el club del presidente actual.</p>
          </div>
        </div>
      </div>
    `;
    return;
  }

  const players = store.getTeamPlayers(team.id);
  const nextMatch = store.matches.find(
    (m) => m.status === "scheduled" && (m.homeTeamId === team.id || m.awayTeamId === team.id)
  );
  const teamFinances = store.finances.filter((f) => f.teamId === team.id).slice(0, 6);
  const pendingOffersReceived = store.market.transfers.filter(
    (t) => t.sellerTeamId === team.id && t.status === "pending"
  );
  const pendingOffersSent = store.market.transfers.filter(
    (t) => t.buyerTeamId === team.id && t.status === "pending"
  );

  const opponentTeam = nextMatch
    ? store.getTeamById(nextMatch.homeTeamId === team.id ? nextMatch.awayTeamId : nextMatch.homeTeamId)
    : null;

  container.innerHTML = `
    <div class="view-animate-fade">
      <!-- Cabecera Heroica del Manager -->
      <div class="president-hero-card">
        <div class="president-header-row">
          <div class="president-team-brand">
            <div style="width: 70px; height: 70px; border-radius: var(--radius-sm); background: ${team.logoBg || '#1A1A1A'}; display: flex; align-items: center; justify-content: center; font-size: 2.8rem; border: 2px solid var(--border-medium); box-shadow: var(--shadow-md);">
              ${team.logoText || '⚽'}
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--color-lime); font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
                PANEL DEL PRESIDENTE &bull; GRUPO ${team.group}
              </div>
              <h1 style="font-family: var(--font-display); font-size: 2.8rem; font-weight: 900; color: #fff; line-height: 1; letter-spacing: 1.5px; text-transform: uppercase;">
                ${team.name}
              </h1>
              <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">
                Presidente a cargo: <strong>${team.president}</strong>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <a href="#market" class="btn btn-lime">
              <span>💰 Ir al Mercado</span>
            </a>
            <a href="#matches" class="btn btn-outline">
              <span>⚽ Ver Calendario</span>
            </a>
          </div>
        </div>

        <!-- Módulos de Estado Tipo Videojuego / Sports Manager -->
        <div class="presi-stat-tiles">
          <div class="presi-tile">
            <span class="presi-tile-val" style="color: var(--color-lime);">${team.balance}M</span>
            <span class="presi-tile-lbl">💰 SALDO EN CARTERA</span>
            <span style="font-size: 0.68rem; color: var(--text-muted); margin-top: 0.35rem;">+50M Victoria &bull; +10M Empate</span>
          </div>

          <div class="presi-tile">
            <span class="presi-tile-val" style="color: var(--color-yellow);">${team.squadValue}M</span>
            <span class="presi-tile-lbl">VALOR DE PLANTILLA</span>
            <span style="font-size: 0.68rem; color: var(--text-muted); margin-top: 0.35rem;">Límite draft inicial: 200M</span>
          </div>

          <div class="presi-tile">
            <span class="presi-tile-val" style="color: ${team.clausulazoUsed ? 'var(--color-red)' : 'var(--color-lime)'}; font-size: 1.6rem;">
              ${team.clausulazoUsed ? 'UTILIZADO' : 'DISPONIBLE'}
            </span>
            <span class="presi-tile-lbl">CLAUSULAZO DE MERCADO</span>
            <span style="font-size: 0.68rem; color: var(--text-muted); margin-top: 0.35rem;">1 por ventana semanal</span>
          </div>

          <div class="presi-tile">
            <span class="presi-tile-val" style="font-size: 1.3rem; color: #fff;">
              ${nextMatch ? `VS ${opponentTeam?.name}` : 'SIN PARTIDO'}
            </span>
            <span class="presi-tile-lbl">PRÓXIMO PARTIDO</span>
            <span style="font-size: 0.68rem; color: var(--text-muted); margin-top: 0.35rem;">
              ${nextMatch ? `J0${nextMatch.matchday} &bull; ${nextMatch.pitch} &bull; ${nextMatch.time}` : 'Esperando asignación'}
            </span>
          </div>
        </div>
      </div>

      <!-- Ofertas Pendientes de Transferencia -->
      ${
        pendingOffersReceived.length > 0
          ? `
          <div style="background: var(--bg-secondary); border: 1px solid var(--color-yellow); border-radius: var(--radius-sm); padding: 1.5rem; margin-bottom: 2rem;">
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: var(--color-yellow); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
              <span>📩</span> OFERTAS RECIBIDAS POR TUS JUGADORES (${pendingOffersReceived.length})
            </h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${pendingOffersReceived.map((tr) => {
                const buyer = store.getTeamById(tr.buyerTeamId);
                const player = store.getPlayerById(tr.playerId);
                return `
                  <div style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: var(--radius-xs); padding: 1rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.75rem;">
                    <div>
                      <div style="font-weight: 800; color: #fff; font-size: 1rem;">${buyer?.name} ofrece ${tr.price}M por ${player?.name}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${tr.notes || 'Sin mensaje adicional'} (${tr.date})</div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                      <button class="btn btn-sm btn-lime btn-presi-accept-tr" data-tr-id="${tr.id}">Aceptar (${tr.price}M)</button>
                      <button class="btn btn-sm btn-red btn-presi-reject-tr" data-tr-id="${tr.id}">Rechazar</button>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        `
          : ""
      }

      <!-- Plantilla de Jugadores del Club -->
      <div style="margin-bottom: 2.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; text-transform: uppercase; color: #fff;">
            Plantilla Oficial (${players.length} Jugadores)
          </h3>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Haz clic en un jugador para ver su expediente</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.25rem;">
          ${players.map((p) => `
            <div class="player-card ${p.isInsignia ? 'is-insignia' : ''}" data-player-id="${p.id}" role="button" tabindex="0" aria-label="Ver ficha de ${p.name}">
              <div class="player-card-header">
                <span class="player-pos-badge pos-${p.position.toLowerCase()}">${p.position}</span>
                ${p.isInsignia ? `<span class="player-insignia-badge">⭐ INSIGNIA BLINDADO</span>` : `<span class="badge badge-metallic">TRANSFERIBLE</span>`}
              </div>

              <div class="player-visual" style="height: 110px;">
                <span class="player-big-number">${p.number}</span>
                <div class="player-avatar-circle" style="width: 70px; height: 70px; font-size: 1.8rem;">
                  ${p.isInsignia ? '👑' : '⚽'}
                </div>
              </div>

              <div class="player-info">
                <div class="player-name">${p.name}</div>
              </div>

              <div class="player-value-strip">
                <span class="player-value-label">Valor en Plantilla</span>
                <span class="player-value-amount">${p.value}M</span>
              </div>

              <div class="player-card-stats">
                <div class="stat-item">
                  <span class="stat-val" style="color: var(--color-lime);">${p.goals}</span>
                  <span class="stat-lbl">Goles</span>
                </div>
                <div class="stat-item">
                  <span class="stat-val">${p.assists || 0}</span>
                  <span class="stat-lbl">Asist</span>
                </div>
                <div class="stat-item">
                  <span class="stat-val">${p.matchesPlayed || 1}</span>
                  <span class="stat-lbl">PJ</span>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Resumen Financiero del Club -->
      <div>
        <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800; text-transform: uppercase; margin-bottom: 1rem; color: #fff;">
          Libro Mayor de tu Cartera
        </h3>
        <div class="standings-table-container">
          <table class="standings-table">
            <thead>
              <tr>
                <th>FECHA</th>
                <th>CONCEPTO</th>
                <th>TIPO</th>
                <th style="text-align: right;">IMPORTE</th>
              </tr>
            </thead>
            <tbody>
              ${
                teamFinances.length === 0
                  ? `<tr><td colspan="4" style="text-align: center; padding: 1.5rem;">Sin movimientos en el historial</td></tr>`
                  : teamFinances.map((f) => `
                    <tr class="standings-row">
                      <td style="font-size: 0.75rem; color: var(--text-muted);">${f.date}</td>
                      <td style="font-weight: 700; color: #fff;">${f.concept}</td>
                      <td><span class="badge ${f.type === 'income' ? 'badge-lime' : 'badge-red'}">${f.type.toUpperCase()}</span></td>
                      <td style="text-align: right; font-family: var(--font-display); font-size: 1.2rem; font-weight: 800; color: ${f.type === 'income' ? 'var(--color-lime)' : 'var(--color-red)'}">
                        ${f.type === 'income' ? '+' : '-'}${f.amount}M
                      </td>
                    </tr>
                  `).join("")
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Interacciones
  container.querySelectorAll(".player-card").forEach((card) => {
    const openCard = () => {
      openPlayerDetailModal(card.dataset.playerId);
    };
    card.addEventListener("click", openCard);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCard();
      }
    });
  });

  container.querySelectorAll(".btn-presi-accept-tr").forEach((btn) => {
    btn.addEventListener("click", () => {
      try {
        store.respondTransfer(btn.dataset.trId, "accept");
        toast.show("Transferencia Aceptada", "Has completado la venta del jugador.", "lime");
        renderPresidentView(container);
      } catch (err) {
        toast.show("Error", err.message, "red");
      }
    });
  });

  container.querySelectorAll(".btn-presi-reject-tr").forEach((btn) => {
    btn.addEventListener("click", () => {
      try {
        store.respondTransfer(btn.dataset.trId, "reject");
        toast.show("Oferta Rechazada", "Has descartado la propuesta de traspaso.", "yellow");
        renderPresidentView(container);
      } catch (err) {
        toast.show("Error", err.message, "red");
      }
    });
  });
}
