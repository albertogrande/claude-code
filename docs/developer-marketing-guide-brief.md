# Project Brief — "State of the Art in Developer Marketing" (living guide)

> Status: **context capture only — do not build yet.**
> Captured: 2026-07-05 · Owner: Alberto Grande (grande.temprado@gmail.com)

## 1. Objetivo del proyecto

Crear un **living guide del state of the art de developer marketing** — el mismo
concepto que este repo (`claude-code`, la field guide de Claude Code) pero
aplicado al mundo de **developer marketing / DevRel / developer experience**.

El producto se compone de:

1. **Guía canónica (evergreen).** Una referencia estructurada del estado del arte
   de developer marketing que **se va actualizando** a medida que aparece
   información nueva relevante. Es el equivalente a la colección `guide/`.

2. **Signals (señales diarias).** Un feed que **recoge a diario** las noticias /
   novedades importantes relacionadas con developer marketing, DevRel y developer
   experience, y las guarda como entradas fechadas. Es el equivalente a la
   colección `radar/`. (Nombre por decidir: "signals", "radar", "news"…)

3. **Artículos diarios (deep dives, condicionales).** Cuando **una señal es lo
   suficientemente relevante**, se produce un artículo más elaborado sobre ella.
   Equivalente a la colección `deep-dives/`.

4. **Bucle de realimentación.** Las señales/artículos se usan para **ir
   actualizando la guía canónica** (el "top of mind" / estado del arte de
   developer marketing). Señal relevante → puede generar artículo → alimenta la
   guía.

## 2. Dónde vive

- **NO** dentro del repo `claude-code`. Se creará un **repositorio nuevo y
  dedicado** exclusivamente a este proyecto de developer marketing.
- Este brief se guarda temporalmente en `claude-code` sólo como captura de
  contexto en la rama de trabajo; el proyecto real irá a su propio repo.

## 3. Qué reutilizar de `claude-code` (arquitectura de referencia)

Reusar la **arquitectura** y el **estilo gráfico** de este repo. Misma plataforma
y estética que la field guide de Claude Code, con el formato de "guía" y el
formato de "news/signals".

Arquitectura observada en `claude-code` (el molde a copiar):

- **Stack:** Astro 5 + GitHub Pages. Contenido **frontmatter-driven** para que un
  agente autónomo lo escriba de forma determinista.
- **Colecciones** (`src/content.config.ts`, esquemas zod):
  - `guide/` — referencia evergreen. Un fichero por sección: `NN-slug.md`.
    Frontmatter: `title, order, summary, updated`.
  - `radar/` — señales diarias fechadas: `YYYY-MM-DD-slug.md`.
    Frontmatter: `title, date, kind(enum), summary, take, tags, related, sources`.
  - `deep-dives/` — artículos largos investigados: `YYYY-MM-DD-slug.md`.
    Frontmatter: `title, date, updated?, summary, dek?, tags, related, sources`.
- **Skill autónoma** `.claude/skills/radar-scan/SKILL.md` — el playbook que barre
  fuentes, publica **una** entrada de radar al día (la más relevante y accionable)
  y refresca las secciones de guía afectadas. Reglas: sólo fuentes públicas y
  verificables, incluir `take` accionable, ≥1 `source`, `related` con cross-links.
- **Workflows** (`.github/workflows/`):
  - `radar.yml` — corre la skill a diario (cron `0 5 * * *` UTC) vía
    `anthropics/claude-code-action@v1`, commitea y deja que Deploy publique.
  - `deploy.yml` — build + publish a GitHub Pages.
  - `ci.yml` — build check.
  - Requiere secret `CLAUDE_CODE_OAUTH_TOKEN`.
- **Front-end:** `src/layouts/` (BaseLayout + ReadingLayout), `src/components/`
  (Chrome/nav, Head, Footer, Shortcuts ⌘K), `src/pages/` (index, guide/, radar/,
  deep-dives/, about, feed.xml.ts), `src/styles/main.scss` (design system,
  heredado de The Wire), `src/lib/site.ts` (base-path + fechas), búsqueda con
  Pagefind.

## 4. Referencia adicional: repo `the-wire`

- Alberto tiene un proyecto **público** en su GitHub: **`albertogrande/the-wire`**
  (URL: https://github.com/albertogrande/the-wire).
- Es el **original** en el que se inspiró la field guide de Claude Code. Recoge
  **señales diarias y predicciones** y tiene una estructura y unos **crons más
  avanzados**.
- Acción pendiente: **revisarlo** para tomar ideas de arquitectura de señales y de
  los crons antes de diseñar el repo nuevo.

## 5. Materia prima: referentes y fuentes de developer marketing

Referentes de **developer marketing puro para DevTools** (foco principal), además
de DevRel y developer experience. Recopilados y verificados el 2026-07-05.

### Referentes núcleo (los que sigue Alberto)

- **Jakub "Kuba" Czakon — Markepear** 🇵🇱 (developer marketing puro). Ex-CMO de
  neptune.ai. Framework por disciplinas (messaging, content, paid, launches, PR,
  OSS). https://www.markepear.dev/ · blog: https://www.markepear.dev/blog/developer-marketing-agencies
  · ejemplos: https://www.markepear.dev/examples
- **Lee Robinson** — ex-Vercel (VP Producto), ahora **VP of Developer Experience
  en Cursor**. "Education is the best form of developer marketing."
  https://leerob.com/ · guía: https://creatoreconomy.so/p/lee-the-ultimate-guide-to-developer-marketing
- **Adam Frankl** — autor de *The Developer Facing Startup* (playbook GTM del
  Alchemist Accelerator). Ex-VP/first marketing en Neo4j, JFrog, Sourcegraph.
  https://developerfacingstartup.dev/
- **Martín "Gonto" Gontovnikas** 🇦🇷 — empleado #6 y VP Marketing de Auth0;
  co-fundador de **Hypergrowth Partners**; podcast **code to market**.
  https://www.linkedin.com/in/mgonto/en · https://codetomarket.fm/ · https://www.hypergrowthpartners.com/

### Referentes / recursos adicionales descubiertos

- **Morgan Perry — DevTools Brew** (newsletter GTM/growth de DevTools).
- **Ronak Ganatra — Developer Marketing Alliance** y repo `awesome-developer-marketing`.
  https://github.com/ronakganatra/awesome-developer-marketing
- **Karl Hughes — Draft.dev** (technical content marketing). https://draft.dev/
- **FletchPMM** (positioning/messaging PLG/devtools).
- Especialistas (vía Markepear): **Zach Goldie** (messaging), **Nick Moore**
  (content), **Flo Merian** (launches), **Emily Omier** / **Nevo David** (OSS),
  **Itamar Ben Yair** (growth).
- **Tom Wentworth**, **Ashley Smith** (GitLab) — clásicos B2D/GTM.

### Podcast / directorios clave

- **Scaling DevTools** (Jack Bridger) — entrevistas a founders/marketers de
  DevTools. https://scalingdevtools.com/ · episodios con Gonto y análisis de Lee.
- **jackbridger/developer-newsletters** — lista de newsletters de devs + cómo
  patrocinarlas. https://github.com/jackbridger/developer-newsletters
- **reo.dev — developer marketing resources 2026**:
  https://www.reo.dev/blog/developer-marketing-resources-2026

### Cautelas de verificación

- Circulaba que neptune.ai fue "adquirida por OpenAI" — **no verificado**, tratar
  con pinzas.
- Cargos cambian rápido (Lee ya pasó de Vercel a Cursor). Verificar al publicar.

## 6. Decisiones abiertas / siguientes pasos (aún NO ejecutar)

- [ ] Revisar `albertogrande/the-wire` (crons y estructura de señales avanzada).
- [ ] Nombre del proyecto y del repo nuevo; slug/base path del sitio.
- [ ] Nombre de la colección de señales ("signals" vs "radar" vs "news").
- [ ] Alcance temático: ¿sólo developer marketing, o también DevRel + DevEx? (el
      objetivo dice que las señales cubren los tres).
- [ ] Fuentes a barrer a diario para las señales (adaptar la lista de la skill
      `radar-scan` al dominio de dev marketing: Markepear, DevTools Brew,
      code to market, Scaling DevTools, Developer Marketing Alliance, etc.).
- [ ] Esquema de secciones de la guía canónica de developer marketing.
- [ ] Cadencia de crons y umbral de "señal suficientemente relevante" → artículo.
