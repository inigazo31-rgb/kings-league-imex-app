// ============================================================================
// KINGS LEAGUE IMEX - ANNOUNCEMENTS VIEW (NOTICIAS & COMUNICADOS)
// ============================================================================

import { store } from "../state/store.js";

export function renderAnnouncementsView(container) {
  const announcements = store.announcements;

  const announcementsListHtml = announcements.map((a) => {
    let catBadgeClass = "badge-metallic";
    if (a.category === "MERCADO") catBadgeClass = "badge-lime";
    if (a.category === "SANCIONES") catBadgeClass = "badge-red";
    if (a.category === "HORARIOS") catBadgeClass = "badge-yellow";

    return `
      <article style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 1.75rem; clip-path: var(--clip-chamfer); display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.5rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span class="badge ${catBadgeClass}">${a.category}</span>
            ${a.important ? `<span class="badge badge-red">🚨 COMUNICADO URGENTE</span>` : ""}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">
            📅 ${a.date} &bull; ⏰ ${a.time} hrs
          </div>
        </div>

        <div>
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 0.6rem; line-height: 1.3;">
            ${a.title}
          </h3>
          <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6;">
            ${a.content}
          </p>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem; font-size: 0.75rem;">
          <span style="color: var(--text-muted);">Emitido por: <strong style="color: #fff;">${a.author}</strong></span>
          <span style="color: var(--color-lime); font-weight: 700;">Oficial IMEX</span>
        </div>
      </article>
    `;
  }).join("");

  container.innerHTML = `
    <div class="view-animate-fade">
      <div class="page-header">
        <div class="page-title-group">
          <span class="page-category-tag">CANAL OFICIAL</span>
          <h1 class="page-title">📢 ANUNCIOS & ÚLTIMAS NOTICIAS</h1>
          <p class="page-subtitle">Resoluciones del tribunal de penas, aperturas de mercado, modificaciones de horario y actas oficiales.</p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 860px;">
        ${announcementsListHtml}
      </div>
    </div>
  `;
}
