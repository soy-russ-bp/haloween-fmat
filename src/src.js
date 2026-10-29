
const url = window.FMAT_CONFIG?.supabaseUrl;
const key = window.FMAT_CONFIG?.supabaseKey;

const db =
  url &&
  key &&
  !url.includes("TU-PROYECTO") &&
  !key.includes("TU_CLAVE") &&
  window.supabase
    ? window.supabase.createClient(url, key)
    : null;

const app = document.querySelector("#app");

const careers = [
  "Ingeniería de Software",
  "Ingeniería en Computación",
  "Licenciatura en Ciencias de la Computación",
  "Licenciatura en Matemáticas",
  "Licenciatura en Enseñanzas de Matemáticas",
  "Licenciatura en Actuaría",
  
];

function normalizar(texto) {
  return texto
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleUpperCase("es-MX");
}

function render() {
  app.innerHTML = `
    <main class="page">
      <header>
        <div class="wolf">🐺 <strong>FMAT</strong></div>
        <span class="tag">30 OCT · PLAZA ROJA · 12 PM</span>
      </header>

      <section class="hero">
        <div class="moon">☾</div>
        <div class="eyebrow">🎃 HALLOWEEN FMAT 2026 🎃</div>

        <h1>
          CONCURSO DE<br>
          <em>DISFRACES</em> FMAT
        </h1>

        <p>
          ¡Ven al Halloween FMAT a crear comunidad
          y participa por increíbles premios!
        </p>
      </section>

      <section class="panel" id="panel">
        <div class="panel-top">
          ☠️ REGISTRO DE PARTICIPANTES
          <span>01 / 01</span>
        </div>

        <form id="register">

          <label for="costume">
            NOMBRE DEL DISFRAZ <b>*</b>
          </label>
          <input
            id="costume"
            name="costume"
            maxlength="120"
            placeholder="Ej. Batman, Catrina, Vampiro..."
            required
          >

          <label for="member">
            NOMBRE COMPLETO DEL INTEGRANTE <b>*</b>
          </label>
          <input
            id="member"
            name="member"
            maxlength="120"
            placeholder="Nombre y apellido"
            required
          >

          <label for="career">CARRERA <b>*</b></label>
          <select id="career" name="career" required>
            <option value="">Selecciona tu carrera</option>
            ${careers.map(c => `
              <option value="${c}">${c}</option>
            `).join("")}
          </select>

          <fieldset>
            <legend>
              ¿ALGUIEN TE INVITÓ A INSCRIBIRTE? <b>*</b>
            </legend>

            <label class="choice">
              <input
                type="radio"
                name="invited"
                value="yes"
                required
              >
              Sí, alguien me invitó
            </label>

            <label class="choice">
              <input
                type="radio"
                name="invited"
                value="no"
                required
              >
              No, me inscribo por mi cuenta
            </label>
          </fieldset>

          <div id="referral" hidden>
            <label for="referrer">
              ¿QUIÉN TE INVITÓ? <b>*</b>
            </label>

            <input
              id="referrer"
              name="referrer"
              maxlength="120"
              placeholder="NOMBRE Y APELLIDO"
              autocomplete="off"
            >

            <small>
              Escribe nombre y apellido.
              Se guardará en MAYÚSCULAS.
            </small>
          </div>

          <p id="error" role="alert" aria-live="polite"></p>

          <button id="submit" type="submit">
            ⚡ REGISTRARME ⚡
          </button>

          <p class="note">
            Actividad exclusiva para estudiantes de FMAT.
            Inscripción gratuita.
          </p>
        </form>
      </section>

      <footer>
        FMAT · CREANDO COMUNIDAD · HALLOWEEN 2026
      </footer>
    </main>
  `;

  const form = document.querySelector("#register");
  const referral = document.querySelector("#referral");
  const refInput = document.querySelector("#referrer");
  const error = document.querySelector("#error");

  form.querySelectorAll('[name="invited"]').forEach(radio => {
    radio.addEventListener("change", () => {
      const yes = form.elements.invited.value === "yes";

      referral.hidden = !yes;
      refInput.required = yes;

      if (!yes) refInput.value = "";
    });
  });

  refInput.addEventListener("input", () => {
    const start = refInput.selectionStart;
    const end = refInput.selectionEnd;

    refInput.value = refInput.value.toLocaleUpperCase("es-MX");

    try {
      refInput.setSelectionRange(start, end);
    } catch {}
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    error.textContent = "";

    const yes = form.elements.invited.value === "yes";
    const participant = normalizar(form.elements.member.value);
    const inviter = yes ? normalizar(refInput.value) : null;

    if (participant.split(" ").length < 2) {
      error.textContent = "Escribe tu nombre y apellido.";
      return;
    }

    if (yes && (!inviter || inviter.split(" ").length < 2)) {
      error.textContent =
        "Escribe nombre y apellido de quien te invitó.";
      return;
    }

    if (yes && inviter === participant) {
      error.textContent = "No puedes invitarte a ti mismo.";
      return;
    }

    if (!db) {
      error.textContent =
        "Falta configurar Supabase. Revisa config.js.";
      return;
    }

    const btn = document.querySelector("#submit");
    btn.disabled = true;
    btn.textContent = "REGISTRANDO...";

    let dbError = null;

    try {
      const result = await db
        .from("inscripciones")
        .insert({
          disfraz: form.elements.costume.value.trim(),
          integrante: participant,
          carrera: form.elements.career.value,
          invitado: yes,
          invitado_por: inviter
        });

      dbError = result.error;
    } catch (ex) {
      dbError = ex;
    }

    btn.disabled = false;
    btn.textContent = "⚡ REGISTRARME ⚡";

    if (dbError) {
      error.textContent =
        "Error al guardar: " +
        (dbError.message || "Revisa tu conexión.");

      console.error(dbError);
      return;
    }

    document.querySelector("#panel").innerHTML = `
      <div class="success">
        <div class="pumpkin">🎃</div>

        <h2>
          ¡INSCRIPCIÓN<br>
          <em>EXITOSA!</em>
        </h2>

        <p>
          Gracias por inscribirte al concurso
          de disfraces FMAT.
        </p>

        <p>¡Nos vemos en Halloween FMAT!</p>

        <button id="again">
          VOLVER AL INICIO
        </button>
      </div>
    `;

    document.querySelector("#again").onclick = render;
  });
}

render();
