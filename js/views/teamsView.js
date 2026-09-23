// ============================================================================
// KINGS LEAGUE IMEX - TEAMS VIEW
// ============================================================================

import { store } from "../state/store.js";
import { modal } from "../components/modal.js";

export function renderTeamsView(container) {
  const teams = store.teams;
  const standings = store.getStandings();

  const teamsCardsHtml = teams.map((t) => {
    const st = standings.find((s) => s.teamId === t.id) || { pts: 0, pj: 0, pg: 0 };
    const players = store.getTeamPlayers(t.id);
    const insignia = store.getInsigniaPlayer(t.id);

    return `
      <div class="team-card" data-team-id="${t.id}" role="button" tabindex="0" aria-label="Ver club ${t.name}">
        <div class="team-card-banner" style="background: ${t.color}"></div>

        <div class="team-card-header">
          <div class="team-logo-avatar" style="background: ${t.logoBg || '#1A1A1A'}">
            ${t.crestUrl ? `<img src="${t.crestUrl}" alt="Escudo de ${t.name}" style="width: 70%; height: 70%; object-fit: contain;" />` : (t.logoText || '⚽')}
          </div>
          <div class="team-meta-info">
            <span class="badge badge-metallic" style="align-self: flex-start; margin-bottom: 0.25rem;">GRUPO ${t.group}</span>
            <h3 class="team-card-name">${t.name}</h3>
            <span class="team-card-presi">Presidente: <strong>${t.president}</strong></span>
          </div>
        </div>

        <div class="team-stats-grid">
          <div class="team-stat-box">
            <span class="team-stat-num" style="color: #FFFFFF;">${st.pts} PTS</span>
            <span class="team-stat-title">Puntos (${st.pj} PJ)</span>
          </div>
          <div class="team-stat-box">
            <span class="team-stat-num" style="color: var(--color-lime);">${t.balance}M</span>
            <span class="team-stat-title">Saldo en Cartera</span>
          </div>
          <div class="team-stat-box">
            <span class="team-stat-num" style="color: var(--color-yellow);">${t.squadValue}M</span>
            <span class="team-stat-title">Valor Plantilla</span>
          </div>
          <div class="team-stat-box">
            <span class="team-stat-num" style="color: #38BDF8;">${players.length}</span>
            <span class="team-stat-title">Jugadores</span>
          </div>
        </div>

        ${
          insignia
            ? `<div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; background: rgba(255, 215, 0, 0.08); border: 1px solid rgba(255, 215, 0, 0.25); border-radius: var(--radius-xs); margin-bottom: 1rem;">
                <span style="font-size: 0.72rem; color: #FFD700; font-weight: 700;">⭐ INSIGNIA:</span>
                <span style="font-size: 0.78rem; font-weight: 800; color: #FFFFFF;">${insignia.name}</span>
               </div>`
            : ""
        }

        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 0.85rem; margin-top: auto;">
          <span class="badge ${t.clausulazoUsed ? 'badge-red' : 'badge-lime'}">
            ${t.clausulazoUsed ? 'CLAUSULAZO UTILIZADO' : 'CLAUSULAZO DISPONIBLE'}
          </span>
          <button class="btn btn-sm btn-outline-lime btn-view-team" data-team-id="${t.id}">
            Ver Club →
          </button>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="view-animate-fade">
      <div class="page-header">
        <div class="page-title-group">
          <span class="page-category-tag">CLUBS PARTICIPANTES</span>
          <h1 class="page-title">🛡️ EQUIPOS DE KINGS LEAGUE IMEX</h1>
          <p class="page-subtitle">8 clubes escolares compitiendo por la gloria, con presidentes, presupuestos y plantillas.</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
        ${teamsCardsHtml}
      </div>
    </div>
  `;

  container.querySelectorAll(".team-card").forEach((card) => {
    const openCard = () => {
      const teamId = card.dataset.teamId;
      openTeamDetailModal(teamId);
    };
    card.addEventListener("click", openCard);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCard();
      }
    });
  });
}

// Modal Detallado del Equipo
export function openTeamDetailModal(teamId) {
  const team = store.getTeamById(teamId);
  if (!team) return;

  const players = store.getTeamPlayers(team.id);
  const teamFinances = store.finances.filter((f) => f.teamId === team.id).slice(0, 5);
  const standings = store.getStandings();
  const st = standings.find((s) => s.teamId === team.id) || { pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, dg: 0 };

  const playersListHtml = players.map((p) => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: var(--radius-xs);">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span class="player-pos-badge pos-${p.position.toLowerCase()}">${p.position}</span>
        <span style="font-family: var(--font-display); font-size: 1.2rem; font-weight: 800; color: var(--text-muted); width: 24px;">#${p.number}</span>
        <div>
          <span style="font-weight: 800; color: #fff; font-size: 0.9rem;">${p.name}</span>
          ${p.isInsignia ? `<span class="badge badge-gold" style="margin-left: 0.4rem;">⭐ INSIGNIA</span>` : ""}
          <div style="font-size: 0.7rem; color: var(--text-muted);">${p.goals} goles &bull; ${p.yellowCards}🟨 ${p.redCards}🟥</div>
        </div>
      </div>
      <div style="font-family: var(--font-display); font-size: 1.2rem; font-weight: 800; color: var(--color-lime);">
        ${p.value}M
      </div>
    </div>
  `).join("");

  const financesHtml = teamFinances.map((f) => `
    <div style="display: flex; justify-content: space-between; font-size: 0.76rem; padding: 0.35rem 0; border-bottom: 1px solid rgba(255,255,255,0.04);">
      <span style="color: var(--text-secondary);">${f.concept}</span>
      <span style="font-weight: 800; color: ${f.type === 'income' ? 'var(--color-lime)' : 'var(--color-red)'}">
        ${f.type === 'income' ? '+' : '-'}${f.amount}M
      </span>
    </div>
  `).join("");

  modal.open({
    title: `<div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-size: 1.6rem;">${team.crestUrl ? `<img src="${team.crestUrl}" alt="Escudo de ${team.name}" style="width: 32px; height: 32px; object-fit: contain;" />` : team.logoText}</span>
              <span>${team.name.toUpperCase()} (FICHA OFICIAL)</span>
            </div>`,
    size: "large",
    bodyHtml: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- Resumen Cabecera -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; background: rgba(0,0,0,0.4); padding: 1rem; border-radius: var(--radius-xs); border: 1px solid var(--border-subtle);">
          <div>
            <div style="font-size: 0.68rem; color: var(--text-muted); font-weight: 700;">PRESIDENTE</div>
            <div style="font-weight: 800; color: #fff; font-size: 0.95rem;">${team.president}</div>
          </div>
          <div>
            <div style="font-size: 0.68rem; color: var(--text-muted); font-weight: 700;">GRUPO</div>
            <div style="font-weight: 800; color: var(--color-yellow); font-size: 0.95rem;">GRUPO ${team.group}</div>
          </div>
          <div>
            <div style="font-size: 0.68rem; color: var(--text-muted); font-weight: 700;">SALDO EN CARTERA</div>
            <div style="font-family: var(--font-display); font-size: 1.3rem; color: var(--color-lime); font-weight: 800;">${team.balance}M</div>
          </div>
          <div>
            <div style="font-size: 0.68rem; color: var(--text-muted); font-weight: 700;">VALOR PLANTILLA</div>
            <div style="font-family: var(--font-display); font-size: 1.3rem; color: var(--color-yellow); font-weight: 800;">${team.squadValue}M</div>
          </div>
          <div>
            <div style="font-size: 0.68rem; color: var(--text-muted); font-weight: 700;">CLAUSULAZO</div>
            <div><span class="badge ${team.clausulazoUsed ? 'badge-red' : 'badge-lime'}">${team.clausulazoUsed ? 'UTILIZADO' : 'DISPONIBLE'}</span></div>
          </div>
        </div>

        <!-- Plantilla -->
        <div>
          <h4 style="font-family: var(--font-heading); font-size: 0.95rem; font-weight: 800; margin-bottom: 0.75rem; color: #fff; text-transform: uppercase;">
            Plantilla Oficial (${players.length} futbolistas &bull; Total: ${team.squadValue}M)
          </h4>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 280px; overflow-y: auto; padding-right: 0.3rem;">
            ${playersListHtml}
          </div>
        </div>

        <!-- Movimientos Financieros Recientes -->
        <div>
          <h4 style="font-family: var(--font-heading); font-size: 0.95rem; font-weight: 800; margin-bottom: 0.5rem; color: #fff; text-transform: uppercase;">
            Últimos Movimientos Financieros
          </h4>
          <div style="background: var(--bg-tertiary); padding: 0.75rem 1rem; border-radius: var(--radius-xs); border: 1px solid var(--border-subtle);">
            ${financesHtml || '<span style="color: var(--text-muted); font-size: 0.75rem;">Sin movimientos recientes.</span>'}
          </div>
        </div>
      </div>
    `,
    footerHtml: `
      <button class="btn btn-outline" onclick="document.getElementById('globalModalCloseBtn').click()">Cerrar</button>
    `,
  });
}
