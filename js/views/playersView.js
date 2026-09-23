// ============================================================================
// KINGS LEAGUE IMEX - PLAYERS VIEW (CARDS COLECCIONABLES)
// ============================================================================

import { store } from "../state/store.js";
import { modal } from "../components/modal.js";

export function renderPlayersView(container) {
  let selectedTeam = "all";
  let selectedPos = "all";
  let onlyInsignias = false;
  let searchTerm = "";

  function update() {
    let list = [...store.players];

    if (selectedTeam !== "all") {
      list = list.filter((p) => p.teamId === selectedTeam);
    }
    if (selectedPos !== "all") {
      list = list.filter((p) => p.position === selectedPos);
    }
    if (onlyInsignias) {
      list = list.filter((p) => p.isInsignia);
    }
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(term));
    }

    const cardsHtml = list.length === 0
      ? `<div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted);">No se encontraron jugadores con los filtros seleccionados.</div>`
      : list.map((p) => {
          const team = store.getTeamById(p.teamId);
          return `
            <div class="player-card ${p.isInsignia ? 'is-insignia' : ''}" data-player-id="${p.id}">
              <div class="player-card-header">
                <span class="player-pos-badge pos-${p.position.toLowerCase()}">${p.position}</span>
                ${
                  p.isInsignia
                    ? `<span class="player-insignia-badge">⭐ INSIGNIA</span>`
                    : `<span class="badge badge-metallic">${p.status === 'available' ? 'DISPONIBLE' : 'TRANSFERIBLE'}</span>`
                }
              </div>

              <div class="player-visual">
                <span class="player-big-number">${p.number}</span>
                <div class="player-avatar-circle">
                  ${p.isInsignia ? '👑' : p.position === 'POR' ? '🧤' : '⚽'}
                </div>
              </div>

              <div class="player-info">
                <div class="player-team-pill">
                  <span>${team?.logoText || '⚽'}</span>
                  <span>${team?.name || 'Agente Libre'}</span>
                </div>
                <div class="player-name">${p.name}</div>
              </div>

              <div class="player-value-strip">
                <span class="player-value-label">Cláusula de Rescisión</span>
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
                  <span class="stat-val">${p.yellowCards}🟨 ${p.redCards}🟥</span>
                  <span class="stat-lbl">Tarjetas</span>
                </div>
              </div>
            </div>
          `;
        }).join("");

    container.innerHTML = `
      <div class="view-animate-fade">
        <div class="page-header">
          <div class="page-title-group">
            <span class="page-category-tag">COLECCIÓN DE CRACKS</span>
            <h1 class="page-title">👤 JUGADORES KINGS LEAGUE IMEX</h1>
            <p class="page-subtitle">56 futbolistas escolares valorados económicamente. Tarjetas deportivas con estadísticas oficiales.</p>
          </div>
        </div>

        <!-- Filtros y Búsqueda -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1.25rem; margin-bottom: 2rem; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between;">
          <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center;">
            <select id="filterTeamSelect" class="form-select" style="width: auto; min-width: 170px;">
              <option value="all">Todos los Equipos</option>
              ${store.teams.map((t) => `<option value="${t.id}" ${selectedTeam === t.id ? 'selected' : ''}>${t.name}</option>`).join("")}
            </select>

            <select id="filterPosSelect" class="form-select" style="width: auto; min-width: 140px;">
              <option value="all" ${selectedPos === 'all' ? 'selected' : ''}>Posición</option>
              <option value="POR" ${selectedPos === 'POR' ? 'selected' : ''}>Porteros (POR)</option>
              <option value="DEF" ${selectedPos === 'DEF' ? 'selected' : ''}>Defensas (DEF)</option>
              <option value="MED" ${selectedPos === 'MED' ? 'selected' : ''}>Medios (MED)</option>
              <option value="DEL" ${selectedPos === 'DEL' ? 'selected' : ''}>Delanteros (DEL)</option>
            </select>

            <button class="btn btn-sm ${onlyInsignias ? 'btn-yellow' : 'btn-outline'}" id="btnToggleInsignias">
              ⭐ Solo Insignias
            </button>
          </div>

          <div style="min-width: 220px; flex: 1; max-width: 320px;">
            <input type="text" id="inputSearchPlayer" class="form-control" placeholder="Buscar jugador por nombre..." value="${searchTerm}" />
          </div>
        </div>

        <!-- Grid de Cards Deportivas -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem;">
          ${cardsHtml}
        </div>
      </div>
    `;

    // Listeners
    container.querySelector("#filterTeamSelect").addEventListener("change", (e) => {
      selectedTeam = e.target.value;
      update();
    });

    container.querySelector("#filterPosSelect").addEventListener("change", (e) => {
      selectedPos = e.target.value;
      update();
    });

    container.querySelector("#btnToggleInsignias").addEventListener("click", () => {
      onlyInsignias = !onlyInsignias;
      update();
    });

    const searchInp = container.querySelector("#inputSearchPlayer");
    searchInp.addEventListener("input", (e) => {
      searchTerm = e.target.value;
      // debounce simple
      setTimeout(update, 300);
    });

    container.querySelectorAll(".player-card").forEach((card) => {
      card.addEventListener("click", () => {
        const playerId = card.dataset.playerId;
        openPlayerDetailModal(playerId);
      });
    });
  }

  update();
}

// Modal de Ficha Técnica del Jugador
export function openPlayerDetailModal(playerId) {
  const player = store.getPlayerById(playerId);
  if (!player) return;

  const team = store.getTeamById(player.teamId);
  const transferHistory = store.market.transfers.filter((t) => t.playerId === player.id);

  modal.open({
    title: `<div style="display: flex; align-items: center; gap: 0.6rem;">
              <span>${player.isInsignia ? '⭐' : '⚽'}</span>
              <span>FICHA TÉCNICA: ${player.name.toUpperCase()} (#${player.number})</span>
            </div>`,
    bodyHtml: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="display: grid; grid-template-columns: 100px 1fr; gap: 1.25rem; align-items: center;">
          <div style="width: 100px; height: 100px; border-radius: var(--radius-sm); background: var(--bg-tertiary); border: 2px solid ${player.isInsignia ? '#FFD700' : 'var(--border-medium)'}; display: flex; align-items: center; justify-content: center; font-size: 3rem;">
            ${player.isInsignia ? '👑' : '⚽'}
          </div>
          <div>
            <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem;">
              <span class="player-pos-badge pos-${player.position.toLowerCase()}">${player.position}</span>
              ${player.isInsignia ? `<span class="badge badge-gold">⭐ INSIGNIA PROTEGIDO</span>` : `<span class="badge badge-lime">TRANSFERIBLE</span>`}
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff;">${player.name}</h3>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">Club: <strong>${team?.name || 'Agente Libre'}</strong></div>
          </div>
        </div>

        <!-- Métricas Principales -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; text-align: center; background: rgba(0,0,0,0.4); padding: 1rem; border-radius: var(--radius-xs); border: 1px solid var(--border-subtle);">
          <div>
            <div style="font-family: var(--font-display); font-size: 1.8rem; color: var(--color-lime); font-weight: 800;">${player.value}M</div>
            <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Cláusula</div>
          </div>
          <div>
            <div style="font-family: var(--font-display); font-size: 1.8rem; color: #fff; font-weight: 800;">${player.goals}</div>
            <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Goles</div>
          </div>
          <div>
            <div style="font-family: var(--font-display); font-size: 1.8rem; color: #fff; font-weight: 800;">${player.assists || 0}</div>
            <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Asistencias</div>
          </div>
          <div>
            <div style="font-family: var(--font-display); font-size: 1.8rem; color: #fff; font-weight: 800;">${player.matchesPlayed || 1}</div>
            <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Partidos</div>
          </div>
        </div>

        <!-- Estado de Protección -->
        <div style="padding: 1rem; border-radius: var(--radius-xs); background: ${player.isInsignia ? 'rgba(255, 215, 0, 0.08)' : 'rgba(0, 255, 102, 0.06)'}; border: 1px solid ${player.isInsignia ? 'rgba(255, 215, 0, 0.3)' : 'rgba(0, 255, 102, 0.2)'}; font-size: 0.82rem; line-height: 1.4;">
          ${
            player.isInsignia
              ? `🛡️ <strong>JUGADOR INSIGNIA BLINDADO:</strong> Este jugador no puede ser transferido, ni intercambiado, ni recibir clausulazo. Permanece 100% protegido mientras su equipo continúe en el torneo.`
              : `⚡ <strong>DISPONIBLE EN EL MERCADO:</strong> Cualquier club con presupuesto suficiente puede realizar una oferta formal o ejecutar su único clausulazo de rescisión (${player.value}M).`
          }
        </div>

        <!-- Historial de Fichajes -->
        <div>
          <h4 style="font-family: var(--font-heading); font-size: 0.9rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem; text-transform: uppercase;">
            Historial en el Mercado
          </h4>
          <div style="background: var(--bg-tertiary); padding: 0.75rem 1rem; border-radius: var(--radius-xs); border: 1px solid var(--border-subtle);">
            ${
              transferHistory.length === 0
                ? `<span style="font-size: 0.76rem; color: var(--text-muted);">Sin movimientos de mercado registrados para este jugador.</span>`
                : transferHistory.map((tr) => `
                  <div style="font-size: 0.76rem; padding: 0.4rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--text-secondary);">
                    <strong>${tr.type.toUpperCase()}:</strong> ${tr.notes} (${tr.date})
                  </div>
                `).join("")
            }
          </div>
        </div>
      </div>
    `,
    footerHtml: `
      <button class="btn btn-outline" onclick="document.getElementById('globalModalCloseBtn').click()">Cerrar</button>
    `,
  });
}
