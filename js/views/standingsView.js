// ============================================================================
// KINGS LEAGUE IMEX - STANDINGS VIEW (TABLA DE CLASIFICACIÓN)
// ============================================================================

import { store } from "../state/store.js";

export function renderStandingsView(container) {
  let selectedGroup = null; // null = General, 'A' = Grupo A, 'B' = Grupo B

  function update() {
    const standings = store.getStandings(selectedGroup);

    const rowsHtml = standings.map((st) => `
      <tr class="standings-row row-zone-${st.zone}">
        <td class="standings-pos-col">
          <span style="display: flex; align-items: center; gap: 0.4rem;">
            #${st.pos}
            ${st.pos === 1 ? '👑' : ''}
          </span>
        </td>
        <td>
          <div class="standings-team-cell">
            <span class="standings-team-logo" style="background: ${st.team.logoBg}">
              ${st.team.logoText}
            </span>
            <div>
              <div class="standings-team-name">${st.name}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">${st.team.president} &bull; Gr. ${st.group}</div>
            </div>
          </div>
        </td>
        <td style="text-align: center;">${st.pj}</td>
        <td style="text-align: center; color: var(--color-lime); font-weight: 700;">${st.pg}</td>
        <td style="text-align: center; color: var(--color-yellow);">${st.pe}</td>
        <td style="text-align: center; color: var(--color-red);">${st.pp}</td>
        <td style="text-align: center;">${st.gf}</td>
        <td style="text-align: center;">${st.gc}</td>
        <td style="text-align: center; font-weight: 700; color: ${st.dg > 0 ? 'var(--color-lime)' : st.dg < 0 ? 'var(--color-red)' : 'inherit'}">
          ${st.dg > 0 ? '+' + st.dg : st.dg}
        </td>
        <td class="standings-pts-col" style="text-align: center;">${st.pts}</td>
        <td class="standings-money-col" style="text-align: right;">${st.balance}M</td>
      </tr>
    `).join("");

    container.innerHTML = `
      <div class="view-animate-fade">
        <div class="page-header">
          <div class="page-title-group">
            <span class="page-category-tag">TABLA OFICIAL</span>
            <h1 class="page-title">🏆 CLASIFICACIÓN KINGS LEAGUE IMEX</h1>
            <p class="page-subtitle">Actualización automática en tiempo real con cada resultado disputado.</p>
          </div>

          <!-- Selector de Grupos -->
          <div class="tab-nav" id="standingsGroupNav">
            <button class="tab-btn ${selectedGroup === null ? 'active' : ''}" data-group="all">TABLA GENERAL</button>
            <button class="tab-btn ${selectedGroup === 'A' ? 'active' : ''}" data-group="A">GRUPO A</button>
            <button class="tab-btn ${selectedGroup === 'B' ? 'active' : ''}" data-group="B">GRUPO B</button>
          </div>
        </div>

        <!-- Banner de Reglas de Puntuación & Economía -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
          <div style="background: rgba(0, 255, 102, 0.08); border: 1px solid rgba(0, 255, 102, 0.25); border-radius: var(--radius-xs); padding: 0.85rem 1.25rem; display: flex; align-items: center; gap: 0.85rem;">
            <span style="font-size: 1.8rem;">🥇</span>
            <div>
              <div style="font-weight: 800; color: var(--color-lime); font-size: 0.95rem;">VICTORIA: 3 PTS + 50M</div>
              <div style="font-size: 0.72rem; color: var(--text-secondary);">Premio económico ingresado a tesorería</div>
            </div>
          </div>

          <div style="background: rgba(255, 230, 0, 0.08); border: 1px solid rgba(255, 230, 0, 0.25); border-radius: var(--radius-xs); padding: 0.85rem 1.25rem; display: flex; align-items: center; gap: 0.85rem;">
            <span style="font-size: 1.8rem;">⚖️</span>
            <div>
              <div style="font-weight: 800; color: var(--color-yellow); font-size: 0.95rem;">EMPATE: 1 PT + 10M</div>
              <div style="font-size: 0.72rem; color: var(--text-secondary);">Reparto de puntos y bonificación</div>
            </div>
          </div>

          <div style="background: rgba(255, 46, 77, 0.08); border: 1px solid rgba(255, 46, 77, 0.25); border-radius: var(--radius-xs); padding: 0.85rem 1.25rem; display: flex; align-items: center; gap: 0.85rem;">
            <span style="font-size: 1.8rem;">❌</span>
            <div>
              <div style="font-weight: 800; color: var(--color-red); font-size: 0.95rem;">DERROTA: 0 PTS + 0M</div>
              <div style="font-size: 0.72rem; color: var(--text-secondary);">Sin ingreso económico</div>
            </div>
          </div>
        </div>

        <!-- Tabla Profesional -->
        <div class="standings-table-container">
          <table class="standings-table">
            <thead>
              <tr>
                <th style="width: 60px;">POS</th>
                <th>EQUIPO</th>
                <th style="text-align: center;">PJ</th>
                <th style="text-align: center;">PG</th>
                <th style="text-align: center;">PE</th>
                <th style="text-align: center;">PP</th>
                <th style="text-align: center;">GF</th>
                <th style="text-align: center;">GC</th>
                <th style="text-align: center;">DG</th>
                <th style="text-align: center;">PTS</th>
                <th style="text-align: right;">DINERO</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>

        <!-- Leyenda de Zonas -->
        <div class="standings-legend">
          <div class="legend-item">
            <span class="legend-indicator" style="background: var(--color-lime);"></span>
            <span style="color: var(--color-lime);">CLASIFICADO DIRECTO</span>
          </div>
          <div class="legend-item">
            <span class="legend-indicator" style="background: var(--color-yellow);"></span>
            <span style="color: var(--color-yellow);">EN ZONA DE SEMIFINAL</span>
          </div>
          <div class="legend-item">
            <span class="legend-indicator" style="background: var(--color-red);"></span>
            <span style="color: var(--color-red);">ZONA DE ELIMINACIÓN</span>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll("#standingsGroupNav .tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const grp = btn.dataset.group;
        selectedGroup = grp === "all" ? null : grp;
        update();
      });
    });
  }

  update();
}
