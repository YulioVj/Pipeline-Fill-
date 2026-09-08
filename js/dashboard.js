```javascript
/* ============================================================================
   VENTO DASHBOARD — dashboard.js
   Actualiza visualmente tarjetas, tablas, gauges y texto a partir de los
   datos ya filtrados y calculados.
   ============================================================================ */

let SORT_MATRIZ = {
  field: "pendienteCalc",
  dir: "desc"
};


/* ============================================================================
   ACTUALIZAR DASHBOARD
   ============================================================================ */

function updateDashboard() {

  const filtered =
    applyFilters(APP_STATE.data);

  const weeklyRows =
    calculateWeeklyFulfillment(
      filtered,
      APP_STATE.weeksAvailable,
      APP_STATE.tieneProyeccionSemanal
    );

  const capacity =
    calculateCapacity(filtered);

  const fulfillment =
    calculateFulfillment(filtered);


  renderKPIs(fulfillment);

  renderForecastSection(fulfillment);

  renderWeeklyTable(
    weeklyRows,
    APP_STATE.tieneProyeccionSemanal
  );

  renderWeeklyChart(weeklyRows);

  renderAccumulatedCard(weeklyRows);

  renderCapacity(capacity);

  renderDOH(filtered);

  renderPendientes(filtered);

  renderMatriz(filtered);

  renderAlerts(
    filtered,
    weeklyRows,
    capacity
  );

  renderExecutiveSummary(
    filtered,
    weeklyRows,
    capacity
  );


  /* ---------------------------------------------------------- */
  /* CANAL ACTIVO */
  /* ---------------------------------------------------------- */

  const canalActivo =
    document.getElementById("canalActivo");

  if (canalActivo) {

    canalActivo.textContent =
      FilterState.canal === "TODAS"
        ? "Vista consolidada — todos los canales"
        : `Vista filtrada — ${FilterState.canal}`;
  }
}


/* ============================================================================
   KPIs
   ============================================================================ */

function renderKPIs(f) {

  const kpiForecast =
    document.getElementById("kpiForecast");

  if (kpiForecast) {
    kpiForecast.textContent =
      formatNumber(f.forecast);
  }


  const kpiPedido =
    document.getElementById("kpiPedido");

  if (kpiPedido) {
    kpiPedido.textContent =
      formatNumber(f.pedidoRevisado);
  }


  const kpiCumplido =
    document.getElementById("kpiCumplido");

  if (kpiCumplido) {
    kpiCumplido.textContent =
      formatNumber(f.inventarioCumplido);
  }


  const kpiPendiente =
    document.getElementById("kpiPendiente");

  if (kpiPendiente) {
    kpiPendiente.textContent =
      formatNumber(
        Math.max(f.pendiente, 0)
      );
  }


  const kpiTraslado =
    document.getElementById("kpiTraslado");

  if (kpiTraslado) {
    kpiTraslado.textContent =
      formatNumber(
        f.trasladoCompletado
      );
  }


  /* ---------------------------------------------------------- */
  /* PORCENTAJE CUMPLIMIENTO */
  /* ---------------------------------------------------------- */

  const pctEl =
    document.getElementById(
      "kpiPctCumplimiento"
    );

  const pctCard =
    document.getElementById(
      "kpiPctCumplimientoCard"
    );

  const pctBar =
    document.getElementById(
      "kpiPctCumplimientoBarra"
    );


  const sem =
    pctSemaphore(
      f.pctCumplimiento
    );


  if (pctEl) {

    pctEl.textContent =
      formatPercent(
        f.pctCumplimiento
      );
  }


  if (pctCard) {

    pctCard.className =
      "card tinted-" +
      sem.level;
  }


  if (pctBar) {

    pctBar.className =
      "progress-fill " +
      sem.level;

    pctBar.style.width =
      f.pctCumplimiento === null
        ? "0%"
        : Math.min(
            Math.max(
              f.pctCumplimiento * 100,
              0
            ),
            100
          ) + "%";
  }
}


/* ============================================================================
   FORECAST
   ============================================================================ */

function renderForecastSection(f) {

  const fcForecastVal =
    document.getElementById(
      "fcForecastVal"
    );

  if (fcForecastVal) {
    fcForecastVal.textContent =
      formatNumber(f.forecast);
  }


  const fcPedidoVal =
    document.getElementById(
      "fcPedidoVal"
    );

  if (fcPedidoVal) {
    fcPedidoVal.textContent =
      formatNumber(
        f.pedidoRevisado
      );
  }


  const fcPctVal =
    document.getElementById(
      "fcPctVal"
    );

  if (fcPctVal) {
    fcPctVal.textContent =
      formatPercent(
        f.pctPedidoVsForecast
      );
  }


  const bar =
    document.getElementById(
      "fcBarra"
    );


  const sem =
    pctSemaphore(
      f.pctPedidoVsForecast
    );


  if (bar) {

    bar.style.width =
      f.pctPedidoVsForecast === null
        ? "0%"
        : Math.min(
            f.pctPedidoVsForecast * 100,
            100
          ) + "%";

    bar.className =
      "progress-fill " +
      sem.level;
  }


  /* ---------------------------------------------------------- */
  /* COMPARACIÓN PEDIDO */
  /* ---------------------------------------------------------- */

  const cmpPedido =
    document.getElementById(
      "cmpPedido"
    );

  if (cmpPedido) {
    cmpPedido.textContent =
      formatNumber(
        f.pedidoRevisado
      );
  }


  const cmpCumplido =
    document.getElementById(
      "cmpCumplido"
    );

  if (cmpCumplido) {
    cmpCumplido.textContent =
      formatNumber(
        f.inventarioCumplido
      );
  }


  const cmpPendiente =
    document.getElementById(
      "cmpPendiente"
    );

  if (cmpPendiente) {
    cmpPendiente.textContent =
      formatNumber(
        Math.max(
          f.pendiente,
          0
        )
      );
  }


  const cmpPct =
    document.getElementById(
      "cmpPct"
    );

  if (cmpPct) {
    cmpPct.textContent =
      formatPercent(
        f.pctCumplimiento
      );
  }


  const bar2 =
    document.getElementById(
      "cmpBarra"
    );


  const sem2 =
    pctSemaphore(
      f.pctCumplimiento
    );


  if (bar2) {

    bar2.style.width =
      f.pctCumplimiento === null
        ? "0%"
        : Math.min(
            Math.max(
              f.pctCumplimiento * 100,
              0
            ),
            100
          ) + "%";

    bar2.className =
      "progress-fill " +
      sem2.level;
  }
}


/* ============================================================================
   TABLA SEMANAL
   ============================================================================ */

function renderWeeklyTable(
  weeklyRows,
  tieneProyeccion
) {

  const tbody =
    document.querySelector(
      "#tablaSemanal tbody"
    );


  if (!tbody) {

    console.warn(
      "No se encontró #tablaSemanal tbody."
    );

    return;
  }


  if (!weeklyRows.length) {

    tbody.innerHTML = `
      <tr>
        <td
          colspan="7"
          class="muted"
          style="text-align:center;padding:20px;"
        >
          No hay semanas detectadas en los datos filtrados.
        </td>
      </tr>
    `;

    return;
  }


  tbody.innerHTML =
    weeklyRows
      .map(w => `
        <tr>

          <td>
            Semana ${w.week}
          </td>

          <td class="num">
            ${
              w.proyectado === null
                ? "SIN PROYECCIÓN"
                : formatNumber(w.proyectado)
            }
          </td>

          <td class="num">
            ${formatNumber(w.cumplido)}
          </td>

          <td class="num">
            ${
              w.pendiente === null
                ? "N/A"
                : formatNumber(w.pendiente)
            }
          </td>

          <td class="num">
            ${renderPctBadge(w.pctSemanal)}
          </td>

          <td class="num">
            ${renderPctBadge(w.pctAcumulado)}
          </td>

          <td>
            ${renderRhythmBadge(w.ritmo)}
          </td>

        </tr>
      `)
      .join("");


  const projectionNote =
    document.getElementById(
      "weeklyProjectionNote"
    );


  if (projectionNote) {

    if (!tieneProyeccion) {

      projectionNote.classList.remove(
        "hidden"
      );

    } else {

      projectionNote.classList.add(
        "hidden"
      );
    }
  }
}


/* ============================================================================
   BADGE PORCENTAJE
   ============================================================================ */

function renderPctBadge(pct) {

  const sem =
    pctSemaphore(pct);

  if (pct === null) {

    return `
      <span class="badge badge-neutral">
        N/A
      </span>
    `;
  }


  return `
    <span class="badge badge-${sem.level}">
      ${formatPercent(pct)}
    </span>
  `;
}


/* ============================================================================
   BADGE RITMO
   ============================================================================ */

function renderRhythmBadge(ritmo) {

  if (!ritmo) {

    return `
      <span class="badge badge-neutral">
        N/A
      </span>
    `;
  }


  return `
    <span class="badge badge-${ritmo.level}">
      ${ritmo.label}
    </span>
  `;
}


/* ============================================================================
   TARJETA ACUMULADO
   ============================================================================ */

function renderAccumulatedCard(
  weeklyRows
) {

  const last =
    weeklyRows.length
      ? weeklyRows[
          weeklyRows.length - 1
        ]
      : null;


  const card =
    document.getElementById(
      "cumplimientoAcumuladoCard"
    );


  const acumPctVal =
    document.getElementById(
      "acumPctVal"
    );

  const acumProyectado =
    document.getElementById(
      "acumProyectado"
    );

  const acumCumplido =
    document.getElementById(
      "acumCumplido"
    );

  const acumPendiente =
    document.getElementById(
      "acumPendiente"
    );


  if (
    !last ||
    last.pctAcumulado === null
  ) {

    if (acumPctVal) {
      acumPctVal.textContent =
        "N/A";
    }


    if (acumProyectado) {

      acumProyectado.textContent =
        "Proyectado acumulado: SIN PROYECCIÓN";
    }


    if (acumCumplido) {

      acumCumplido.textContent =
        `Cumplido acumulado: ${
          last
            ? formatNumber(
                last.acumuladoCumplido
              )
            : 0
        }`;
    }


    if (acumPendiente) {

      acumPendiente.textContent =
        "Pendiente: N/A";
    }


    if (card) {
      card.className = "card";
    }


    return;
  }


  const sem =
    pctSemaphore(
      last.pctAcumulado
    );


  if (acumPctVal) {

    acumPctVal.textContent =
      formatPercent(
        last.pctAcumulado
      );
  }


  if (acumProyectado) {

    acumProyectado.textContent =
      `Proyectado acumulado: ${
        formatNumber(
          last.acumuladoProyectado
        )
      }`;
  }


  if (acumCumplido) {

    acumCumplido.textContent =
      `Cumplido acumulado: ${
        formatNumber(
          last.acumuladoCumplido
        )
      }`;
  }


  if (acumPendiente) {

    acumPendiente.textContent =
      `Pendiente: ${
        formatNumber(
          Math.max(
            last.acumuladoProyectado -
            last.acumuladoCumplido,
            0
          )
        )
      }`;
  }


  if (card) {

    card.className =
      "card tinted-" +
      sem.level;
  }
}


/* ============================================================================
   CAPACIDAD
   ============================================================================ */

function renderCapacity(
  capacity
) {

  renderAllGauges(
    capacity
  );
}


/* ============================================================================
   DOH
   ============================================================================ */

function renderDOH(rows) {

  const summary =
    calculateDOHSummary(rows);


  [
    "NORMAL",
    "ALERTA",
    "CRÍTICO",
    "SIN COBERTURA"
  ].forEach(k => {

    const id =
      "resDOH_" +
      k.replace(
        /[^A-Z]/g,
        ""
      );


    const el =
      document.getElementById(id);


    if (el) {

      const count =
        el.querySelector(
          ".rd-count"
        );

      const pct =
        el.querySelector(
          ".rd-pct"
        );


      if (count) {
        count.textContent =
          summary[k].count;
      }


      if (pct) {
        pct.textContent =
          formatPercent(
            summary[k].pct
          );
      }
    }
  });


  const tbody =
    document.querySelector(
      "#tablaDOH tbody"
    );


  if (!tbody) {

    console.warn(
      "No se encontró #tablaDOH tbody."
    );

    return;
  }


  const sorted =
    rows
      .slice()
      .sort(
        (a, b) =>
          b.doh - a.doh
      );


  tbody.innerHTML =
    sorted
      .map(r => {

        const status =
          calculateDOHStatus(
            r.doh
          );


        return `
          <tr>

            <td>
              ${r.modelo}
            </td>

            <td>
              ${r.canal}
            </td>

            <td class="num">
              ${formatNumber(
                r.inventarioGnrl
              )}
            </td>

            <td class="num">
              ${formatNumber(
                r.ventas
              )}
            </td>

            <td class="num">
              ${formatNumber(
                r.proVentaMensual
              )}
            </td>

            <td class="num">
              ${r.doh.toFixed(1)}
            </td>

            <td>
              <span class="badge badge-${status.level}">
                ${status.label}
              </span>
            </td>

          </tr>
        `;

      })
      .join("");
}


/* ============================================================================
   PENDIENTES
   ============================================================================ */

function renderPendientes(
  rows
) {

  const pendientes =
    calculatePendientes(
      rows
    );


  renderPendientesChart(
    pendientes,
    APP_STATE.topNPendientes || "10"
  );


  const tbody =
    document.querySelector(
      "#tablaPendientes tbody"
    );


  if (!tbody) {

    console.warn(
      "No se encontró #tablaPendientes tbody."
    );

    return;
  }


  if (!pendientes.length) {

    tbody.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="muted"
          style="text-align:center;padding:16px;"
        >
          No hay modelos con pendiente por entregar
          en la selección actual.
        </td>
      </tr>
    `;

    return;
  }


  tbody.innerHTML =
    pendientes
      .map(r => `

        <tr>

          <td>
            ${r.modelo}
          </td>

          <td>
            ${r.canal}
          </td>

          <td class="num">
            ${formatNumber(
              r.pedidoRevisado
            )}
          </td>

          <td class="num">
            ${formatNumber(
              r.inventarioCumplido
            )}
          </td>

          <td class="num">
            ${formatNumber(
              r.pendienteCalc
            )}
          </td>

          <td class="num">
            ${formatPercent(
              safeDiv(
                r.inventarioCumplido,
                r.pedidoRevisado
              )
            )}
          </td>

        </tr>

      `)
      .join("");
}


/* ============================================================================
   ORDENAMIENTO
   ============================================================================ */

function sortRows(
  rows,
  field,
  dir
) {

  return rows
    .slice()
    .sort((a, b) => {

      const va =
        a[field];

      const vb =
        b[field];


      if (
        typeof va === "string"
      ) {

        return dir === "asc"
          ? va.localeCompare(vb)
          : vb.localeCompare(va);
      }


      return dir === "asc"
        ? va - vb
        : vb - va;
    });
}


/* ============================================================================
   MATRIZ
   ============================================================================ */

function renderMatriz(
  rows
) {

  const withPendiente =
    rows.map(r => ({
      ...r,
      pendienteCalc:
        r.pedidoRevisado -
        r.inventarioCumplido
    }));


  const sorted =
    sortRows(
      withPendiente,
      SORT_MATRIZ.field,
      SORT_MATRIZ.dir
    );


  const tbody =
    document.querySelector(
      "#tablaMatriz tbody"
    );


  if (!tbody) {

    console.warn(
      "No se encontró #tablaMatriz tbody."
    );

    return;
  }


  tbody.innerHTML =
    sorted
      .map(r => {

        const status =
          calculateDOHStatus(
            r.doh
          );


        return `
          <tr>

            <td>
              ${r.modelo}
            </td>

            <td>
              ${r.canal}
            </td>

            <td class="num">
              ${formatNumber(
                r.forecast
              )}
            </td>

            <td class="num">
              ${formatNumber(
                r.pedidoRevisado
              )}
            </td>

            <td class="num">
              ${formatNumber(
                r.inventarioCumplido
              )}
            </td>

            <td class="num">
              ${formatNumber(
                r.pendienteCalc
              )}
            </td>

            <td class="num">
              ${formatPercent(
                safeDiv(
                  r.pedidoRevisado,
                  r.forecast
                )
              )}
            </td>

            <td class="num">
              ${formatPercent(
                safeDiv(
                  r.inventarioCumplido,
                  r.pedidoRevisado
                )
              )}
            </td>

            <td class="num">
              ${r.doh.toFixed(1)}
            </td>

            <td>
              ${
                r.estatus
                  ? `
                    <span class="badge badge-neutral">
                      ${r.estatus}
                    </span>
                  `
                  : "—"
              }
            </td>

            <td>
              <span class="badge badge-${status.level}">
                ${status.label}
              </span>
            </td>

          </tr>
        `;

      })
      .join("");
}


/* ============================================================================
   ALERTAS
   ============================================================================ */

function renderAlerts(
  rows,
  weeklyRows,
  capacity
) {

  const alerts =
    generateAlerts(
      rows,
      weeklyRows,
      capacity
    );


  const cont =
    document.getElementById(
      "listaAlertas"
    );


  /*
    CORRECCIÓN:
    Evitamos ejecutar innerHTML si el elemento
    no existe en el HTML.
  */

  if (!cont) {

    console.warn(
      "No se encontró #listaAlertas en index.html."
    );

    return;
  }


  if (!alerts.length) {

    cont.innerHTML = `
      <div class="empty-state">
        Sin alertas activas con los filtros actuales.
      </div>
    `;

    return;
  }


  cont.innerHTML =
    alerts
      .map(a => `
        <div class="list-item">

          <span class="badge badge-${a.level}">
            ●
          </span>

          <span>
            ${a.text}
          </span>

        </div>
      `)
      .join("");
}


/* ============================================================================
   RESUMEN EJECUTIVO
   ============================================================================ */

function renderExecutiveSummary(
  rows,
  weeklyRows,
  capacity
) {

  /*
    Buscamos el contenedor del resumen.
  */

  const contenedor =
    document.getElementById(
      "resumenEjecutivo"
    );


  /*
    CORRECCIÓN PRINCIPAL DEL ERROR:

    Si #resumenEjecutivo no existe,
    document.getElementById() devuelve null.

    Por lo tanto NO debemos ejecutar:

        null.innerHTML = ...

    En su lugar mostramos un aviso en consola
    y continuamos con el dashboard.
  */

  if (!contenedor) {

    console.warn(
      "VENTO DASHBOARD: No se encontró el elemento #resumenEjecutivo en index.html."
    );

    return;
  }


  /*
    Generar frases del resumen.
  */

  const frases =
    generateExecutiveSummary(
      rows,
      weeklyRows,
      capacity
    );


  /*
    Si no se generaron frases,
    mostramos un mensaje.
  */

  if (
    !frases ||
    !Array.isArray(frases) ||
    !frases.length
  ) {

    contenedor.innerHTML = `
      <p class="muted">
        No hay información suficiente para
        generar el resumen ejecutivo.
      </p>
    `;

    return;
  }


  /*
    Renderizar las frases.
  */

  contenedor.innerHTML =
    frases
      .map(
        f => `<p>${f}</p>`
      )
      .join("");
}
```
