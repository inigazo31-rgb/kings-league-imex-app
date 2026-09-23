// ============================================================================
// KINGS LEAGUE IMEX - MARKET VIEW (MERCADO DE FICHAJES & CLAUSULAZOS)
// ============================================================================

import { store } from "../state/store.js";
import { modal } from "../components/modal.js";
import { toast } from "../components/toast.js";
import { startLiveCountdown } from "../components/countdown.js";

export function renderMarketView(container) {
  let activeTab = "clausulazos"; // 'clausulazos', 'propose', 'history'
  let posFilter = "ALL";
  let sortBy = "value_desc";
  const user = store.currentUser;
  const userTeam = user.teamId ? store.getTeamById(user.teamId) : null;

  function update() {
    const isMarketOpen = store.isMarketOpenNow();
    // 1. Barra de Estado del Mercado
    const statusDotClass = isMarketOpen ? "" : "closed";
    const statusText = isMarketOpen ? "MERCADO OFICIALMENTE ABIERTO" : "MERCADO CERRADO (solo abre los miércoles)";
    const targetDate = store.getMarketBoundaryDate();
    const countdownLabel = isMarketOpen ? "EL MERCADO CIERRA EN:" : "EL MERCADO ABRE EN:";

    // 2. Contenido de las pestañas
    let tabContentHtml = "";

    if (activeTab === "clausulazos") {
      // Catálogo de jugadores transferibles. Las insignias no tienen valor en mercado ni se ofertan como clausula.
      let availablePlayers = store.players.filter((p) => !p.isInsignia);
      if (posFilter !== "ALL") {
        availablePlayers = availablePlayers.filter((p) => p.position === posFilter);
      }
      const sorters = {
        value_desc: (a, b) => b.value - a.value,
        value_asc: (a, b) => a.value - b.value,
        position: (a, b) => a.position.localeCompare(b.position) || b.value - a.value,
        name: (a, b) => a.name.localeCompare(b.name),
      };
      availablePlayers.sort(sorters[sortBy] || sorters.value_desc);

      tabContentHtml = `
        <div style="display:flex; gap:0.75rem; flex-wrap:wrap; align-items:flex-end; margin-bottom:1.1rem;">
          <div class="form-group" style="margin:0;">
            <label class="form-label">Posición:</label>
            <select id="selectPosFilter" class="form-select">
              <option value="ALL" ${posFilter === 'ALL' ? 'selected' : ''}>Todas</option>
              <option value="POR" ${posFilter === 'POR' ? 'selected' : ''}>Portero (POR)</option>
              <option value="DEF" ${posFilter === 'DEF' ? 'selected' : ''}>Defensa (DEF)</option>
              <option value="MED" ${posFilter === 'MED' ? 'selected' : ''}>Mediocampo (MED)</option>
              <option value="DEL" ${posFilter === 'DEL' ? 'selected' : ''}>Delantero (DEL)</option>
            </select>
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Ordenar por:</label>
            <select id="selectSortBy" class="form-select">
              <option value="value_desc" ${sortBy === 'value_desc' ? 'selected' : ''}>Valor: mayor a menor</option>
              <option value="value_asc" ${sortBy === 'value_asc' ? 'selected' : ''}>Valor: menor a mayor</option>
              <option value="position" ${sortBy === 'position' ? 'selected' : ''}>Posición</option>
              <option value="name" ${sortBy === 'name' ? 'selected' : ''}>Nombre A-Z</option>
            </select>
          </div>
          <span style="font-size:0.75rem; color:var(--text-muted); padding-bottom:0.6rem;">${availablePlayers.length} jugadores</span>
        </div>
        <div class="clausulazo-banner-alert">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <span style="font-size: 2rem;">🚨</span>
            <div>
              <div style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 800; color: #FFFFFF;">
                REGLAMENTO DE CLAUSULAZOS KINGS LEAGUE IMEX
              </div>
              <div style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4;">
                &bull; Cada club dispone de <strong>1 solo Clausulazo</strong> por mercado.<br/>
                &bull; El pago es íntegro y directo. <strong>No requiere la aprobación</strong> del equipo dueño.<br/>
                &bull; <span style="color: #FFD700; font-weight: 700;">⭐ JUGADORES INSIGNIA BLINDADOS:</span> Inmunes a cualquier clausulazo.
              </div>
            </div>
          </div>
          ${
            userTeam
              ? `<div style="text-align: right; flex-shrink: 0;">
                  <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">ESTADO DE TU CLAUSULAZO:</div>
                  <span class="badge ${userTeam.clausulazoUsed ? 'badge-red' : 'badge-lime'}" style="font-size: 0.82rem; padding: 0.4rem 0.8rem;">
                    ${userTeam.clausulazoUsed ? 'UTILIZADO' : 'DISPONIBLE'}
                  </span>
                 </div>`
              : ""
          }
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem;">
          ${availablePlayers.map((p) => {
            const team = store.getTeamById(p.teamId);
            const isOwn = userTeam && p.teamId === userTeam.id;
            const canAfford = userTeam ? userTeam.balance >= p.value : true;
            const canOperate = user.role === "ADMIN" || user.role === "PRESIDENT";
            const canClausulazo = canOperate && isMarketOpen && !isOwn && (!userTeam || (!userTeam.clausulazoUsed && canAfford && !p.isInsignia));

            return `
              <div style="background: var(--bg-secondary); border: 1px solid ${p.isInsignia ? 'rgba(255,215,0,0.4)' : 'var(--border-subtle)'}; border-radius: var(--radius-sm); padding: 1.25rem; clip-path: var(--clip-chamfer); display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="player-pos-badge pos-${p.position.toLowerCase()}">${p.position}</span>
                    <span style="font-family: var(--font-display); font-size: 1.2rem; color: var(--text-muted);">#${p.number}</span>
                  </div>
                  ${
                    !canOperate
                      ? `<button class="btn btn-outline" style="width: 100%; opacity: 0.5;" disabled>Accede como presidente</button>`
                      : isOwn
                      ? `<span class="badge badge-cyan">TU JUGADOR</span>`
                      : p.isInsignia
                      ? `<span class="badge badge-gold">⭐ BLINDADO</span>`
                      : `<span class="badge badge-lime">TRANSFERIBLE</span>`
                  }
                </div>

                <div>
                  <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 800; color: #fff;">${p.name}</h4>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">${team?.name || 'Libre'}</span>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 0.5rem 0.75rem; border-radius: var(--radius-xs); border: 1px solid var(--border-subtle);">
<span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">VALOR EN MERCADO:</span>
                  <span style="font-family: var(--font-display); font-size: 1.35rem; font-weight: 900; color: var(--color-lime);">${p.value}M</span>
                </div>

                <div style="margin-top: auto; padding-top: 0.5rem;">
                  ${
                    !canOperate
                      ? `<button class="btn btn-outline" style="width: 100%; opacity: 0.5;" disabled>Accede como presidente</button>`
                      : isOwn
                      ? `<button class="btn btn-outline" style="width: 100%; opacity: 0.5;" disabled>Es tu jugador</button>`
                      : p.isInsignia
                      ? `<button class="btn btn-outline" style="width: 100%; opacity: 0.5;" disabled>Inmune (Insignia)</button>`
                      : !isMarketOpen
                      ? `<button class="btn btn-outline" style="width: 100%; opacity: 0.5;" disabled>Mercado Cerrado</button>`
                      : userTeam && userTeam.clausulazoUsed
                      ? `<button class="btn btn-outline" style="width: 100%; opacity: 0.5;" disabled>Clausulazo Ya Usado</button>`
                      : userTeam && !canAfford
                      ? `<button class="btn btn-outline" style="width: 100%; opacity: 0.5;" disabled>Saldo Insuficiente (${userTeam.balance}M)</button>`
                      : `<button class="btn btn-red btn-execute-clausulazo" data-player-id="${p.id}" style="width: 100%;">
                          🚨 Ejecutar Clausulazo (${p.value}M)
                         </button>`
                  }
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;
    } else if (activeTab === "propose") {
      // Formulario de Negociación Ordinaria (Dinero o Trueque)
      const buyerTeamId = userTeam ? userTeam.id : store.teams[0].id;
      const otherTeams = store.teams.filter((t) => t.id !== buyerTeamId);

      tabContentHtml = `
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 2rem; max-width: 720px; margin: 0 auto; clip-path: var(--clip-chamfer);">
          <h3 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem;">
            🤝 NUEVA PROPUESTA DE TRANSFERENCIA
          </h3>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
            Acuerdo bilateral entre clubes. Puedes ofrecer dinero, intercambiar un jugador de tu plantilla o combinar ambos. Requiere aceptación del presidente vendedor.
          </p>

          <div class="form-group">
            <label class="form-label">Equipo Vendedor (a quien deseas fichar):</label>
            <select id="selectSellerTeam" class="form-select">
              ${otherTeams.map((t) => `<option value="${t.id}">${t.logoText} ${t.name}</option>`).join("")}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Jugador que deseas comprar / recibir:</label>
            <select id="selectTargetPlayer" class="form-select"></select>
          </div>

          <div class="form-group">
            <label class="form-label">Oferta Económica (Millones):</label>
            <input type="number" id="inputOfferPrice" class="form-control" placeholder="Ej: 20" min="0" value="10" />
          </div>

          <div class="form-group">
            <label class="form-label">Jugador de tu plantilla que ofreces en intercambio (Opcional - Trueque):</label>
            <select id="selectOfferedPlayer" class="form-select">
              <option value="">Ninguno (Solo Dinero)</option>
              ${store.getTeamPlayers(buyerTeamId).filter(p => !p.isInsignia).map((p) => `
                <option value="${p.id}">${p.name} (#${p.number} - ${p.position} - ${p.value}M)</option>
              `).join("")}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Mensaje / Notas para el Presidente:</label>
            <input type="text" id="inputTransferNotes" class="form-control" placeholder="Ej: Pago de contado en la próxima jornada..." />
          </div>

          <button class="btn btn-lime btn-lg" id="btnSendTransferProposal" style="width: 100%; margin-top: 1rem;" ${!userTeam && user.role !== "ADMIN" ? "disabled" : ""}>
            Enviar Propuesta de Fichaje
          </button>
        </div>
      `;
    } else if (activeTab === "history") {
      // Historial de Transferencias
      const transfers = store.market.transfers;

      tabContentHtml = `
        <div class="standings-table-container">
          <table class="standings-table">
            <thead>
              <tr>
                <th>ESTADO</th>
                <th>TIPO</th>
                <th>JUGADOR</th>
                <th>COMPRADOR</th>
                <th>VENDEDOR</th>
                <th style="text-align: right;">PRECIO</th>
                <th>FECHA</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              ${
                transfers.length === 0
                  ? `<tr><td colspan="8" style="text-align: center; padding: 2rem;">No hay transferencias registradas aún.</td></tr>`
                  : transfers.map((tr) => {
                      const buyer = store.getTeamById(tr.buyerTeamId);
                      const seller = store.getTeamById(tr.sellerTeamId);
                      const player = store.getPlayerById(tr.playerId);

                      let badgeClass = "badge-metallic";
                      if (tr.status === "completed") badgeClass = "badge-lime";
                      if (tr.status === "pending") badgeClass = "badge-yellow";
                      if (tr.status === "rejected" || tr.status === "cancelled") badgeClass = "badge-red";

                      const canUserDecide = user.role === "ADMIN" || (userTeam && userTeam.id === tr.sellerTeamId && tr.status === "pending");

                      return `
                        <tr class="standings-row">
                          <td><span class="badge ${badgeClass}">${tr.status.toUpperCase()}</span></td>
                          <td><span class="badge ${tr.type === 'clausulazo' ? 'badge-red' : 'badge-cyan'}">${tr.type.toUpperCase()}</span></td>
                          <td style="font-weight: 800; color: #fff;">${player?.name || 'Jugador'}</td>
                          <td>${buyer?.name || 'Comprador'}</td>
                          <td>${seller?.name || 'Vendedor'}</td>
                          <td style="text-align: right; font-family: var(--font-display); font-size: 1.2rem; color: var(--color-lime);">${tr.price}M</td>
                          <td style="font-size: 0.72rem; color: var(--text-muted);">${tr.date}</td>
                          <td>
                            ${
                              canUserDecide
                                ? `<div style="display: flex; gap: 0.35rem;">
                                    <button class="btn btn-sm btn-lime btn-accept-transfer" data-tr-id="${tr.id}">Aceptar</button>
                                    <button class="btn btn-sm btn-red btn-reject-transfer" data-tr-id="${tr.id}">Rechazar</button>
                                   </div>`
                                : `<span style="font-size: 0.7rem; color: var(--text-muted);">${tr.notes || '-'}</span>`
                            }
                          </td>
                        </tr>
                      `;
                    }).join("")
              }
            </tbody>
          </table>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="view-animate-fade">
        <div class="page-header">
          <div class="page-title-group">
            <span class="page-category-tag">VENTANA DE TRASPASOS</span>
            <h1 class="page-title">💰 MERCADO DE FICHAJES & CLAUSULAZOS</h1>
            <p class="page-subtitle">Compra, venta, trueques y ejecución de cláusulas de rescisión en la KINGS LEAGUE IMEX.</p>
          </div>

          <!-- Pestañas del Mercado -->
          <div class="tab-nav" id="marketTabsNav">
            <button class="tab-btn ${activeTab === 'clausulazos' ? 'active' : ''}" data-tab="clausulazos">🚨 CLAUSULAZOS</button>
            <button class="tab-btn ${activeTab === 'propose' ? 'active' : ''}" data-tab="propose">🤝 NEGOCIAR FICHAJE</button>
            <button class="tab-btn ${activeTab === 'history' ? 'active' : ''}" data-tab="history">📋 HISTORIAL (${store.market.transfers.length})</button>
          </div>
        </div>

        <!-- Barra de Estado con Cuenta Regresiva -->
        <div class="market-status-bar">
          <div class="market-status-info">
            <div class="market-pulsing-dot ${statusDotClass}"></div>
            <div>
              <div class="market-status-title">${statusText}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Los miércoles se abren las operaciones oficiales</div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 1rem;">
            ${
              targetDate
                ? `<span style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">${countdownLabel}</span>
                   <div id="marketLiveTimer"></div>`
                : `<span style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">Modo forzado por el organizador</span>`
            }
          </div>
        </div>

        <!-- Contenedor Dinámico de la Pestaña -->
        <div id="marketTabContent">
          ${tabContentHtml}
        </div>
      </div>
    `;

    // Iniciar Countdown
    const timerEl = container.querySelector("#marketLiveTimer");
    if (timerEl && targetDate) {
      startLiveCountdown(targetDate, timerEl);
    }

    // Filtro por posición / orden (catálogo de clausulazos)
    const posSel = container.querySelector("#selectPosFilter");
    if (posSel) posSel.addEventListener("change", () => { posFilter = posSel.value; update(); });
    const sortSel = container.querySelector("#selectSortBy");
    if (sortSel) sortSel.addEventListener("change", () => { sortBy = sortSel.value; update(); });

    // Tabs Event Listeners
    container.querySelectorAll("#marketTabsNav .tab-btn").forEach((b) => {
      b.addEventListener("click", () => {
        activeTab = b.dataset.tab;
        update();
      });
    });

    // Clausulazo Buttons Click Listener
    container.querySelectorAll(".btn-execute-clausulazo").forEach((btn) => {
      btn.addEventListener("click", () => {
        const playerId = btn.dataset.playerId;
        confirmAndExecuteClausulazo(playerId);
      });
    });

    // Propose Transfer Selects logic
    const sellerSelect = container.querySelector("#selectSellerTeam");
    const targetPlayerSelect = container.querySelector("#selectTargetPlayer");
    if (sellerSelect && targetPlayerSelect) {
      function populateTargetPlayers(sellerId) {
        const pList = store.getTeamPlayers(sellerId).filter((p) => !p.isInsignia);
        targetPlayerSelect.innerHTML = pList.map((p) => `
          <option value="${p.id}">${p.name} (#${p.number} - ${p.position} - ${p.value}M)</option>
        `).join("");
      }
      populateTargetPlayers(sellerSelect.value);
      sellerSelect.addEventListener("change", () => populateTargetPlayers(sellerSelect.value));

      const sendBtn = container.querySelector("#btnSendTransferProposal");
      if (sendBtn) {
        sendBtn.addEventListener("click", () => {
          const buyerId = userTeam ? userTeam.id : store.teams[0].id;
          const sId = sellerSelect.value;
          const pId = targetPlayerSelect.value;
          const price = Number(container.querySelector("#inputOfferPrice").value) || 0;
          const offeredP = container.querySelector("#selectOfferedPlayer").value;
          const notes = container.querySelector("#inputTransferNotes").value.trim();

          try {
            store.proposeTransfer({
              buyerTeamId: buyerId,
              sellerTeamId: sId,
              playerId: pId,
              offeredPlayerIds: offeredP ? [offeredP] : [],
              price,
              notes: notes || "Propuesta formal de transferencia.",
            });
            toast.show("Transferencia Enviada", "La oferta fue enviada al presidente del club.", "lime");
            activeTab = "history";
            update();
          } catch (err) {
            toast.show("Error", err.message, "red");
          }
        });
      }
    }

    // Accept / Reject Transfer
    container.querySelectorAll(".btn-accept-transfer").forEach((b) => {
      b.addEventListener("click", () => {
        try {
          store.respondTransfer(b.dataset.trId, "accept");
          toast.show("Transferencia Aceptada", "El fichaje se ha completado oficialmente.", "lime");
          update();
        } catch (err) {
          toast.show("Error", err.message, "red");
        }
      });
    });

    container.querySelectorAll(".btn-reject-transfer").forEach((b) => {
      b.addEventListener("click", () => {
        try {
          store.respondTransfer(b.dataset.trId, "reject");
          toast.show("Transferencia", "Has rechazado la oferta.", "yellow");
          update();
        } catch (err) {
          toast.show("Error", err.message, "red");
        }
      });
    });
  }

  // Confirmación formal de Clausulazo
  function confirmAndExecuteClausulazo(playerId) {
    if (user.role !== "ADMIN" && user.role !== "PRESIDENT") {
      toast.show("Acceso restringido", "Debes acceder como presidente para operar en el mercado.", "yellow");
      return;
    }
    const player = store.getPlayerById(playerId);
    if (!player) return;

    const buyerTeamId = userTeam ? userTeam.id : store.teams[0].id;
    const buyerTeam = store.getTeamById(buyerTeamId);

    modal.open({
      title: "🚨 CONFIRMAR EJECUCIÓN DE CLAUSULAZO",
      bodyHtml: `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="background: rgba(255, 46, 77, 0.12); border: 1px solid var(--color-red); border-radius: var(--radius-sm); padding: 1.25rem; display: flex; gap: 1rem; align-items: center;">
            <span style="font-size: 2.2rem;">⚠️</span>
            <div>
              <div style="font-weight: 800; color: var(--color-red); font-size: 1rem;">
                "Este movimiento utilizará tu único clausulazo de este mercado."
              </div>
              <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.25rem;">
                No requiere el consentimiento del equipo actual. El importe íntegro de la cláusula será debitado de tu cartera de forma irreversible.
              </div>
            </div>
          </div>

          <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-xs); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">JUGADOR OBJETIVO:</div>
              <div style="font-weight: 800; font-size: 1.1rem; color: #fff;">${player.name} (${player.position})</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Equipo actual: ${store.getTeamById(player.teamId)?.name}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">IMPORTE A DEBITAR:</div>
              <div style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 900; color: var(--color-lime);">${player.value}M</div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary);">
            <span>Saldo actual de tu equipo (${buyerTeam?.name}):</span>
            <strong style="color: #fff;">${buyerTeam?.balance}M</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary);">
            <span>Saldo tras el clausulazo:</span>
            <strong style="color: var(--color-lime);">${(buyerTeam?.balance || 0) - player.value}M</strong>
          </div>
        </div>
      `,
      footerHtml: `
        <button class="btn btn-outline" id="btnCancelClausulazo">Cancelar</button>
        <button class="btn btn-red" id="btnConfirmClausulazo">Pagar y Ejecutar Clausulazo</button>
      `,
    });

    document.getElementById("btnCancelClausulazo")?.addEventListener("click", () => modal.close());

    document.getElementById("btnConfirmClausulazo")?.addEventListener("click", () => {
      try {
        store.executeClausulazo({
          buyerTeamId,
          targetPlayerId: player.id,
        });
        toast.show("¡BOMBAZO!", `¡Clausulazo completado! ${player.name} se une a ${buyerTeam.name}.`, "red");
        modal.close();
        update();
      } catch (err) {
        toast.show("Error de Clausulazo", err.message, "red");
      }
    });
  }

  update();
}
