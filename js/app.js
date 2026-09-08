```javascript
/* ============================================================================
   VENTO DASHBOARD — app.js
   Punto de entrada. Inicializa el estado, carga los datos por defecto,
   conecta los eventos de la interfaz y arranca el primer render.
   ============================================================================ */

const APP_STATE = {
  data: [],
  weeksAvailable: [],
  tieneProyeccionSemanal: false,
  topNPendientes: "10",
};

/* ---------------------------------------------------------------------- */
/* INICIALIZACIÓN */
/* ---------------------------------------------------------------------- */

function init() {
  applyLogo();
  loadInitialData();
  wireFilters();
  wireTopSelectors();
  wireSortableHeaders();
  wireSecurityUI();
  wireFileImport();

  const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");

  if (btnLimpiarFiltros) {
    btnLimpiarFiltros.addEventListener(
      "click",
      handleClearFilters
    );
  }

  const btnActualizarHora =
    document.getElementById("btnActualizarHora");

  if (btnActualizarHora) {
    btnActualizarHora.addEventListener("click", () => {
      const ultimaActualizacion =
        document.getElementById("ultimaActualizacion");

      if (ultimaActualizacion) {
        ultimaActualizacion.textContent =
          "Actualizado: " +
          new Date().toLocaleString("es-MX");
      }

      updateDashboard();
    });
  }

  const ultimaActualizacion =
    document.getElementById("ultimaActualizacion");

  if (ultimaActualizacion) {
    ultimaActualizacion.textContent =
      "Actualizado: " +
      new Date().toLocaleString("es-MX");
  }

  updateDashboard();
}


/* ---------------------------------------------------------------------- */
/* LOGO */
/* ---------------------------------------------------------------------- */

function applyLogo() {
  const img = document.getElementById("brandLogo");

  if (!img) {
    console.warn(
      "No se encontró el elemento #brandLogo en el HTML."
    );
    return;
  }

  img.src = CONFIG.VENTO_LOGO_URL;
  img.alt = CONFIG.COMPANY_NAME;

  img.addEventListener(
    "error",
    () => {
      img.classList.add("hidden");

      const fallback =
        document.getElementById("brandLogoFallback");

      if (fallback) {
        fallback.classList.remove("hidden");
      }
    },
    { once: true }
  );

  document.title =
    CONFIG.COMPANY_NAME +
    " — Supply Chain Dashboard";
}


/* ---------------------------------------------------------------------- */
/* CARGA INICIAL DE DATOS */
/* ---------------------------------------------------------------------- */

function loadInitialData() {
  const result = loadDefaultData();

  applyLoadResult(
    result,
    "base.csv (incluida por defecto)"
  );
}


/* ---------------------------------------------------------------------- */
/* APLICAR RESULTADO DE CARGA */
/* ---------------------------------------------------------------------- */

function applyLoadResult(result, sourceLabel) {
  APP_STATE.data = result.data || [];
  APP_STATE.weeksAvailable =
    result.weeksAvailable || [];

  APP_STATE.tieneProyeccionSemanal =
    result.tieneProyeccionSemanal || false;

  refreshDynamicFilterOptions(
    APP_STATE.data,
    APP_STATE.weeksAvailable
  );

  showValidationNotice(
    result.validation,
    sourceLabel
  );
}


/* ---------------------------------------------------------------------- */
/* AVISO DE VALIDACIÓN */
/*
   MODIFICACIÓN IMPORTANTE:
   Se valida que #validationNotice exista antes de intentar
   modificar innerHTML o classList.
   ---------------------------------------------------------------------- */

function showValidationNotice(
  validation,
  sourceLabel
) {
  const el =
    document.getElementById("validationNotice");

  /*
    Si el elemento no existe en el HTML,
    no detenemos toda la aplicación.
  */
  if (!el) {
    console.warn(
      "No se encontró #validationNotice en el HTML."
    );

    return;
  }

  /*
    Si no hay errores de validación,
    ocultamos el aviso.
  */
  if (!validation || validation.ok) {
    el.classList.add("hidden");
    el.innerHTML = "";

    return;
  }

  /*
    Si existen columnas faltantes,
    mostramos el aviso.
  */
  el.classList.remove("hidden");

  const missingColumns =
    Array.isArray(validation.missing)
      ? validation.missing.join(", ")
      : "No especificadas";

  el.innerHTML = `
    <strong>
      Algunas columnas no fueron encontradas.
    </strong>

    <div style="margin-top:6px;">
      Se cargarán únicamente los indicadores disponibles.
    </div>

    <div style="margin-top:6px;">
      Columnas faltantes:
      ${missingColumns}
    </div>

    <div
      style="
        margin-top:2px;
        font-size:11.5px;
        color:var(--color-text-muted);
      "
    >
      Fuente: ${sourceLabel || "Desconocida"}
    </div>
  `;
}


/* ---------------------------------------------------------------------- */
/* FILTROS */
/* ---------------------------------------------------------------------- */

function wireFilters() {

  const btnToggleFiltros =
    document.getElementById(
      "btnToggleFiltros"
    );

  if (btnToggleFiltros) {

    btnToggleFiltros.addEventListener(
      "click",
      () => {

        const wrap =
          document.getElementById(
            "filterFieldsWrap"
          );

        const chevron =
          document.getElementById(
            "filtrosChevron"
          );

        if (!wrap) {
          console.warn(
            "No se encontró #filterFieldsWrap."
          );
          return;
        }

        wrap.classList.toggle("open");

        if (chevron) {
          chevron.textContent =
            wrap.classList.contains("open")
              ? "▴"
              : "▾";
        }
      }
    );
  }


  /* -------------------------------------------------------------- */
  /* TABS DE CANAL */
  /* -------------------------------------------------------------- */

  document
    .querySelectorAll(".canal-tab")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(".canal-tab")
            .forEach(b =>
              b.classList.remove("active")
            );

          btn.classList.add("active");

          FilterState.canal =
            btn.dataset.canal;

          updateDashboard();
        }
      );
    });


  /* -------------------------------------------------------------- */
  /* MODELO */
  /* -------------------------------------------------------------- */

  const filtroModelo =
    document.getElementById(
      "filtroModelo"
    );

  if (filtroModelo) {

    filtroModelo.addEventListener(
      "change",
      e => {

        FilterState.modelo =
          e.target.value;

        updateDashboard();
      }
    );
  }


  /* -------------------------------------------------------------- */
  /* MODELO AGRUPADO */
  /* -------------------------------------------------------------- */

  const filtroModeloAgrupado =
    document.getElementById(
      "filtroModeloAgrupado"
    );

  if (filtroModeloAgrupado) {

    filtroModeloAgrupado.addEventListener(
      "change",
      e => {

        FilterState.modeloAgrupado =
          e.target.value;

        updateDashboard();
      }
    );
  }


  /* -------------------------------------------------------------- */
  /* SEMANA */
  /* -------------------------------------------------------------- */

  const filtroSemana =
    document.getElementById(
      "filtroSemana"
    );

  if (filtroSemana) {

    filtroSemana.addEventListener(
      "change",
      e => {

        FilterState.semana =
          e.target.value;

        updateDashboard();
      }
    );
  }


  /* -------------------------------------------------------------- */
  /* ESTATUS */
  /* -------------------------------------------------------------- */

  const filtroEstatus =
    document.getElementById(
      "filtroEstatus"
    );

  if (filtroEstatus) {

    filtroEstatus.addEventListener(
      "change",
      e => {

        FilterState.estatus =
          e.target.value;

        updateDashboard();
      }
    );
  }


  /* -------------------------------------------------------------- */
  /* BUSCAR MODELO */
  /* -------------------------------------------------------------- */

  const buscarModelo =
    document.getElementById(
      "buscarModelo"
    );

  if (buscarModelo) {

    buscarModelo.addEventListener(
      "input",
      e => {

        FilterState.search =
          e.target.value;

        updateDashboard();
      }
    );
  }
}


/* ---------------------------------------------------------------------- */
/* LIMPIAR FILTROS */
/* ---------------------------------------------------------------------- */

function handleClearFilters() {

  resetFilters();

  document
    .querySelectorAll(".canal-tab")
    .forEach(b =>
      b.classList.remove("active")
    );

  const todas =
    document.querySelector(
      '.canal-tab[data-canal="TODAS"]'
    );

  if (todas) {
    todas.classList.add("active");
  }


  const filtroModelo =
    document.getElementById(
      "filtroModelo"
    );

  if (filtroModelo) {
    filtroModelo.value = "TODOS";
  }


  const filtroModeloAgrupado =
    document.getElementById(
      "filtroModeloAgrupado"
    );

  if (filtroModeloAgrupado) {
    filtroModeloAgrupado.value = "TODOS";
  }


  const filtroSemana =
    document.getElementById(
      "filtroSemana"
    );

  if (filtroSemana) {
    filtroSemana.value = "TODAS";
  }


  const filtroEstatus =
    document.getElementById(
      "filtroEstatus"
    );

  if (filtroEstatus) {
    filtroEstatus.value = "TODOS";
  }


  const buscarModelo =
    document.getElementById(
      "buscarModelo"
    );

  if (buscarModelo) {
    buscarModelo.value = "";
  }


  updateDashboard();
}


/* ---------------------------------------------------------------------- */
/* SELECTOR TOP PENDIENTES */
/* ---------------------------------------------------------------------- */

function wireTopSelectors() {

  const selector =
    document.getElementById(
      "selTopPendientes"
    );

  if (!selector) {
    console.warn(
      "No se encontró #selTopPendientes."
    );
    return;
  }

  selector.addEventListener(
    "change",
    e => {

      APP_STATE.topNPendientes =
        e.target.value;

      updateDashboard();
    }
  );
}


/* ---------------------------------------------------------------------- */
/* ENCABEZADOS ORDENABLES */
/* ---------------------------------------------------------------------- */

function wireSortableHeaders() {

  document
    .querySelectorAll(
      "#tablaMatriz th[data-sort]"
    )
    .forEach(th => {

      th.addEventListener(
        "click",
        () => {

          const field =
            th.dataset.sort;

          const dir =
            th.dataset.dir === "desc"
              ? "asc"
              : "desc";

          document
            .querySelectorAll(
              "#tablaMatriz th[data-sort]"
            )
            .forEach(t =>
              t.removeAttribute(
                "data-dir"
              )
            );

          th.dataset.dir = dir;

          SORT_MATRIZ = {
            field,
            dir
          };

          updateDashboard();
        }
      );
    });
}


/* ---------------------------------------------------------------------- */
/* IMPORTAR CSV */
/* ---------------------------------------------------------------------- */

function wireFileImport() {

  const input =
    document.getElementById(
      "inputArchivoCSV"
    );

  if (!input) {

    console.warn(
      "No se encontró #inputArchivoCSV."
    );

    return;
  }


  input.addEventListener(
    "change",
    async e => {

      const file =
        e.target.files[0];

      /*
        Limpiamos el input para permitir
        seleccionar nuevamente el mismo archivo.
      */
      e.target.value = "";


      if (!file) {
        return;
      }


      try {

        /* ---------------------------------------------------------- */
        /* LEER ARCHIVO */
        /* ---------------------------------------------------------- */

        const text =
          await file.text();


        /* ---------------------------------------------------------- */
        /* PARSEAR CSV */
        /* ---------------------------------------------------------- */

        const parsed =
          parseCSV(text);


        /* ---------------------------------------------------------- */
        /* VALIDAR COLUMNAS */
        /* ---------------------------------------------------------- */

        const validation =
          validateColumns(
            parsed.headers
          );


        /* ---------------------------------------------------------- */
        /* NORMALIZAR DATOS */
        /* ---------------------------------------------------------- */

        const normalized =
          normalizeData(parsed);


        /* ---------------------------------------------------------- */
        /* VALIDAR REGISTROS */
        /* ---------------------------------------------------------- */

        if (
          !normalized.data ||
          !normalized.data.length
        ) {

          alert(
            "El archivo no contiene registros válidos " +
            "(falta la columna 'Modelo Planeación' " +
            "o está vacío)."
          );

          return;
        }


        /* ---------------------------------------------------------- */
        /* CARGAR RESULTADO */
        /* ---------------------------------------------------------- */

        applyLoadResult(
          {
            ...normalized,
            validation
          },
          file.name
        );


        /* ---------------------------------------------------------- */
        /* REINICIAR FILTROS */
        /* ---------------------------------------------------------- */

        resetFilters();


        document
          .querySelectorAll(".canal-tab")
          .forEach(b =>
            b.classList.remove("active")
          );


        const todas =
          document.querySelector(
            '.canal-tab[data-canal="TODAS"]'
          );

        if (todas) {
          todas.classList.add("active");
        }


        const buscarModelo =
          document.getElementById(
            "buscarModelo"
          );

        if (buscarModelo) {
          buscarModelo.value = "";
        }


        /* ---------------------------------------------------------- */
        /* ACTUALIZAR DASHBOARD */
        /* ---------------------------------------------------------- */

        updateDashboard();


        /* ---------------------------------------------------------- */
        /* ACTUALIZAR HORA */
        /* ---------------------------------------------------------- */

        const ultimaActualizacion =
          document.getElementById(
            "ultimaActualizacion"
          );

        if (ultimaActualizacion) {

          ultimaActualizacion.textContent =
            `Base actualizada: ${file.name} — ` +
            `${new Date().toLocaleString("es-MX")}`;
        }


      } catch (err) {

        console.error(
          "Error completo al cargar CSV:",
          err
        );

        alert(
          "No se pudo leer el archivo: " +
          err.message
        );
      }

    }
  );
}


/* ---------------------------------------------------------------------- */
/* INICIAR APLICACIÓN */
/* ---------------------------------------------------------------------- */

document.addEventListener(
  "DOMContentLoaded",
  init
);
```

  });
}

document.addEventListener("DOMContentLoaded", init);
