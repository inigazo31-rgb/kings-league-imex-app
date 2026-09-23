// ============================================================================
// KINGS LEAGUE IMEX - HOME VIEW
// ============================================================================

import { store } from "../state/store.js";
import { startLiveCountdown } from "../components/countdown.js";

export function renderHomeView(container) {
  const league = store.league;
  const nextMatch = store.getNextMatch();
  const recentMatches = store.matches
    .filter((m) => m.status === "finished")
    .slice(-4)
    .reverse();
  const standingsPreview = store.getStandings().slice(0, 4);
  const topScorers = store.getTopScorers(3);
  const announcements = store.announcements.slice(0, 2);

  // Home Hero Banner
  const heroHtml = `
    <div class="hero-banner">
      <div class="hero-content">
        <div class="hero-tag">
          <span>⚡</span>
          <span>${league.format}</span>
        </div>
        <h1 class="hero-title">
          ${league.name.split(" ")[0]} <span class="highlight">${league.name.split(" ").slice(1).join(" ")}</span>
        </h1>
        <p class="hero-tagline">${league.tagline}</p>
        <div class="hero-actions">
          <a href="#matches" class="btn btn-lime">
            <span>⚽ Ver Jornadas</span>
          </a>
          <a href="#market" class="btn btn-outline">
            <span>💰 Mercado & Clausulazos</span>
          </a>
          <a href="#standings" class="btn btn-outline">
            <span>🏆 Clasificación</span>
          </a>
        </div>
      </div>
    </div>
  `;

  // Widget Próximo Partido con Countdown
  let nextMatchHtml = "";
  if (nextMatch) {
    const homeTeam = store.getTeamById(nextMatch.homeTeamId);
    const awayTeam = store.getTeamById(nextMatch.awayTeamId);

    nextMatchHtml = `
      <div class="featured-match-widget">
        <div class="featured-match-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="badge badge-yellow">PRÓXIMO PARTIDO</span>
            <span style="font-size: 0.8rem; font-weight: 800; color: #fff;">JORNADA 0${nextMatch.matchday || 2}</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">
            📍 ${nextMatch.pitch} &bull; ⏰ ${nextMatch.time} hrs &bull; 📅 ${nextMatch.date}
          </div>
        </div>

        <div class="featured-match-grid">
          <div class="featured-team-block">
            <div class="featured-team-avatar" style="background: ${homeTeam?.logoBg || '#1A1A1A'}">
              ${homeTeam?.logoText || '⚽'}
            </div>
            <div>
              <div class="featured-team-title">${homeTeam?.name || 'Local'}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Pres: ${homeTeam?.president}</div>
            </div>
          </div>

          <div class="featured-center-block">
            <div class="match-vs-display">VS</div>
            <div id="homeNextMatchCountdown"></div>
          </div>

          <div class="featured-team-block away">
            <div class="featured-team-avatar" style="background: ${awayTeam?.logoBg || '#1A1A1A'}">
              ${awayTeam?.logoText || '⚽'}
            </div>
            <div>
              <div class="featured-team-title">${awayTeam?.name || 'Visitante'}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Pres: ${awayTeam?.president}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    nextMatchHtml = `
      <div class="featured-match-widget" style="text-align: center; padding: 2.5rem;">
        <div style="font-family: var(--font-display); font-size: 2.2rem; color: var(--color-lime);">PRÓXIMAMENTE</div>
        <p style="color: var(--text-secondary); margin-top: 0.5rem;">No hay partidos programados en este momento. Consulta las próximas fechas con el organizador.</p>
      </div>
    `;
  }

  // Tarjetas de Resultados Recientes
  const recentResultsHtml = recentMatches.map((m) => {
    const homeTeam = store.getTeamById(m.homeTeamId);
    const awayTeam = store.getTeamById(m.awayTeamId);
    const mvp = store.getPlayerById(m.mvpPlayerId);

    const cardsHtml = m.cardsUsed && m.cardsUsed.length > 0
      ? m.cardsUsed.map((c) => `<span class="event-chip card-event">🃏 ${c.cardName}</span>`).join("")
      : "";

    const diceHtml = m.diceEvent
      ? `<span class="event-chip dice-event">🎲 ${m.diceEvent}</span>`
      : "";

    return `
      <div class="match-card">
        <div class="match-card-top">
          <span class="match-matchday-label">JORNADA 0${m.matchday}</span>
          <span class="badge badge-lime">FINALIZADO</span>
        </div>

        <div class="match-scoreboard">
          <div class="match-team">
            <div class="match-team-logo" style="background: ${homeTeam?.logoBg || '#1A1A1A'}">
              ${homeTeam?.logoText || '⚽'}
            </div>
            <span class="match-team-name">${homeTeam?.name}</span>
          </div>

          <div class="match-score-center">
            <div class="match-score-display">${m.homeScore} - ${m.awayScore}</div>
            <span style="font-size: 0.7rem; color: var(--text-muted);">Fútbol 7</span>
          </div>

          <div class="match-team away">
            <div class="match-team-logo" style="background: ${awayTeam?.logoBg || '#1A1A1A'}">
              ${awayTeam?.logoText || '⚽'}
            </div>
            <span class="match-team-name">${awayTeam?.name}</span>
          </div>
        </div>

        <div class="match-card-footer">
          <div class="match-special-events">
            ${cardsHtml}
            ${diceHtml}
          </div>
          ${mvp ? `<div style="color: var(--color-yellow); font-weight: 700; font-size: 0.72rem;">⭐ MVP: ${mvp.name}</div>` : ""}
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="view-animate-fade">
      ${heroHtml}
      ${nextMatchHtml}

      <!-- Sección de Resultados Recientes -->
      <div style="margin-bottom: 2.5rem;">
        <div class="home-section-title">
          <h3>⚽ RESULTADOS RECIENTES</h3>
          <a href="#matches" class="btn btn-sm btn-outline">Ver Todos</a>
        </div>
        <div class="matches-grid-2col">
          ${recentResultsHtml}
        </div>
      </div>

      <!-- Quick Dual Grid: Clasificación y Goleadores -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 2rem; margin-bottom: 2.5rem;">
        <div>
          <div class="home-section-title">
            <h3>🏆 CLASIFICACIÓN GENERAL</h3>
            <a href="#standings" class="btn btn-sm btn-outline-lime">Tabla Completa</a>
          </div>
          <div class="standings-table-container">
            <table class="standings-table">
              <thead>
                <tr>
                  <th>POS</th>
                  <th>EQUIPO</th>
                  <th>PTS</th>
                  <th>DINERO</th>
                </tr>
              </thead>
              <tbody>
                ${standingsPreview.map((st) => `
                  <tr class="standings-row row-zone-${st.zone}">
                    <td class="standings-pos-col">#${st.pos}</td>
                    <td>
                      <div class="standings-team-cell">
                        <span class="standings-team-logo" style="background: ${st.team.logoBg}">${st.team.logoText}</span>
                        <span class="standings-team-name">${st.name}</span>
                      </div>
                    </td>
                    <td class="standings-pts-col">${st.pts}</td>
                    <td class="standings-money-col">${st.balance}M</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div class="home-section-title">
            <h3>⚡ LÍDERES DE GOLEO</h3>
            <a href="#scorers" class="btn btn-sm btn-outline-lime">Ranking</a>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${topScorers.map((sc, i) => `
              <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-xs); padding: 0.85rem 1.25rem; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 0.85rem;">
                  <span style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: ${i === 0 ? '#FFD700' : 'var(--text-muted)'}; width: 25px;">#${sc.pos}</span>
                  <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 800; font-size: 0.95rem; color: #fff;">${sc.player.name} ${sc.player.isInsignia ? '⭐' : ''}</span>
                    <span style="font-size: 0.72rem; color: var(--text-muted);">${sc.team?.name}</span>
                  </div>
                </div>
                <div style="text-align: right;">
                  <span style="font-family: var(--font-display); font-size: 1.6rem; font-weight: 900; color: var(--color-lime);">${sc.goals}</span>
                  <span style="font-size: 0.65rem; color: var(--text-muted); display: block; text-transform: uppercase;">Goles</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- Anuncios Recientes -->
      <div style="margin-bottom: 2rem;">
        <div class="home-section-title">
          <h3>📢 COMUNICADOS OFICIALES</h3>
          <a href="#announcements" class="btn btn-sm btn-outline">Ver Noticias</a>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1rem;">
          ${announcements.map((a) => `
            <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1.25rem; clip-path: var(--clip-badge);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span class="badge badge-lime">${a.category}</span>
                <span style="font-size: 0.7rem; color: var(--text-muted);">${a.date}</span>
              </div>
              <h4 style="font-family: var(--font-heading); font-size: 1rem; font-weight: 800; margin-bottom: 0.4rem; color: #fff;">${a.title}</h4>
              <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">${a.content.substring(0, 110)}...</p>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;

  // Iniciar cuenta regresiva en vivo si existe próximo partido
  if (nextMatch) {
    const countdownEl = container.querySelector("#homeNextMatchCountdown");
    if (countdownEl) {
      startLiveCountdown(`${nextMatch.date}T${nextMatch.time}`, countdownEl);
    }
  }
}
