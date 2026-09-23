// ============================================================================
// KINGS LEAGUE IMEX - SCORERS VIEW (TABLA DE GOLEADORES & PICHICHI)
// ============================================================================

import { store } from "../state/store.js";

export function renderScorersView(container) {
  const topScorers = store.getTopScorers(30);

  const top3 = topScorers.slice(0, 3);
  const rest = topScorers.slice(3);

  // Podio Top 3
  const podiumHtml = top3.length === 0
    ? ""
    : `
      <div class="scorers-podium">
        <!-- 2do Lugar -->
        ${
          top3[1]
            ? `
            <div class="podium-card rank-2">
              <span class="podium-rank-badge">#2</span>
              <div class="podium-avatar">🥈</div>
              <h4 style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 800; color: #fff;">${top3[1].player.name}</h4>
              <span style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.75rem;">${top3[1].team?.name}</span>
              <div class="podium-goals">${top3[1].goals}</div>
              <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Goles Marcados</span>
            </div>
          `
            : "<div></div>"
        }

        <!-- 1er Lugar (Rey del Gol) -->
        ${
          top3[0]
            ? `
            <div class="podium-card rank-1">
              <span class="podium-rank-badge">👑 #1</span>
              <div class="podium-avatar" style="border-color: #FFD700; font-size: 2.5rem;">👑</div>
              <h4 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 900; color: #FFD700;">${top3[0].player.name}</h4>
              <span style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem;">${top3[0].team?.name}</span>
              <div class="podium-goals">${top3[0].goals}</div>
              <span style="font-size: 0.72rem; color: var(--color-lime); text-transform: uppercase; font-weight: 800;">LÍDER EN SOLITARIO</span>
            </div>
          `
            : "<div></div>"
        }

        <!-- 3er Lugar -->
        ${
          top3[2]
            ? `
            <div class="podium-card rank-3">
              <span class="podium-rank-badge">#3</span>
              <div class="podium-avatar">🥉</div>
              <h4 style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 800; color: #fff;">${top3[2].player.name}</h4>
              <span style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.75rem;">${top3[2].team?.name}</span>
              <div class="podium-goals">${top3[2].goals}</div>
              <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Goles Marcados</span>
            </div>
          `
            : "<div></div>"
        }
      </div>
    `;

  // Tabla completa
  const tableRowsHtml = topScorers.map((sc) => `
    <tr class="standings-row">
      <td class="standings-pos-col" style="font-size: 1rem; color: ${sc.pos <= 3 ? '#FFD700' : 'var(--text-muted)'};">
        #${sc.pos}
      </td>
      <td>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.2rem;">${sc.player.isInsignia ? '⭐' : '⚽'}</span>
          <div>
            <div style="font-weight: 800; color: #fff; font-size: 0.95rem;">${sc.player.name}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${sc.player.position} &bull; #${sc.player.number}</div>
          </div>
        </div>
      </td>
      <td style="font-weight: 700; color: var(--text-secondary);">${sc.team?.name || 'Libre'}</td>
      <td style="text-align: center; font-family: var(--font-display); font-size: 1.5rem; color: var(--color-lime); font-weight: 900;">
        ${sc.goals}
      </td>
      <td style="text-align: center; color: var(--text-secondary);">${sc.assists}</td>
      <td style="text-align: center; color: var(--text-secondary);">${sc.matches}</td>
      <td style="text-align: center; font-weight: 700; color: var(--color-yellow);">${sc.average}</td>
      <td style="text-align: center;">
        <span style="color: var(--color-yellow); font-weight: 700;">${sc.yellowCards}🟨</span>
        <span style="color: var(--color-red); font-weight: 700; margin-left: 0.3rem;">${sc.redCards}🟥</span>
      </td>
    </tr>
  `).join("");

  container.innerHTML = `
    <div class="view-animate-fade">
      <div class="page-header">
        <div class="page-title-group">
          <span class="page-category-tag">ESTADÍSTICAS INDIVIDUALES</span>
          <h1 class="page-title">⚡ TABLA DE GOLEADORES</h1>
          <p class="page-subtitle">Ranking oficial de artilleros de la KINGS LEAGUE IMEX. Se actualiza con cada pitazo final.</p>
        </div>
      </div>

      <!-- Podio -->
      ${podiumHtml}

      <!-- Tabla Completa de Goleo -->
      <div class="standings-table-container">
        <table class="standings-table">
          <thead>
            <tr>
              <th style="width: 50px;">POS</th>
              <th>JUGADOR</th>
              <th>EQUIPO</th>
              <th style="text-align: center;">GOLES</th>
              <th style="text-align: center;">ASIST</th>
              <th style="text-align: center;">PARTIDOS</th>
              <th style="text-align: center;">PROMEDIO</th>
              <th style="text-align: center;">TARJETAS</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml || '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No hay goles registrados aún.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
