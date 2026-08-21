export type HomePageData = {
  city: string;
  date: string;
  time: string;
  weekday: string;
  temperature: string;
  apparentTemperature: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function renderHomePage(data: HomePageData): string {
  const city = escapeHtml(data.city);
  const date = escapeHtml(data.date);
  const time = escapeHtml(data.time);
  const weekday = escapeHtml(data.weekday);
  const temperature = escapeHtml(data.temperature);
  const apparentTemperature = escapeHtml(data.apparentTemperature);

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Local Now Server</title>
    <link rel="icon" href="https://nestjs.com/img/logo-small.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="https://nestjs.com/img/logo-small.svg" />
    <style>
      :root {
        --bg: #09090b;
        --card: #121216;
        --red: #e0234e;
        --text: #f4f4f5;
        --muted: #a1a1aa;
        --line: rgba(255, 255, 255, 0.08);
      }

      html {
        -webkit-text-size-adjust: 100%;
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        min-height: 100vh;
        min-height: 100dvh;
        display: grid;
        place-items: center;
        padding: max(1rem, env(safe-area-inset-top))
          max(1rem, env(safe-area-inset-right))
          max(1rem, env(safe-area-inset-bottom))
          max(1rem, env(safe-area-inset-left));
        color: var(--text);
        font-family:
          Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
        background:
          radial-gradient(900px 420px at 50% -10%, rgba(224, 35, 78, 0.22), transparent 55%),
          linear-gradient(180deg, #14080c 0%, var(--bg) 45%);
      }

      main {
        width: min(100%, 440px);
        padding: clamp(1.35rem, 4.5vw, 2.5rem) clamp(1rem, 4vw, 1.75rem);
        text-align: center;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 42%),
          var(--card);
        border: 1px solid var(--line);
        border-radius: clamp(20px, 5vw, 28px);
        box-shadow:
          0 0 0 1px rgba(224, 35, 78, 0.08),
          0 30px 80px rgba(0, 0, 0, 0.45);
      }

      .logo {
        width: clamp(56px, 16vw, 72px);
        height: clamp(56px, 16vw, 72px);
        margin: 0 auto 1.5rem;
        filter: drop-shadow(0 12px 28px rgba(224, 35, 78, 0.45));
      }

      .metrics {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.75rem;
        text-align: left;
      }

      .metric {
        padding: 0.95rem 1rem;
        border: 1px solid var(--line);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.03);
      }

      .metric span {
        display: block;
        color: var(--muted);
        font-size: 0.68rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .metric strong {
        display: block;
        margin-top: 0.45rem;
        font-size: clamp(1.05rem, 4.6vw, 1.15rem);
        font-weight: 650;
        letter-spacing: -0.03em;
        line-height: 1.25;
        overflow-wrap: anywhere;
        font-variant-numeric: tabular-nums;
      }

      .metric.wide strong {
        font-size: clamp(1.25rem, 6vw, 1.45rem);
      }

      .metric.temp strong {
        color: var(--red);
        font-size: clamp(1.25rem, 6vw, 1.45rem);
      }

      @media (min-width: 420px) {
        .metrics {
          grid-template-columns: 1fr 1fr;
        }

        .metric.wide {
          grid-column: 1 / -1;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <img
        class="logo"
        src="https://nestjs.com/img/logo-small.svg"
        width="72"
        height="72"
        alt="NestJS"
      />
      <section class="metrics">
        <article class="metric wide">
          <span>Cidade</span>
          <strong>${city}</strong>
        </article>
        <article class="metric">
          <span>Data</span>
          <strong>${weekday} ${date}</strong>
        </article>
        <article class="metric">
          <span>Hora</span>
          <strong>${time}</strong>
        </article>
        <article class="metric temp">
          <span>Temperatura</span>
          <strong>${temperature}</strong>
        </article>
        <article class="metric">
          <span>Sensação térmica</span>
          <strong>${apparentTemperature}</strong>
        </article>
      </section>
    </main>
  </body>
</html>
`;
}
